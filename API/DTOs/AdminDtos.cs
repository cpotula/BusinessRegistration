namespace BusinessPortal.API.DTOs;

public record UserDto(int Id, string Name, string Email, string? Phone, string Role, bool IsActive, DateTime CreatedAt);

public record SetUserRoleRequest(string Role);

public record SetUserActiveRequest(bool IsActive);

public record CategoryCreateRequest(string Name);

public record CategoryUpdateRequest(string Name);

public record AnnouncementCreateRequest(string Title, string? Message, string? Audience);

public record AnnouncementDto(int Id, string Title, string? Message, string? Audience, DateTime CreatedAt);

public record AdminDashboardDto(
    int TotalUsers,
    int TotalBusinesses,
    int ActiveBusinesses,
    int PendingBusinesses,
    int PendingProducts,
    int PendingTestimonials,
    int UnreadEnquiries,
    int ActiveSubscriptions,
    int ExpiringSoon,
    int ExpiredListings,
    int PendingPayments,
    decimal MonthlyRevenue);

public record AdminBusinessListItemDto(
    int Id,
    string Name,
    string Slug,
    string CategoryName,
    string OwnerEmail,
    string? City,
    bool IsActive,
    bool IsPublished,
    DateTime? SubscriptionExpiresOn,
    DateTime CreatedAt);

public record AdminProductListItemDto(
    int Id,
    string Name,
    string? Description,
    decimal? Price,
    string? ImageUrl,
    int BusinessId,
    string BusinessName,
    string OwnerEmail,
    bool IsActive,
    bool IsApproved,
    DateTime CreatedAt);

public record ExpiringBusinessDto(
    int Id,
    string Name,
    string CategoryName,
    string? City,
    string OwnerEmail,
    DateTime? SubscriptionExpiresOn,
    int DaysLeft);
