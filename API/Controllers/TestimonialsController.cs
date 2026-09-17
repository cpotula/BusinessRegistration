using BusinessPortal.API.Data;
using BusinessPortal.API.DTOs;
using BusinessPortal.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> Submit(int businessId, [FromBody] TestimonialCreateRequest request)
    {
        var business = await _db.Businesses
            .FirstOrDefaultAsync(b => b.Id == businessId && b.IsActive && b.IsPublished);
        if (business is null)
            return NotFound();

        var testimonial = new Testimonial
        {
            BusinessId = businessId,
            CustomerName = request.CustomerName,
            Rating = request.Rating,
            ReviewText = request.ReviewText,
            IsApproved = false
        };
        _db.Testimonials.Add(testimonial);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Thank you! Your review will appear once approved." });
    }
}
