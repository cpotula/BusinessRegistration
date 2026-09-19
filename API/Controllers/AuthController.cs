using BusinessPortal.API.Data;
using BusinessPortal.API.DTOs;
using BusinessPortal.API.Models;
using BusinessPortal.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace BusinessPortal.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly TokenService _tokenService;
    private readonly PasswordHasher<User> _hasher = new();

    public AuthController(AppDbContext db, TokenService tokenService)
    {
        _db = db;
        _tokenService = tokenService;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var existing = await _db.Users.AnyAsync(u => u.Email == request.Email);
        if (existing)
            return BadRequest(new { message = "An account with this email already exists." });

        var isCustomer = string.Equals(request.UserType, "customer", StringComparison.OrdinalIgnoreCase);

        var user = new User
        {
            Name = request.Name,
            Email = request.Email,
            Phone = request.Phone,
            Address = request.Address,
            City = request.City,
            State = request.State,
            Pincode = request.Pincode,
            Role = isCustomer ? UserRole.Customer : UserRole.BusinessOwner,
            PasswordHash = _hasher.HashPassword(null!, request.Password)
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var token = _tokenService.CreateToken(user);
        return Ok(ToResponse(user, token));
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user is null || !user.IsActive)
            return Unauthorized(new { message = "Invalid email or password." });

        var result = _hasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (result == PasswordVerificationResult.Failed)
            return Unauthorized(new { message = "Invalid email or password." });

        var token = _tokenService.CreateToken(user);
        return Ok(ToResponse(user, token));
    }

    [HttpPut("profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await _db.Users.FindAsync(userId);
        if (user is null)
            return Unauthorized(new { message = "Login required." });

        user.Name = request.Name.Trim();
        if (!string.IsNullOrWhiteSpace(request.Phone))
            user.Phone = request.Phone.Trim();

        await _db.SaveChangesAsync();

        var token = _tokenService.CreateToken(user);
        return Ok(ToResponse(user, token));
    }

    private static AuthResponse ToResponse(User user, string token) =>
        new(user.Id, user.Name, user.Email, user.Phone, user.Role.ToString(), token);
}
