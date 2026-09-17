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
public class EnquiriesController : ControllerBase
{
    private readonly AppDbContext _db;

    public EnquiriesController(AppDbContext db)
    {
        _db = db;
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> Submit(int businessId, [FromBody] EnquiryCreateRequest request)
    {
        var business = await _db.Businesses
            .FirstOrDefaultAsync(b => b.Id == businessId && b.IsActive && b.IsPublished);
        if (business is null)
            return NotFound();

        var enquiry = new Enquiry
        {
            BusinessId = businessId,
            Name = request.Name,
            Email = request.Email,
            Phone = request.Phone,
            Message = request.Message
        };
        _db.Enquiries.Add(enquiry);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Your enquiry has been sent to the business." });
    }

    [HttpPost("contact")]
    [AllowAnonymous]
    public async Task<IActionResult> Contact([FromBody] EnquiryCreateRequest request)
    {
        var enquiry = new Enquiry
        {
            BusinessId = null,
            Name = request.Name,
            Email = request.Email,
            Phone = request.Phone,
            Message = request.Message
        };
        _db.Enquiries.Add(enquiry);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Your message has been received. We will get back to you shortly." });
    }

    [HttpGet]
    [Authorize(Roles = "BusinessOwner,Admin")]
    public async Task<IActionResult> GetMine([FromQuery] bool? unreadOnly)
    {
        IQueryable<Enquiry> query = _db.Enquiries.Include(e => e.Business);

        if (!User.IsInRole(nameof(UserRole.Admin)))
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            query = query.Where(e => e.Business!.OwnerUserId == userId);
        }

        if (unreadOnly.HasValue && unreadOnly.Value)
            query = query.Where(e => !e.IsRead);

        var items = await query
            .OrderByDescending(e => e.CreatedAt)
            .Select(e => new
            {
                e.Id,
                e.Name,
                e.Email,
                e.Phone,
                e.Message,
                e.IsRead,
                e.CreatedAt,
                BusinessName = e.BusinessId == null ? "General Enquiry" : e.Business!.Name
            })
            .ToListAsync();

        return Ok(items);
    }

    [HttpPut("{id:int}/read")]
    [Authorize(Roles = "BusinessOwner,Admin")]
    public async Task<IActionResult> MarkRead(int id)
    {
        var enquiry = await _db.Enquiries.FindAsync(id);
        if (enquiry is null)
            return NotFound();

        if (!User.IsInRole(nameof(UserRole.Admin)))
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var owns = await _db.Businesses.AnyAsync(b => b.Id == enquiry.BusinessId && b.OwnerUserId == userId);
            if (!owns)
                return Forbid();
        }

        enquiry.IsRead = true;
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
