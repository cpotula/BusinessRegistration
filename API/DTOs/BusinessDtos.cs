using System.ComponentModel.DataAnnotations;

namespace BusinessPortal.API.DTOs;

public record CategoryDto(int Id, string Name, string Slug);

public record BusinessCreateRequest(
    [Required, MaxLength(150)] string Name,
    int CategoryId,
    [MaxLength(4000)] string? Description,
    [MaxLength(20)] string? ContactPhone,
    [MaxLength(20)] string? ContactWhatsApp,
    [MaxLength(150)] string? ContactEmail,
    [MaxLength(300)] string? Address,
    [MaxLength(100)] string? City,
    [MaxLength(300)] string? WebsiteUrl,
    [MaxLength(500)] string? BusinessHours,
    [MaxLength(500)] string? LogoUrl,
    [MaxLength(500)] string? CoverUrl,
    bool IsPublished = false);

public record BusinessUpdateRequest(
    [Required, MaxLength(150)] string Name,
    int CategoryId,
    [MaxLength(4000)] string? Description,
    [MaxLength(20)] string? ContactPhone,
    [MaxLength(20)] string? ContactWhatsApp,
    [MaxLength(150)] string? ContactEmail,
    [MaxLength(300)] string? Address,
    [MaxLength(100)] string? City,
    [MaxLength(300)] string? WebsiteUrl,
    [MaxLength(500)] string? BusinessHours,
    [MaxLength(500)] string? LogoUrl,
    [MaxLength(500)] string? CoverUrl,
    bool IsPublished);

public record BusinessSummaryDto(
    int Id,
    string Name,
    string Slug,
    string CategoryName,
    string? Description,
    string? City,
    string? LogoUrl,
    bool IsActive,
    DateTime? SubscriptionExpiresOn);

public record BusinessDetailDto(
    int Id,
    string Name,
    string Slug,
    string CategoryName,
    string? Description,
    string? ContactPhone,
    string? ContactWhatsApp,
    string? ContactEmail,
    string? Address,
    string? City,
    string? LogoUrl,
    string? CoverUrl,
    string? WebsiteUrl,
    string? BusinessHours,
    bool IsPublished,
    bool IsActive,
    DateTime? SubscriptionExpiresOn,
    double AverageRating,
    int ProductCount,
    IEnumerable<TestimonialDto> Testimonials);

public record TestimonialDto(
    int Id,
    string CustomerName,
    int Rating,
    string? ReviewText,
    DateTime CreatedAt);

public record PublishRequest(bool IsPublished);
