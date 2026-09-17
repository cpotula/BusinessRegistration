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
public class TestimonialsController : ControllerBase
{
    private readonly AppDbContext _db;

    public TestimonialsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("mine")]
    [Authorize]
    public async Task<IActionResult> Mine(int businessId)
    {
        var userId = GetUserId();
        var review = await _db.Testimonials
            .Where(t => t.BusinessId == businessId && t.UserId == userId)
            .OrderByDescending(t => t.CreatedAt)
            .FirstOrDefaultAsync();
        if (review is null)
            return Ok((TestimonialDto?)null);
        return Ok(new TestimonialDto(review.Id, review.CustomerName, review.Rating, review.ReviewText, review.CreatedAt, false));
    }

    [HttpPost]
    [Authorize(Roles = "Customer,Admin")]
    public async Task<IActionResult> Submit([FromQuery] int businessId, [FromBody] TestimonialCreateRequest request)
    {
        var business = await _db.Businesses
            .FirstOrDefaultAsync(b => b.Id == businessId && b.IsActive && b.IsPublished);
        if (business is null)
            return NotFound();

        var userId = GetUserId();
        var alreadyReviewed = await _db.Testimonials
            .AnyAsync(t => t.BusinessId == businessId && t.UserId == userId);
        if (alreadyReviewed)
            return BadRequest(new { message = "You have already reviewed this business." });

        var name = !string.IsNullOrWhiteSpace(request.CustomerName)
        ? request.CustomerName! 
        : (User.FindFirstValue(ClaimTypes.Name) ?? "Customer");

        var testimonial = new Testimonial
        {
            BusinessId = businessId,
            UserId = userId,
            CustomerName = name,
            Rating = request.Rating,
            ReviewText = request.ReviewText,
            IsApproved = false
        };
        _db.Testimonials.Add(testimonial);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Thank you! Your review will appear once approved." });
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
