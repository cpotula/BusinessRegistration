using System.ComponentModel.DataAnnotations;

namespace BusinessPortal.API.DTOs;

public record SubscriptionCreateRequest(
    int BusinessId,
    [Required, MaxLength(100)] string PlanName,
    [Range(0, double.MaxValue)] decimal Amount,
    [MaxLength(50)] string? PaymentMethod,
    [MaxLength(100)] string? TransactionRef,
    [MaxLength(500)] string? Notes,
    DateTime StartDate,
    DateTime EndDate);

public record SubscriptionDto(
    int Id,
    int BusinessId,
    string BusinessName,
    string PlanName,
    decimal Amount,
    string? PaymentMethod,
    string PaymentStatus,
    DateTime StartDate,
    DateTime EndDate,
    string? TransactionRef,
    string? Notes);

public record SubscriptionRecordPaymentRequest(
    [MaxLength(50)] string? PaymentMethod,
    [MaxLength(100)] string? TransactionRef,
    [MaxLength(500)] string? Notes);

public record PlanDto(string Name, int Months, decimal Amount, string Description, int? ProductLimit, int? StockLimit);

public record RenewalRequest(
    int BusinessId,
    [Required] string PlanName);

public record SubscriptionUsageDto(
    string? PlanName,
    int? ProductLimit,
    int? StockLimit,
    int ProductCount,
    int ProductsOverStock,
    int? Remaining,
    bool PaymentConfirmed);
