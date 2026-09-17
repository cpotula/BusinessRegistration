using System.ComponentModel.DataAnnotations;

namespace BusinessPortal.API.Models;

public class Enquiry
{
    public int Id { get; set; }

    public int? BusinessId { get; set; }

    public Business? Business { get; set; }

    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Phone { get; set; }

    [Required, MaxLength(2000)]
    public string Message { get; set; } = string.Empty;

    public bool IsRead { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Announcement
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(4000)]
    public string? Message { get; set; }

    [MaxLength(50)]
    public string? Audience { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
