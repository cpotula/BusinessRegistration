using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessPortal.API.Models;

public class Subscription
{
    public int Id { get; set; }

    public int BusinessId { get; set; }

    public Business? Business { get; set; }

    [Required, MaxLength(100)]
    public string PlanName { get; set; } = string.Empty;

    [Range(0, double.MaxValue)]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [MaxLength(50)]
    public string? PaymentMethod { get; set; }

    public SubscriptionStatus PaymentStatus { get; set; } = SubscriptionStatus.Pending;

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    [MaxLength(100)]
    public string? TransactionRef { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public enum SubscriptionStatus
{
    Pending = 0,
    Paid = 1,
    Expired = 2,
    Refunded = 3
}
