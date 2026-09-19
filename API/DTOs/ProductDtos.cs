using System.ComponentModel.DataAnnotations;

namespace BusinessPortal.API.DTOs;

public record ProductCreateRequest(
    [Required, MaxLength(200)] string Name,
    [MaxLength(4000)] string? Description,
    decimal? Price,
    int? StockQuantity);

public record ProductUpdateRequest(
    [Required, MaxLength(200)] string Name,
    [MaxLength(4000)] string? Description,
    decimal? Price,
    bool IsActive,
    int? StockQuantity);

public record ProductInventoryUpdateRequest(decimal? Price, int? StockQuantity);

public record ProductDto(
    int Id,
    string Name,
    string? Description,
    decimal? Price,
    bool IsActive,
    bool IsApproved,
    int StockQuantity,
    IEnumerable<string> Images,
    IEnumerable<ProductVideoDto> Videos);

public record ProductVideoDto(int Id, string Url, string? Title);

public record ProductSearchItemDto(
    int Id,
    string Name,
    string? Description,
    decimal? Price,
    int StockQuantity,
    string? ImageUrl,
    int BusinessId,
    string BusinessName,
    string BusinessSlug);

public record ProductDetailDto(
    int Id,
    string Name,
    string? Description,
    decimal? Price,
    int StockQuantity,
    IEnumerable<string> Images,
    IEnumerable<ProductVideoDto> Videos,
    int BusinessId,
    string BusinessName,
    string BusinessSlug,
    string CategoryName,
    string? City,
    string? LogoUrl,
    string? ContactPhone,
    string? ContactWhatsApp);

public record TestimonialCreateRequest(
    [MaxLength(100)] string? CustomerName,
    [Range(1, 5)] int Rating,
    [MaxLength(2000)] string? ReviewText);

public record ProductReviewCreateRequest(
    [Range(1, 5)] int Rating,
    [MaxLength(2000)] string? ReviewText);

public record ProductReviewDto(
    int Id,
    string CustomerName,
    int Rating,
    string? ReviewText,
    DateTime CreatedAt,
    bool IsVerified);

public record ProductReviewsResult(
    double AverageRating,
    int Total,
    IEnumerable<ProductReviewDto> Reviews);

public record ProductReviewRow(
    int Id,
    string ProductName,
    string BusinessName,
    string CustomerName,
    int Rating,
    string? ReviewText,
    bool IsApproved);

public record ReviewEligibilityDto(
    bool Eligible,
    string? Reason,
    int DeliveredCount);

public record EnquiryCreateRequest(
    [Required, MaxLength(100)] string Name,
    [Required, EmailAddress, MaxLength(150)] string Email,
    [MaxLength(20)] string? Phone,
    [Required, MaxLength(2000)] string Message);
