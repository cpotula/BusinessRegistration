using BusinessPortal.API.Data;
using BusinessPortal.API.DTOs;
using BusinessPortal.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace BusinessPortal.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BusinessesController : ControllerBase
{
    private readonly AppDbContext _db;

    public BusinessesController(AppDbContext db)
    {
        _db = db;
    }

    // Public directory listing. Search covers business name, description, city
    // AND active product/service names & descriptions (doc: "Search by business
    // name, category, product/service, or location").
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll([FromQuery] string? q, [FromQuery] int? categoryId,
        [FromQuery] string? city, [FromQuery] int page = 1, [FromQuery] int pageSize = 12)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var query = _db.Businesses
            .Include(b => b.Category)
            .Where(b => b.IsActive && b.IsPublished);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var term = q.Trim().ToLower();
            query = query.Where(b => b.Name.ToLower().Contains(term)
                || (b.Description != null && b.Description.ToLower().Contains(term))
                || (b.City != null && b.City.ToLower().Contains(term))
                || b.Products.Any(p => p.IsActive
                    && (p.Name.ToLower().Contains(term)
                        || (p.Description != null && p.Description.ToLower().Contains(term)))));
        }

        if (categoryId.HasValue)
            query = query.Where(b => b.CategoryId == categoryId.Value);

        if (!string.IsNullOrWhiteSpace(city))
            query = query.Where(b => b.City != null && b.City.ToLower() == city.ToLower().Trim());

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(b => b.SubscriptionExpiresOn)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(b => new BusinessSummaryDto(
                b.Id, b.Name, b.Slug, b.Category!.Name, b.Description, b.City,
                b.LogoUrl, b.IsActive, b.SubscriptionExpiresOn))
            .ToListAsync();

        return Ok(new { items, total, page, pageSize });
    }

    // Distinct cities for the directory filter dropdown.
    [HttpGet("cities")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCities()
    {
        var cities = await _db.Businesses
            .Where(b => b.IsActive && b.IsPublished && b.City != null && b.City != "")
            .OrderBy(b => b.City)
            .Select(b => b.City!)
            .Distinct()
            .ToListAsync();
        return Ok(cities);
    }

    [HttpGet("my")]
    [Authorize(Roles = "BusinessOwner")]
    public async Task<IActionResult> GetMine()
    {
        var userId = GetUserId();
        var businesses = await _db.Businesses
            .Where(b => b.OwnerUserId == userId)
            .OrderBy(b => b.Id)
            .Select(b => new BusinessSummaryDto(
                b.Id, b.Name, b.Slug, b.Category!.Name, b.Description, b.City,
                b.LogoUrl, b.IsActive, b.SubscriptionExpiresOn))
            .ToListAsync();
        return Ok(businesses);
    }

    // Friendly deep-link lookup for WhatsApp shares: /b/{slug} -> api/businesses/slug/{slug}.
    [HttpGet("slug/{slug}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var business = await LoadFull(slug);
        if (business is null || !await CanView(business))
            return NotFound();

        return Ok(await ToDetailDto(business));
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var business = await LoadFull(id);
        if (business is null || !await CanView(business))
            return NotFound();

        return Ok(await ToDetailDto(business));
    }

    // "Help the visitor continue discovering alternatives": same category first,
    // then same city, then most recently subscribed.
    [HttpGet("{id:int}/related")]
    [AllowAnonymous]
    public async Task<IActionResult> GetRelated(int id)
    {
        var business = await _db.Businesses.FindAsync(id);
        if (business is null)
            return NotFound();

        var related = await _db.Businesses
            .Where(b => b.Id != id && b.IsActive && b.IsPublished)
            .OrderByDescending(b => b.CategoryId == business.CategoryId)
            .ThenByDescending(b => b.City == business.City)
            .ThenByDescending(b => b.SubscriptionExpiresOn)
            .Take(4)
            .Select(b => new BusinessSummaryDto(
                b.Id, b.Name, b.Slug, b.Category!.Name, b.Description, b.City,
                b.LogoUrl, b.IsActive, b.SubscriptionExpiresOn))
            .ToListAsync();

        return Ok(related);
    }

    [HttpPost]
    [Authorize(Roles = "BusinessOwner")]
    public async Task<IActionResult> Create([FromBody] BusinessCreateRequest request)
    {
        if (!await _db.Categories.AnyAsync(c => c.Id == request.CategoryId))
            return BadRequest(new { message = "Selected category does not exist." });

        var slug = CategoriesController.Slugify(request.Name);
        if (string.IsNullOrEmpty(slug))
            return BadRequest(new { message = "Business name must contain letters or numbers." });

        if (await _db.Businesses.AnyAsync(b => b.Slug == slug))
            return BadRequest(new { message = "A business with this name already exists." });

        var business = new Business
        {
            OwnerUserId = GetUserId(),
            Name = request.Name,
            Slug = slug,
            CategoryId = request.CategoryId,
            Description = request.Description,
            ContactPhone = request.ContactPhone,
            ContactWhatsApp = request.ContactWhatsApp,
            ContactEmail = request.ContactEmail,
            Address = request.Address,
            City = request.City,
            WebsiteUrl = request.WebsiteUrl,
            BusinessHours = request.BusinessHours,
            LogoUrl = request.LogoUrl,
            CoverUrl = request.CoverUrl,
            // A newly created business is NOT shown publicly until an admin
            // approves it. It starts as pending: inactive + unpublished, so it
            // never appears in the public directory on its own.
            IsPublished = false,
            IsActive = false
        };

        _db.Businesses.Add(business);
        await _db.SaveChangesAsync();
        return Ok(business.Id);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "BusinessOwner,Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] BusinessUpdateRequest request)
    {
        var business = await _db.Businesses.FindAsync(id);
        if (business is null)
            return NotFound();

        if (!IsAdmin() && business.OwnerUserId != GetUserId())
            return Forbid();

        if (!await _db.Categories.AnyAsync(c => c.Id == request.CategoryId))
            return BadRequest(new { message = "Selected category does not exist." });

        var slug = CategoriesController.Slugify(request.Name);
        if (string.IsNullOrEmpty(slug))
            return BadRequest(new { message = "Business name must contain letters or numbers." });

        if (await _db.Businesses.AnyAsync(b => b.Slug == slug && b.Id != id))
            return BadRequest(new { message = "A business with this name already exists." });

        business.Name = request.Name;
        business.Slug = slug;
        business.CategoryId = request.CategoryId;
        business.Description = request.Description;
        business.ContactPhone = request.ContactPhone;
        business.ContactWhatsApp = request.ContactWhatsApp;
        business.ContactEmail = request.ContactEmail;
        business.Address = request.Address;
        business.City = request.City;
        business.WebsiteUrl = request.WebsiteUrl;
        business.BusinessHours = request.BusinessHours;
        business.LogoUrl = request.LogoUrl;
        business.CoverUrl = request.CoverUrl;
        business.IsPublished = request.IsPublished;
        business.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // Explicit publish/unpublish toggle ("Clear distinction between what is
    // being edited and what is publicly visible").
    [HttpPut("{id:int}/publish")]
    [Authorize(Roles = "BusinessOwner,Admin")]
    public async Task<IActionResult> SetPublished(int id, [FromBody] PublishRequest request)
    {
        var business = await _db.Businesses.FindAsync(id);
        if (business is null)
            return NotFound();

        if (!IsAdmin() && business.OwnerUserId != GetUserId())
            return Forbid();

        business.IsPublished = request.IsPublished;
        business.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "BusinessOwner,Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var business = await _db.Businesses.FindAsync(id);
        if (business is null)
            return NotFound();

        if (!IsAdmin() && business.OwnerUserId != GetUserId())
            return Forbid();

        _db.Businesses.Remove(business);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private async Task<Business?> LoadFull(int id) =>
        await _db.Businesses
            .Include(b => b.Category)
            .Include(b => b.Testimonials)
            .Include(b => b.Products)
            .FirstOrDefaultAsync(b => b.Id == id);

    private async Task<Business?> LoadFull(string slug) =>
        await _db.Businesses
            .Include(b => b.Category)
            .Include(b => b.Testimonials)
            .Include(b => b.Products)
            .FirstOrDefaultAsync(b => b.Slug == slug);

    // Published + active listings are public. Drafts, unpublished or expired
    // listings remain visible to their owner and admins (profile preview).
    private async Task<bool> CanView(Business business)
    {
        if (business.IsPublished && business.IsActive)
            return true;

        if (User.Identity is not { IsAuthenticated: true })
            return false;

        if (User.IsInRole(nameof(UserRole.Admin)))
            return true;

        return business.OwnerUserId == GetUserId();
    }

    private async Task<BusinessDetailDto> ToDetailDto(Business business)
    {
        var approved = business.Testimonials
            .Where(t => t.IsApproved)
            .OrderByDescending(t => t.CreatedAt)
            .ToList();

        var averageRating = approved.Count > 0 ? approved.Average(t => t.Rating) : 0;

        // Flipkart-style "verified buyer": customers with a confirmed order
        // from this business get a trust badge on their review.
        var verifiedBuyerIds = await _db.Orders
            .Where(o => o.Status == "Confirmed")
            .Where(o => o.Items.Any(i => i.BusinessId == business.Id))
            .Select(o => o.CustomerUserId)
            .Distinct()
            .ToListAsync();
        var verifiedSet = verifiedBuyerIds.ToHashSet();

        return new BusinessDetailDto(
            business.Id, business.Name, business.Slug, business.Category!.Name,
            business.Description, business.ContactPhone, business.ContactWhatsApp,
            business.ContactEmail, business.Address, business.City, business.LogoUrl,
            business.CoverUrl, business.WebsiteUrl, business.BusinessHours,
            business.IsPublished, business.IsActive, business.SubscriptionExpiresOn,
            Math.Round(averageRating, 1), business.Products.Count,
            approved.Select(t => new TestimonialDto(
                t.Id, t.CustomerName, t.Rating, t.ReviewText, t.CreatedAt,
                t.UserId.HasValue && verifiedSet.Contains(t.UserId.Value))));
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    private bool IsAdmin() => User.IsInRole(nameof(UserRole.Admin));
}
