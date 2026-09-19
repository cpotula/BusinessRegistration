using System.ComponentModel.DataAnnotations;

namespace BusinessPortal.API.DTOs;

public record RegisterRequest(
    [Required, MaxLength(100)] string Name,
    [Required, EmailAddress, MaxLength(150)] string Email,
    [Required, MaxLength(20)] string Phone,
    [Required, MinLength(6)] string Password,
    [MaxLength(20)] string? UserType = null,
    [MaxLength(300)] string? Address = null,
    [MaxLength(100)] string? City = null,
    [MaxLength(100)] string? State = null,
    [MaxLength(10)] string? Pincode = null);

public record LoginRequest(
    [Required, EmailAddress] string Email,
    [Required] string Password);

public record AuthResponse(int Id, string Name, string Email, string? Phone, string Role, string Token);
