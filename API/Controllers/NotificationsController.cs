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
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly AppDbContext _db;

    public NotificationsController(AppDbContext db)
    {
        _db = db;
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetMy()
    {
        var userId = GetUserId();
        var list = await _db.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .ToListAsync();
        return Ok(list.Select(ToDto));
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        var count = await _db.Notifications.CountAsync(n => n.UserId == GetUserId() && !n.IsRead);
        return Ok(new { count });
    }

    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkRead(int id)
    {
        var n = await _db.Notifications.FirstOrDefaultAsync(x => x.Id == id && x.UserId == GetUserId());
        if (n is null)
            return NotFound(new { message = "Notification not found." });
        n.IsRead = true;
        await _db.SaveChangesAsync();
        return Ok(ToDto(n));
    }

    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllRead()
    {
        var mine = await _db.Notifications.Where(n => n.UserId == GetUserId() && !n.IsRead).ToListAsync();
        foreach (var n in mine)
            n.IsRead = true;
        await _db.SaveChangesAsync();
        return Ok(new { count = mine.Count });
    }

    private static NotificationDto ToDto(Notification n) =>
        new(n.Id, n.Title, n.Message, n.Link, n.IsRead, n.CreatedAt);
}