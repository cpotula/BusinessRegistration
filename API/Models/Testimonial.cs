using System.ComponentModel.DataAnnotations;

namespace BusinessPortal.API.Models;

public class Testimonial
{
    public int Id { get; set; }

    public int BusinessId { get; set; }

    public Business? Business { get; set; }

    [Required, MaxLength(100)]
    public string CustomerName { get; set; } = string.Empty;

    [Range(1, 5)]
    public int Rating { get; set; } = 5;

    [MaxLength(2000)]
    public string? ReviewText { get; set; }

    public bool IsApproved { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
