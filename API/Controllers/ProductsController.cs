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

        var products = await _db.Products
            .Include(p => p.Images)
            .Include(p => p.Videos)
            .Where(p => p.BusinessId == businessId && p.IsActive)
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
            .Where(p => p.IsActive && p.Business!.IsActive && p.Business.IsPublished);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var term = q.Trim().ToLower();
            query = query.Where(p =>
                p.Name.ToLower().Contains(term) ||
                (p.Description != null && p.Description.ToLower().Contains(term)) ||
                p.Business!.Name.ToLower().Contains(term));
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(p => new ProductSearchItemDto(
                p.Id, p.Name, p.Description, p.Price,
                p.Images.OrderBy(i => i.SortOrder).Select(i => i.Url).FirstOrDefault(),
                p.BusinessId, p.Business!.Name, p.Business.Slug))
            .ToListAsync();

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
        if ((!business.IsActive || !business.IsPublished || !product.IsActive) && !CanManage(business))
            return NotFound();

        return Ok(new ProductDetailDto(
            product.Id, product.Name, product.Description, product.Price,
            product.Images.OrderBy(i => i.SortOrder).Select(i => i.Url),
            product.Videos.OrderBy(v => v.SortOrder).Select(v => new ProductVideoDto(v.Id, v.Url, v.Title)),
            business.Id, business.Name, business.Slug,
            business.Category!.Name, business.City, business.LogoUrl,
            business.ContactPhone, business.ContactWhatsApp));
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

        var product = new Product
        {
            BusinessId = businessId,
            Name = request.Name,
            Description = request.Description,
            Price = request.Price,
            IsActive = true
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

        var order = product.Images.Count;
        foreach (var url in urls)
        {
            if (string.IsNullOrWhiteSpace(url))
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
        p.Id, p.Name, p.Description, p.Price, p.IsActive,
        p.Images.OrderBy(i => i.SortOrder).Select(i => i.Url),
        p.Videos.OrderBy(v => v.SortOrder).Select(v => new ProductVideoDto(v.Id, v.Url, v.Title)));
}
