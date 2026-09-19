using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessPortal.API.Models;

// Order placed by a logged-in user ("buyer") for items in their cart.
// Items can come from more than one business; each is stored as an OrderItem.
public class Order
{
    public int Id { get; set; }

    [Required, MaxLength(50)]
    public string OrderNumber { get; set; } = string.Empty;

    public int CustomerUserId { get; set; }

    [Required, MaxLength(100)]
    public string CustomerName { get; set; } = string.Empty;

    [MaxLength(150)]
    public string? CustomerEmail { get; set; }

    [MaxLength(20)]
    public string? CustomerPhone { get; set; }

    [MaxLength(300)]
    public string? DeliveryName { get; set; }

    [MaxLength(20)]
    public string? DeliveryPhone { get; set; }

    [MaxLength(300)]
    public string? DeliveryAddress { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalAmount { get; set; }

    public string Status { get; set; } = "Pending";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}

public class OrderItem
{
    public int Id { get; set; }

    public int OrderId { get; set; }

    public Order? Order { get; set; }

    public int ProductId { get; set; }

    [Required, MaxLength(200)]
    public string ProductName { get; set; } = string.Empty;

    public int BusinessId { get; set; }

    [Required, MaxLength(200)]
    public string BusinessName { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,2)")]
    public decimal UnitPrice { get; set; }

    public int Quantity { get; set; }
}