using BusinessPortal.API.Data;
using BusinessPortal.API.DTOs;
using BusinessPortal.API.Models;
using BusinessPortal.API.Plans;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace BusinessPortal.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SubscriptionsController : ControllerBase
{
    private readonly AppDbContext _db;

    public SubscriptionsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("plans")]
    [AllowAnonymous]
    public IActionResult GetPlans() => Ok(SubscriptionPlans.All);

    // Owner self-service renewal: Select Plan -> (payment placeholder) -> Pending
    // -> Admin activates on payment receipt.
    [HttpPost("renew")]
    [Authorize(Roles = "BusinessOwner")]
    public async Task<IActionResult> Renew([FromBody] RenewalRequest request)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var business = await _db.Businesses
            .FirstOrDefaultAsync(b => b.Id == request.BusinessId && b.OwnerUserId == userId);
        if (business is null)
            return NotFound(new { message = "Business not found." });

        var plan = SubscriptionPlans.Find(request.PlanName);
        if (plan is null)
            return BadRequest(new { message = "Unknown subscription plan." });

        var now = DateTime.UtcNow;
        // Extend from current expiry when renewing early, otherwise from today.
        var start = business.SubscriptionExpiresOn.HasValue && business.SubscriptionExpiresOn.Value > now
            ? business.SubscriptionExpiresOn.Value
            : now;

        var subscription = new Subscription
        {
            BusinessId = business.Id,
            PlanName = plan.Name,
            Amount = plan.Amount,
            PaymentMethod = null,
            PaymentStatus = SubscriptionStatus.Pending,
            StartDate = start,
            EndDate = start.AddMonths(plan.Months),
            Notes = "Self-service renewal request"
        };

        _db.Subscriptions.Add(subscription);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            subscription.Id,
            message = "Renewal requested. Online payment is coming soon - please coordinate payment with the administrator to activate your subscription."
        });
    }

    [HttpGet("my")]
    [Authorize(Roles = "BusinessOwner")]
    public async Task<IActionResult> GetMine()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var subscriptions = await _db.Subscriptions
            .Include(s => s.Business)
            .Where(s => s.Business!.OwnerUserId == userId)
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => ToDto(s))
            .ToListAsync();
        return Ok(subscriptions);
    }

    internal static async Task<SubscriptionUsageDto> ComputeUsage(AppDbContext db, int businessId)
    {
        var now = DateTime.UtcNow;
        var subscriptions = await db.Subscriptions
            .Where(s => s.BusinessId == businessId && s.PaymentStatus == SubscriptionStatus.Paid)
            .ToListAsync();
        var active = subscriptions
            .Where(s => s.EndDate >= now)
            .OrderByDescending(s => s.EndDate)
            .FirstOrDefault();

        var plan = active is not null ? SubscriptionPlans.Find(active.PlanName) : null;
        var count = await db.Products.CountAsync(p => p.BusinessId == businessId && p.IsActive);

        var remaining = plan?.ProductLimit is int limit ? Math.Max(limit - count, 0) : (int?)null;
        return new SubscriptionUsageDto(plan?.Name, plan?.ProductLimit, count, remaining);
    }

    // How many of the plan's allowed products this business is currently using.
    [HttpGet("usage")]
    [Authorize(Roles = "BusinessOwner,Admin")]
    public async Task<IActionResult> GetUsage([FromQuery] int businessId)
    {
        if (!await IsOwnBusiness(businessId))
            return Forbid();
        return Ok(await ComputeUsage(_db, businessId));
    }

    private async Task<bool> IsOwnBusiness(int businessId)
    {
        if (User.IsInRole("Admin")) return true;
        var business = await _db.Businesses.FindAsync(businessId);
        return business is not null && business.OwnerUserId == GetUserId();
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll([FromQuery] int? businessId, [FromQuery] string? status)
    {
        IQueryable<Subscription> query = _db.Subscriptions.Include(s => s.Business);
        if (businessId.HasValue)
            query = query.Where(s => s.BusinessId == businessId.Value);
        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<SubscriptionStatus>(status, true, out var parsed))
            query = query.Where(s => s.PaymentStatus == parsed);

        var subscriptions = await query
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => ToDto(s))
            .ToListAsync();
        return Ok(subscriptions);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] SubscriptionCreateRequest request)
    {
        var business = await _db.Businesses.FindAsync(request.BusinessId);
        if (business is null)
            return NotFound(new { message = "Business not found." });

        var subscription = new Subscription
        {
            BusinessId = business.Id,
            PlanName = request.PlanName,
            Amount = request.Amount,
            PaymentMethod = request.PaymentMethod,
            PaymentStatus = SubscriptionStatus.Paid,
            StartDate = request.StartDate.ToUniversalTime(),
            EndDate = request.EndDate.ToUniversalTime(),
            TransactionRef = request.TransactionRef,
            Notes = request.Notes
        };

        _db.Subscriptions.Add(subscription);
        business.SubscriptionExpiresOn = subscription.EndDate;
        business.IsActive = true;
        await _db.SaveChangesAsync();
        return Ok(subscription.Id);
    }

    // Record received payment and reactivate/extend the listing.
    [HttpPost("{id:int}/payment")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> RecordPayment(int id, [FromBody] SubscriptionRecordPaymentRequest request)
    {
        var subscription = await _db.Subscriptions
            .Include(s => s.Business)
            .FirstOrDefaultAsync(s => s.Id == id);
        if (subscription is null)
            return NotFound();

        subscription.PaymentStatus = SubscriptionStatus.Paid;
        subscription.PaymentMethod = request.PaymentMethod ?? subscription.PaymentMethod ?? "Manual";
        subscription.TransactionRef = request.TransactionRef ?? subscription.TransactionRef;
        subscription.Notes = request.Notes ?? subscription.Notes;

        if (subscription.Business is not null)
        {
            subscription.Business.SubscriptionExpiresOn = subscription.EndDate;
            subscription.Business.IsActive = true;
        }

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var subscription = await _db.Subscriptions.FindAsync(id);
        if (subscription is null)
            return NotFound();

        _db.Subscriptions.Remove(subscription);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static SubscriptionDto ToDto(Subscription s) => new(
        s.Id, s.BusinessId, s.Business?.Name ?? "Unknown", s.PlanName, s.Amount,
        s.PaymentMethod, s.PaymentStatus.ToString(), s.StartDate, s.EndDate,
        s.TransactionRef, s.Notes);
}
