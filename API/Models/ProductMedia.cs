using System.ComponentModel.DataAnnotations;

namespace BusinessPortal.API.Models;

public class ProductImage
{
    public int Id { get; set; }

    public int ProductId { get; set; }

    public Product? Product { get; set; }

    [Required, MaxLength(500)]
    public string Url { get; set; } = string.Empty;

    public int SortOrder { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class ProductVideo
{
    public int Id { get; set; }

    public int ProductId { get; set; }

    public Product? Product { get; set; }

    [Required, MaxLength(500)]
    public string Url { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? Title { get; set; }

    public int SortOrder { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
