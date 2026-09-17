using System.ComponentModel.DataAnnotations;

namespace BusinessPortal.API.DTOs;

public record RegisterRequest(
    [Required, MaxLength(100)] string Name,
    [Required, EmailAddress, MaxLength(150)] string Email,
    [MaxLength(20)] string? Phone,
    [Required, MinLength(6)] string Password);

public record LoginRequest(
    [Required, EmailAddress] string Email,
    [Required] string Password);

public record AuthResponse(int Id, string Name, string Email, string Role, string Token);
