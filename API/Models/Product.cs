using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessPortal.API.Models;

public class Product
{
    public int Id { get; set; }

    public int BusinessId { get; set; }

    public Business? Business { get; set; }

    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(4000)]
    public string? Description { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? Price { get; set; }

    // Units currently available for sale. 0 (or less) means out of stock.
    public int StockQuantity { get; set; } = 10;

    public bool IsActive { get; set; } = true;

    // Admin approval gate: a product is NOT shown publicly until an admin
    // approves it. New products start as pending (IsApproved = false).
    public bool IsApproved { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();

    public ICollection<ProductVideo> Videos { get; set; } = new List<ProductVideo>();
}
