using BusinessPortal.API.Data;
using BusinessPortal.API.DTOs;
using BusinessPortal.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BusinessPortal.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly AppDbContext _db;

    public CategoriesController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        var categories = await _db.Categories
            .OrderBy(c => c.SortOrder)
            .Select(c => new CategoryDto(c.Id, c.Name, c.Slug))
            .ToListAsync();
        return Ok(categories);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CategoryCreateRequest request)
    {
        var slug = Slugify(request.Name);
        if (await _db.Categories.AnyAsync(c => c.Slug == slug))
            return BadRequest(new { message = "A category with this name already exists." });

        var category = new Category
        {
            Name = request.Name,
            Slug = slug,
            SortOrder = await _db.Categories.CountAsync()
        };
        _db.Categories.Add(category);
        await _db.SaveChangesAsync();
        return Ok(new CategoryDto(category.Id, category.Name, category.Slug));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] CategoryUpdateRequest request)
    {
        var category = await _db.Categories.FindAsync(id);
        if (category is null)
            return NotFound();

        var slug = Slugify(request.Name);
        if (await _db.Categories.AnyAsync(c => c.Slug == slug && c.Id != id))
            return BadRequest(new { message = "A category with this name already exists." });

        category.Name = request.Name;
        category.Slug = slug;
        await _db.SaveChangesAsync();
        return Ok(new CategoryDto(category.Id, category.Name, category.Slug));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var category = await _db.Categories.FindAsync(id);
        if (category is null)
            return NotFound();

        if (await _db.Businesses.AnyAsync(b => b.CategoryId == id))
            return BadRequest(new { message = "Cannot delete a category that has businesses." });

        _db.Categories.Remove(category);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    internal static string Slugify(string value)
    {
        var slug = value.ToLowerInvariant().Trim();
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"[^a-z0-9\s-]", "");
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"\s+", "-");
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"-+", "-");
        return slug.Trim('-');
    }
}
