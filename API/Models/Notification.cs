using System.ComponentModel.DataAnnotations;

namespace BusinessPortal.API.Models;

// In-app message sent to a user, e.g. "your order has been confirmed".
public class Notification
{
    public int Id { get; set; }

    public int UserId { get; set; }

    [Required, MaxLength(120)]
    public string Title { get; set; } = string.Empty;

    [Required, MaxLength(500)]
    public string Message { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? Link { get; set; }

    public bool IsRead { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}