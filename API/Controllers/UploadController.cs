using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;

namespace BusinessPortal.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UploadController : ControllerBase
{
    private static readonly string[] ImageExtensions = { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
    private static readonly string[] VideoExtensions = { ".mp4", ".webm", ".mov" };
    private const long MaxImageBytes = 5 * 1024 * 1024;
    private const long MaxVideoBytes = 100 * 1024 * 1024;

    private readonly IWebHostEnvironment _env;
    private readonly string _uploadRoot;

    public UploadController(IWebHostEnvironment env)
    {
        _env = env;
        _uploadRoot = Path.Combine(_env.ContentRootPath, "Uploads");
    }

    [HttpPost("image")]
    [Authorize(Roles = "BusinessOwner,Admin")]
    [RequestSizeLimit(MaxImageBytes)]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { message = "No file received." });

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!ImageExtensions.Contains(ext))
            return BadRequest(new { message = "Only image files are allowed (jpg, jpeg, png, webp, gif)." });

        if (file.Length > MaxImageBytes)
            return BadRequest(new { message = "Image must be 5 MB or smaller." });

        var name = $"{Guid.NewGuid():N}{ext}";
        var subDir = "images";
        var dir = Path.Combine(_uploadRoot, subDir);
        Directory.CreateDirectory(dir);

        var fullPath = Path.Combine(dir, name);

        try
        {
            using var image = await Image.LoadAsync(file.OpenReadStream());
            image.Mutate(x => x.AutoOrient());
            if (image.Width > 1600)
                image.Mutate(x => x.Resize(new ResizeOptions { Size = new Size(1600, 1600), Mode = ResizeMode.Max }));
            await image.SaveAsync(fullPath);
        }
        catch (UnknownImageFormatException)
        {
            return BadRequest(new { message = "The uploaded file is not a valid image." });
        }

        return Ok(new { url = $"/uploads/{subDir}/{name}" });
    }

    [HttpPost("video")]
    [Authorize(Roles = "BusinessOwner,Admin")]
    [RequestSizeLimit(MaxVideoBytes)]
    public async Task<IActionResult> UploadVideo(IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { message = "No file received." });

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!VideoExtensions.Contains(ext))
            return BadRequest(new { message = "Only video files are allowed (mp4, webm, mov)." });

        if (file.Length > MaxVideoBytes)
            return BadRequest(new { message = "Video must be 100 MB or smaller." });

        var name = $"{Guid.NewGuid():N}{ext}";
        var subDir = "videos";
        var dir = Path.Combine(_uploadRoot, subDir);
        Directory.CreateDirectory(dir);

        var fullPath = Path.Combine(dir, name);
        await using (var stream = System.IO.File.Create(fullPath))
        {
            await file.CopyToAsync(stream);
        }

        return Ok(new { url = $"/uploads/{subDir}/{name}" });
    }
}
