using System.Security.Cryptography;
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
            using (var input = file.OpenReadStream())
            using (var image = await Image.LoadAsync(input))
            {
                image.Mutate(x => x.AutoOrient());
                if (image.Width > 1600)
                    image.Mutate(x => x.Resize(new ResizeOptions { Size = new Size(1600, 1600), Mode = ResizeMode.Max }));
                await image.SaveAsync(fullPath);
            }
        }
        catch (UnknownImageFormatException)
        {
            return BadRequest(new { message = "The uploaded file is not a valid image." });
        }

        // Deduplicate by content: if the same image bytes were uploaded
        // before (under a different file name), return the existing URL
        // instead of storing another copy.
        using (var sha = SHA256.Create())
        {
            byte[] newHash;
            using (var fs = System.IO.File.OpenRead(fullPath))
                newHash = sha.ComputeHash(fs);
            foreach (var existing in Directory.GetFiles(dir))
            {
                if (string.Equals(existing, fullPath, StringComparison.OrdinalIgnoreCase))
                    continue;
                byte[] existingHash;
                using (var stream = System.IO.File.OpenRead(existing))
                    existingHash = sha.ComputeHash(stream);
                if (existingHash.AsSpan().SequenceEqual(newHash))
                {
                    TryDelete(fullPath);
                    return Ok(new { url = $"/uploads/{subDir}/{Path.GetFileName(existing)}" });
                }
            }
        }

        return Ok(new { url = $"/uploads/{subDir}/{name}" });
    }

    private static void TryDelete(string path)
    {
        for (var attempt = 0; attempt < 3; attempt++)
        {
            try
            {
                System.IO.File.Delete(path);
                return;
            }
            catch (IOException)
            {
                Thread.Sleep(150);
            }
        }
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
