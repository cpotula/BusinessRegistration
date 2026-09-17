using BusinessPortal.API.Data;
using BusinessPortal.API.DTOs;
using BusinessPortal.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BusinessPortal.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _db;

    public AdminController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard()
    {
        var now = DateTime.UtcNow;
        var dto = new AdminDashboardDto(
            TotalUsers: await _db.Users.CountAsync(u => u.IsActive),
            TotalBusinesses: await _db.Businesses.CountAsync(),
            ActiveBusinesses: await _db.Businesses.CountAsync(b => b.IsActive),
            PendingBusinesses: await _db.Businesses.CountAsync(b => !b.IsActive && !b.IsPublished),
            PendingProducts: await _db.Products.CountAsync(p => !p.IsApproved),
            PendingTestimonials: await _db.Testimonials.CountAsync(t => !t.IsApproved),
            UnreadEnquiries: await _db.Enquiries.CountAsync(e => !e.IsRead),
            ActiveSubscriptions: await _db.Subscriptions.CountAsync(s => s.PaymentStatus == SubscriptionStatus.Paid && s.EndDate > now),
            ExpiringSoon: await _db.Businesses.CountAsync(b => b.IsActive
                && b.SubscriptionExpiresOn != null
                && b.SubscriptionExpiresOn >= now
                && b.SubscriptionExpiresOn <= now.AddDays(30)),
            ExpiredListings: await _db.Businesses.CountAsync(b =>
                b.SubscriptionExpiresOn != null && b.SubscriptionExpiresOn < now),
            PendingPayments: await _db.Subscriptions.CountAsync(s => s.PaymentStatus == SubscriptionStatus.Pending),
            MonthlyRevenue: await _db.Subscriptions
                .Where(s => s.PaymentStatus == SubscriptionStatus.Paid && s.EndDate >= now.AddMonths(-1))
                .SumAsync(s => s.Amount));
        return Ok(dto);
    }

    // "Expiring-soon list" - businesses whose subscription ends within N days.
    [HttpGet("expiring")]
    public async Task<IActionResult> Expiring([FromQuery] int days = 30)
    {
        var now = DateTime.UtcNow;
        var until = now.AddDays(Math.Clamp(days, 1, 365));

        var items = await _db.Businesses
            .Include(b => b.Category)
            .Include(b => b.OwnerUser)
            .Where(b => b.SubscriptionExpiresOn != null
                && b.SubscriptionExpiresOn >= now
                && b.SubscriptionExpiresOn <= until)
            .OrderBy(b => b.SubscriptionExpiresOn)
            .Select(b => new ExpiringBusinessDto(
                b.Id, b.Name, b.Category!.Name, b.City, b.OwnerUser!.Email,
                b.SubscriptionExpiresOn,
                EF.Functions.DateDiffDay(now, b.SubscriptionExpiresOn!.Value)))
            .ToListAsync();

        return Ok(items);
    }

    // Renewal requests waiting for payment confirmation / activation.
    [HttpGet("pending-payments")]
    public async Task<IActionResult> PendingPayments()
    {
        var items = await _db.Subscriptions
            .Include(s => s.Business)
            .Where(s => s.PaymentStatus == SubscriptionStatus.Pending)
            .OrderBy(s => s.CreatedAt)
            .Select(s => new
            {
                s.Id,
                s.BusinessId,
                BusinessName = s.Business!.Name,
                OwnerEmail = s.Business!.OwnerUser!.Email,
                s.PlanName,
                s.Amount,
                s.StartDate,
                s.EndDate,
                s.CreatedAt
            })
            .ToListAsync();

        return Ok(items);
    }

    [HttpGet("users")]
    public async Task<IActionResult> Users([FromQuery] string? role)
    {
        IQueryable<User> query = _db.Users;
        if (!string.IsNullOrWhiteSpace(role))
            query = query.Where(u => u.Role.ToString() == role);

        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new UserDto(u.Id, u.Name, u.Email, u.Phone, u.Role.ToString(), u.IsActive, u.CreatedAt))
            .ToListAsync();
        return Ok(users);
    }

    [HttpPut("users/{id:int}/role")]
    public async Task<IActionResult> SetRole(int id, [FromBody] SetUserRoleRequest request)
    {
        var user = await _db.Users.FindAsync(id);
        if (user is null)
            return NotFound();

        if (!Enum.TryParse<UserRole>(request.Role, out var role))
            return BadRequest(new { message = "Invalid role." });

        user.Role = role;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("users/{id:int}/active")]
    public async Task<IActionResult> SetActive(int id, [FromBody] SetUserActiveRequest request)
    {
        var user = await _db.Users.FindAsync(id);
        if (user is null)
            return NotFound();

        user.IsActive = request.IsActive;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("businesses")]
    public async Task<IActionResult> Businesses([FromQuery] string? status, [FromQuery] string? q)
    {
        var now = DateTime.UtcNow;
        IQueryable<Business> query = _db.Businesses.Include(b => b.Category).Include(b => b.OwnerUser);

        switch (status)
        {
            case "active":
                query = query.Where(b => b.IsActive);
                break;
            case "inactive":
                query = query.Where(b => !b.IsActive);
                break;
            case "expired":
                query = query.Where(b => b.SubscriptionExpiresOn != null && b.SubscriptionExpiresOn < now);
                break;
            case "expiring":
                query = query.Where(b => b.SubscriptionExpiresOn >= now && b.SubscriptionExpiresOn <= now.AddDays(30));
                break;
            case "draft":
                query = query.Where(b => !b.IsPublished);
                break;
            case "pending":
                query = query.Where(b => !b.IsActive && !b.IsPublished);
                break;
        }

        if (!string.IsNullOrWhiteSpace(q))
        {
            var term = q.Trim().ToLower();
            query = query.Where(b => b.Name.ToLower().Contains(term)
                || (b.City != null && b.City.ToLower().Contains(term))
                || b.OwnerUser!.Email.ToLower().Contains(term));
        }

        var items = await query
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => new AdminBusinessListItemDto(
                b.Id, b.Name, b.Slug, b.Category!.Name, b.OwnerUser!.Email, b.City,
                b.IsActive, b.IsPublished, b.SubscriptionExpiresOn, b.CreatedAt))
            .ToListAsync();
        return Ok(items);
    }

    [HttpPut("businesses/{id:int}/status")]
    public async Task<IActionResult> SetBusinessStatus(int id, [FromBody] bool isActive)
    {
        var business = await _db.Businesses.FindAsync(id);
        if (business is null)
            return NotFound();

        business.IsActive = isActive;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // Admin approval: activates AND publishes a newly registered business so it
    // appears on the public website. The business stays hidden until approved.
    [HttpPut("businesses/{id:int}/approve")]
    public async Task<IActionResult> ApproveBusiness(int id, [FromBody] bool approved)
    {
        var business = await _db.Businesses.FindAsync(id);
        if (business is null)
            return NotFound();

        business.IsActive = approved;
        business.IsPublished = approved;
        business.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // All products with their approval state. status=pending lists products
    // waiting for admin approval; status=approved lists approved ones.
    [HttpGet("products")]
    public async Task<IActionResult> Products([FromQuery] string? status)
    {
        IQueryable<Product> query = _db.Products
            .Include(p => p.Business!)
            .ThenInclude(b => b!.OwnerUser);

        switch (status?.ToLower())
        {
            case "pending":
                query = query.Where(p => !p.IsApproved);
                break;
            case "approved":
                query = query.Where(p => p.IsApproved);
                break;
        }

        var items = await query
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new AdminProductListItemDto(
                p.Id, p.Name, p.Description, p.Price,
                p.Images.OrderBy(i => i.SortOrder).Select(i => i.Url).FirstOrDefault(),
                p.BusinessId, p.Business!.Name, p.Business!.OwnerUser!.Email,
                p.IsActive, p.IsApproved, p.CreatedAt))
            .ToListAsync();

        return Ok(items);
    }

    // Admin approval of a product: approve=true shows it on the website,
    // approve=false keeps it hidden (pending). Only admins can do this.
    [HttpPut("products/{id:int}/approve")]
    public async Task<IActionResult> ApproveProduct(int id, [FromBody] bool approved)
    {
        var product = await _db.Products.FindAsync(id);
        if (product is null)
            return NotFound();

        product.IsApproved = approved;
        if (approved)
            product.IsActive = true;
        product.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("testimonials")]
    public async Task<IActionResult> Testimonials([FromQuery] bool? pendingOnly)
    {
        IQueryable<Testimonial> query = _db.Testimonials.Include(t => t.Business);
        if (pendingOnly.HasValue && pendingOnly.Value)
            query = query.Where(t => !t.IsApproved);

        var items = await query
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new
            {
                t.Id,
                t.CustomerName,
                t.Rating,
                t.ReviewText,
                t.IsApproved,
                t.CreatedAt,
                BusinessName = t.Business!.Name
            })
            .ToListAsync();
        return Ok(items);
    }

    [HttpPut("testimonials/{id:int}/approve")]
    public async Task<IActionResult> ApproveTestimonial(int id, [FromBody] bool approved)
    {
        var testimonial = await _db.Testimonials.FindAsync(id);
        if (testimonial is null)
            return NotFound();

        testimonial.IsApproved = approved;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("testimonials/{id:int}")]
    public async Task<IActionResult> DeleteTestimonial(int id)
    {
        var testimonial = await _db.Testimonials.FindAsync(id);
        if (testimonial is null)
            return NotFound();

        _db.Testimonials.Remove(testimonial);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("product-reviews")]
    public async Task<IActionResult> ProductReviews([FromQuery] bool? pendingOnly)
    {
        IQueryable<ProductReview> query = _db.ProductReviews.Include(r => r.Product).ThenInclude(p => p!.Business);
        if (pendingOnly.HasValue && pendingOnly.Value)
            query = query.Where(r => !r.IsApproved);

        var items = await query
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ProductReviewRow(
                r.Id, r.Product!.Name, r.Product!.Business!.Name,
                r.CustomerName, r.Rating, r.ReviewText, r.IsApproved))
            .ToListAsync();
        return Ok(items);
    }

    [HttpPut("product-reviews/{id:int}/approve")]
    public async Task<IActionResult> ApproveProductReview(int id, [FromBody] bool approved)
    {
        var review = await _db.ProductReviews.FindAsync(id);
        if (review is null)
            return NotFound();

        review.IsApproved = approved;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("product-reviews/{id:int}")]
    public async Task<IActionResult> DeleteProductReview(int id)
    {
        var review = await _db.ProductReviews.FindAsync(id);
        if (review is null)
            return NotFound();

        _db.ProductReviews.Remove(review);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("process-expirations")]
    public async Task<IActionResult> ProcessExpirations()
    {
        var now = DateTime.UtcNow;
        var expired = await _db.Businesses
            .Where(b => b.IsActive && b.SubscriptionExpiresOn != null && b.SubscriptionExpiresOn < now)
            .ToListAsync();

        foreach (var business in expired)
            business.IsActive = false;

        var affected = await _db.SaveChangesAsync();
        return Ok(new { disabled = affected });
    }

    [HttpGet("announcements")]
    public async Task<IActionResult> Announcements()
    {
        var items = await _db.Announcements
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new AnnouncementDto(a.Id, a.Title, a.Message, a.Audience, a.CreatedAt))
            .ToListAsync();
        return Ok(items);
    }

    [HttpPost("announcements")]
    public async Task<IActionResult> CreateAnnouncement([FromBody] AnnouncementCreateRequest request)
    {
        var announcement = new Announcement
        {
            Title = request.Title,
            Message = request.Message,
            Audience = request.Audience
        };
        _db.Announcements.Add(announcement);
        await _db.SaveChangesAsync();
        return Ok(new AnnouncementDto(announcement.Id, announcement.Title, announcement.Message, announcement.Audience, announcement.CreatedAt));
    }

    [HttpDelete("announcements/{id:int}")]
    public async Task<IActionResult> DeleteAnnouncement(int id)
    {
        var announcement = await _db.Announcements.FindAsync(id);
        if (announcement is null)
            return NotFound();

        _db.Announcements.Remove(announcement);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
