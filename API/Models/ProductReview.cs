using System.ComponentModel.DataAnnotations;

namespace BusinessPortal.API.Models;

// Customer review of an individual product (Flipkart/Amazon style).
public class ProductReview
{
    public int Id { get; set; }

    public int ProductId { get; set; }

    public Product? Product { get; set; }

    public int? UserId { get; set; }

    [Required, MaxLength(100)]
    public string CustomerName { get; set; } = string.Empty;

    [Range(1, 5)]
    public int Rating { get; set; } = 5;

    [MaxLength(2000)]
    public string? ReviewText { get; set; }

    public bool IsApproved { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}