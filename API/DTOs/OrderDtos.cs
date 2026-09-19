using System.ComponentModel.DataAnnotations;

namespace BusinessPortal.API.DTOs;

public record PlaceOrderItemRequest(int ProductId, int Quantity);

public record PlaceOrderRequest(
    List<PlaceOrderItemRequest> Items,
    bool Delivery = false,
    [MaxLength(100)] string? DeliveryName = null,
    [MaxLength(20)] string? DeliveryPhone = null,
    [MaxLength(300)] string? DeliveryAddress = null);

public record OrderStatusUpdateRequest(string Status);

public record OrderItemDto(
    int Id,
    int ProductId,
    string ProductName,
    int BusinessId,
    string BusinessName,
    decimal UnitPrice,
    int Quantity,
    string? ImageUrl);

public record OrderDto(
    int Id,
    string OrderNumber,
    string CustomerName,
    string? CustomerEmail,
    string? CustomerPhone,
    string? DeliveryName,
    string? DeliveryPhone,
    string? DeliveryAddress,
    decimal TotalAmount,
    string Status,
    DateTime CreatedAt,
    List<OrderItemDto> Items);

public record NotificationDto(
    int Id,
    string Title,
    string Message,
    string? Link,
    bool IsRead,
    DateTime CreatedAt);

public record SoldPerProductDto(
    int ProductId,
    string ProductName,
    string? ImageUrl,
    int SoldToday,
    int SoldThisMonth,
    int SoldThisYear,
    decimal RevenueToday,
    decimal RevenueThisMonth,
    decimal RevenueThisYear);

public record SoldSummaryDto(
    int SoldToday,
    int SoldThisMonth,
    int SoldThisYear,
    decimal RevenueToday,
    decimal RevenueThisMonth,
    decimal RevenueThisYear,
    List<SoldPerProductDto> Products);

public record SoldPeriodPointDto(string Key, int Units, decimal Revenue);

public record SoldByPeriodDto(
    List<SoldPeriodPointDto> Monthly,
    List<SoldPeriodPointDto> Quarterly,
    List<SoldPeriodPointDto> Yearly);