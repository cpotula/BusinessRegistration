using System.ComponentModel.DataAnnotations;

namespace BusinessPortal.API.Models;

public class Category
{
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(120)]
    public string Slug { get; set; } = string.Empty;

    public int? ParentId { get; set; }

    public Category? Parent { get; set; }

    public int SortOrder { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Business> Businesses { get; set; } = new List<Business>();
}
