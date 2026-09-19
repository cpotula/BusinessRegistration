using BusinessPortal.API.Data;
using BusinessPortal.API.DTOs;
using BusinessPortal.API.Models;
using BusinessPortal.API.Plans;
using BusinessPortal.API.Search;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace BusinessPortal.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ProductsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetByBusiness([FromQuery] int businessId)
    {
        var business = await _db.Businesses.FindAsync(businessId);
        if (business is null)
            return NotFound();

        // Public visitors only see products of active, published businesses.
        // Owners and admins can preview their own drafts.
        if ((!business.IsActive || !business.IsPublished) && !CanManage(business))
            return NotFound();

        var manage = CanManage(business);
        var products = await _db.Products
            .Include(p => p.Images)
            .Include(p => p.Videos)
            .Where(p => p.BusinessId == businessId && (manage || (p.IsActive && p.IsApproved)))
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => ToDto(p))
            .ToListAsync();

        return Ok(products);
    }

    // Public product search across all published, active businesses.
    // Powers the home-page search box and the search results page.
    [HttpGet("search")]
    [AllowAnonymous]
    public async Task<IActionResult> Search([FromQuery] string? q, [FromQuery] int page = 1, [FromQuery] int pageSize = 12)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var query = _db.Products
            .Include(p => p.Business)
            .Include(p => p.Images)
            .Where(p => p.IsActive && p.IsApproved && p.Business!.IsActive && p.Business.IsPublished);

        // Synonym-aware search matches a product when every word of the query
        // (expanded with synonyms, e.g. "maggam" -> blouse, "decor" -> home
        // decoration, "bugger" -> burger) appears in its name, description or
        // business name. Filtered in memory so the query stays transportable.
        var termSets = (!string.IsNullOrWhiteSpace(q) ? q : "")
            .Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(w => ProductSynonyms.Expand(w.Trim().ToLower()))
            .ToList();

        var matches = (await query.ToListAsync())
            .Where(p =>
            {
                if (termSets.Count == 0) return true;
                var name = p.Name.ToLower();
                var desc = p.Description?.ToLower() ?? "";
                var brand = p.Business!.Name.ToLower();
                return termSets.All(ts => ts.Any(t => name.Contains(t) || desc.Contains(t) || brand.Contains(t)));
            })
            .OrderByDescending(p => p.CreatedAt)
            .ToList();

        var total = matches.Count;

        // Approved ratings per product so the product cards can show the
        // review score and review count (e.g. "4.0 ★ (3)").
        var matchedIds = matches.Select(p => p.Id).ToList();
        var ratingGroups = await _db.ProductReviews
            .Where(r => r.IsApproved && matchedIds.Contains(r.ProductId))
            .GroupBy(r => r.ProductId)
            .ToListAsync();
        var avgById = ratingGroups.ToDictionary(g => g.Key, g => Math.Round(g.Average(x => x.Rating), 1));
        var countById = ratingGroups.ToDictionary(g => g.Key, g => g.Count());

        var items = matches
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(p => new ProductSearchItemDto(
                p.Id, p.Name, p.Description, p.Price, p.StockQuantity,
                p.Images.OrderBy(i => i.SortOrder).Select(i => i.Url).FirstOrDefault(),
                p.BusinessId, p.Business!.Name, p.Business.Slug,
                avgById.GetValueOrDefault(p.Id), countById.GetValueOrDefault(p.Id)))
            .ToList();

        return Ok(new { items, total, page, pageSize });
    }

    // Product details page - public for active products of published businesses.
    // Owners/admins can preview their own inactive or unpublished items.
    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var product = await _db.Products
            .Include(p => p.Images)
            .Include(p => p.Videos)
            .Include(p => p.Business)
            .ThenInclude(b => b!.Category)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product?.Business is null)
            return NotFound();

        var business = product.Business;
        if ((!business.IsActive || !business.IsPublished || !product.IsActive || !product.IsApproved) && !CanManage(business))
            return NotFound();

        return Ok(new ProductDetailDto(
            product.Id, product.Name, product.Description, product.Price, product.StockQuantity,
            product.Images.OrderBy(i => i.SortOrder).Select(i => i.Url),
            product.Videos.OrderBy(v => v.SortOrder).Select(v => new ProductVideoDto(v.Id, v.Url, v.Title)),
            business.Id, business.Name, business.Slug,
            business.Category!.Name, business.City, business.LogoUrl,
            business.ContactPhone, business.ContactWhatsApp));
    }

    // Public product reviews: approved only, Flipkart-style with a
    // "verified buyer" badge when the reviewer had this product delivered.
    [HttpGet("{id:int}/reviews")]
    [AllowAnonymous]
    public async Task<IActionResult> GetReviews(int id)
    {
        var product = await _db.Products
            .Include(p => p.Business)
            .FirstOrDefaultAsync(p => p.Id == id);
        var business = product?.Business;
        if (business is null)
            return NotFound();
        if ((!business.IsActive || !business.IsPublished || !product!.IsActive || !product.IsApproved) && !CanManage(business))
            return NotFound();

        var approved = await _db.ProductReviews
            .Where(r => r.ProductId == id && r.IsApproved)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        var verifiedBuyerIds = await _db.Orders
            .Where(o => o.Status == "Delivered")
            .Where(o => o.Items.Any(i => i.ProductId == id))
            .Select(o => o.CustomerUserId)
            .Distinct()
            .ToListAsync();
        var verifiedSet = verifiedBuyerIds.ToHashSet();

        var averageRating = approved.Count > 0 ? approved.Average(r => r.Rating) : 0;
        return Ok(new ProductReviewsResult(
            Math.Round(averageRating, 1), approved.Count,
            approved.Select(r => new ProductReviewDto(
                r.Id, r.CustomerName, r.Rating, r.ReviewText, r.CreatedAt,
                r.UserId.HasValue && verifiedSet.Contains(r.UserId.Value)))));
    }

    // Whether the signed-in user is allowed to leave a review for this
    // product. Reviews are collected from customers after their order has
    // been delivered, so the form is shown only then (admins may always post).
    [HttpGet("{id:int}/review-eligibility")]
    [Authorize]
    public async Task<IActionResult> GetReviewEligibility(int id)
    {
        var userId = GetUserId();

        if (User.IsInRole(nameof(UserRole.Admin)))
            return Ok(new ReviewEligibilityDto(true, null, 0));

        var deliveredCount = await _db.Orders
            .CountAsync(o => o.CustomerUserId == userId
                && o.Status == "Delivered"
                && o.Items.Any(i => i.ProductId == id));

        if (deliveredCount > 0)
            return Ok(new ReviewEligibilityDto(true, null, deliveredCount));

        return Ok(new ReviewEligibilityDto(false,
            "You can rate & review this product after your order is delivered.", 0));
    }

    [HttpGet("{id:int}/my-review")]
    [Authorize]
    public async Task<IActionResult> MyReview(int id)
    {
        var review = await _db.ProductReviews
            .Where(r => r.ProductId == id && r.UserId == GetUserId())
            .OrderByDescending(r => r.CreatedAt)
            .FirstOrDefaultAsync();
        if (review is null)
            return Ok((ProductReviewDto?)null);
        return Ok(new ProductReviewDto(review.Id, review.CustomerName, review.Rating, review.ReviewText, review.CreatedAt, false));
    }

    [HttpPost("{id:int}/reviews")]
    [Authorize(Roles = "Customer,Admin")]
    public async Task<IActionResult> CreateReview(int id, [FromBody] ProductReviewCreateRequest request)
    {
        var product = await _db.Products
            .Include(p => p.Business)
            .FirstOrDefaultAsync(p => p.Id == id);
        var business = product?.Business;
        if (business is null || !business.IsActive || !business.IsPublished || !product!.IsActive || !product.IsApproved)
            return NotFound();

        var userId = GetUserId();
        var alreadyReviewed = await _db.ProductReviews
            .AnyAsync(r => r.ProductId == id && r.UserId == userId);
        if (alreadyReviewed)
            return BadRequest(new { message = "You have already reviewed this product." });

        // Reviews are collected after delivery: a customer may review only the
        // products that have actually been delivered to them. Admins may post
        // reviews on any product.
        var isDeliveredBuyer = User.IsInRole(nameof(UserRole.Admin)) ||
            await _db.Orders.AnyAsync(o => o.CustomerUserId == userId
                && o.Status == "Delivered"
                && o.Items.Any(i => i.ProductId == id));
        if (!isDeliveredBuyer)
            return BadRequest(new { message = "You can review this product only after your order is delivered." });

        var review = new ProductReview
        {
            ProductId = id,
            UserId = userId,
            CustomerName = User.FindFirstValue(ClaimTypes.Name) ?? "Customer",
            Rating = request.Rating,
            ReviewText = request.ReviewText,
            IsApproved = false
        };
        _db.ProductReviews.Add(review);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Thank you! Your review will appear once approved." });
    }

    [HttpPost]
    [Authorize(Roles = "BusinessOwner,Admin")]
    public async Task<IActionResult> Create(int businessId, [FromBody] ProductCreateRequest request)
    {
        var business = await _db.Businesses.FindAsync(businessId);
        if (business is null)
            return NotFound();

        if (!IsAdmin() && business.OwnerUserId != GetUserId())
            return Forbid();

        var usage = await SubscriptionsController.ComputeUsage(_db, businessId);
        if (usage.ProductLimit is int limit && usage.ProductCount >= limit)
            return BadRequest(new { message = $"Your {usage.PlanName} plan allows selling up to {limit} products. Upgrade to Standard (60 products) or Gold (unlimited) to list more." });

        var product = new Product
        {
            BusinessId = businessId,
            Name = request.Name,
            Description = request.Description,
            Price = request.Price,
            StockQuantity = request.StockQuantity ?? 10,
            IsActive = true,
            IsApproved = false
        };
        _db.Products.Add(product);
        await _db.SaveChangesAsync();
        return Ok(product.Id);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "BusinessOwner,Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] ProductUpdateRequest request)
    {
        var product = await _db.Products
            .Include(p => p.Business)
            .FirstOrDefaultAsync(p => p.Id == id);
        if (product is null)
            return NotFound();

        if (!IsAdmin() && product.Business!.OwnerUserId != GetUserId())
            return Forbid();

        product.Name = request.Name;
        product.Description = request.Description;
        product.Price = request.Price;
        product.IsActive = request.IsActive;
        if (request.StockQuantity is not null)
            product.StockQuantity = request.StockQuantity.Value;
        product.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("{id:int}/inventory")]
    [Authorize(Roles = "BusinessOwner,Admin")]
    public async Task<IActionResult> UpdateInventory(int id, [FromBody] ProductInventoryUpdateRequest request)
    {
        var product = await _db.Products
            .Include(p => p.Business)
            .FirstOrDefaultAsync(p => p.Id == id);
        if (product is null)
            return NotFound();

        if (!IsAdmin() && product.Business!.OwnerUserId != GetUserId())
            return Forbid();

        if (request.Price is not null)
        {
            if (request.Price < 0)
                return BadRequest(new { message = "Price cannot be negative." });
            product.Price = request.Price;
        }

        if (request.StockQuantity is not null)
        {
            if (request.StockQuantity < 0)
                return BadRequest(new { message = "Stock quantity cannot be negative." });
            product.StockQuantity = request.StockQuantity.Value;
        }

        product.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "BusinessOwner,Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var product = await _db.Products
            .Include(p => p.Business)
            .FirstOrDefaultAsync(p => p.Id == id);
        if (product is null)
            return NotFound();

        if (!IsAdmin() && product.Business!.OwnerUserId != GetUserId())
            return Forbid();

        _db.Products.Remove(product);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id:int}/images")]
    [Authorize(Roles = "BusinessOwner,Admin")]
    public async Task<IActionResult> AddImages(int id, [FromBody] IEnumerable<string> urls)
    {
        var product = await _db.Products
            .Include(p => p.Business)
            .FirstOrDefaultAsync(p => p.Id == id);
        if (product is null)
            return NotFound();

        if (!IsAdmin() && product.Business!.OwnerUserId != GetUserId())
            return Forbid();

        var existing = product.Images.Select(i => i.Url).ToHashSet(StringComparer.OrdinalIgnoreCase);
        var order = product.Images.Count;
        foreach (var url in urls)
        {
            if (string.IsNullOrWhiteSpace(url))
                continue;
            if (!existing.Add(url))
                continue;
            _db.ProductImages.Add(new ProductImage { ProductId = id, Url = url, SortOrder = order++ });
        }
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}/images/{imageId:int}")]
    [Authorize(Roles = "BusinessOwner,Admin")]
    public async Task<IActionResult> DeleteImage(int id, int imageId)
    {
        var product = await _db.Products
            .Include(p => p.Business)
            .FirstOrDefaultAsync(p => p.Id == id);
        if (product is null)
            return NotFound();

        if (!IsAdmin() && product.Business!.OwnerUserId != GetUserId())
            return Forbid();

        var image = await _db.ProductImages.FirstOrDefaultAsync(i => i.Id == imageId && i.ProductId == id);
        if (image is null)
            return NotFound();

        _db.ProductImages.Remove(image);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id:int}/videos")]
    [Authorize(Roles = "BusinessOwner,Admin")]
    public async Task<IActionResult> AddVideo(int id, [FromBody] ProductVideoDto request)
    {
        var product = await _db.Products
            .Include(p => p.Business)
            .FirstOrDefaultAsync(p => p.Id == id);
        if (product is null)
            return NotFound();

        if (!IsAdmin() && product.Business!.OwnerUserId != GetUserId())
            return Forbid();

        var video = new ProductVideo
        {
            ProductId = id,
            Url = request.Url,
            Title = request.Title,
            SortOrder = product.Videos.Count
        };
        _db.ProductVideos.Add(video);
        await _db.SaveChangesAsync();
        return Ok(video.Id);
    }

    [HttpDelete("{id:int}/videos/{videoId:int}")]
    [Authorize(Roles = "BusinessOwner,Admin")]
    public async Task<IActionResult> DeleteVideo(int id, int videoId)
    {
        var product = await _db.Products
            .Include(p => p.Business)
            .FirstOrDefaultAsync(p => p.Id == id);
        if (product is null)
            return NotFound();

        if (!IsAdmin() && product.Business!.OwnerUserId != GetUserId())
            return Forbid();

        var video = await _db.ProductVideos.FirstOrDefaultAsync(v => v.Id == videoId && v.ProductId == id);
        if (video is null)
            return NotFound();

        _db.ProductVideos.Remove(video);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    private bool IsAdmin() => User.IsInRole(nameof(UserRole.Admin));

    private bool CanManage(Business business)
    {
        if (User.Identity is not { IsAuthenticated: true })
            return false;

        if (User.IsInRole(nameof(UserRole.Admin)))
            return true;

        return business.OwnerUserId == GetUserId();
    }

    private static ProductDto ToDto(Product p) => new(
        p.Id, p.Name, p.Description, p.Price, p.IsActive, p.IsApproved, p.StockQuantity,
        p.Images.OrderBy(i => i.SortOrder).Select(i => i.Url),
        p.Videos.OrderBy(v => v.SortOrder).Select(v => new ProductVideoDto(v.Id, v.Url, v.Title)));
}
