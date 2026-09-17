using BusinessPortal.API.Data;
using BusinessPortal.API.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BusinessPortal.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnnouncementsController : ControllerBase
{
    private readonly AppDbContext _db;

    public AnnouncementsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetLatest([FromQuery] int take = 5)
    {
        var items = await _db.Announcements
            .OrderByDescending(a => a.CreatedAt)
            .Take(Math.Clamp(take, 1, 20))
            .Select(a => new AnnouncementDto(a.Id, a.Title, a.Message, a.Audience, a.CreatedAt))
            .ToListAsync();
        return Ok(items);
    }
}
