using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessPortal.API.Models;

public class Business
{
    public int Id { get; set; }

    public int OwnerUserId { get; set; }

    public User? OwnerUser { get; set; }

    [Required, MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(160)]
    public string Slug { get; set; } = string.Empty;

    public int CategoryId { get; set; }

    public Category? Category { get; set; }

    [MaxLength(4000)]
    public string? Description { get; set; }

    [MaxLength(20)]
    public string? ContactPhone { get; set; }

    [MaxLength(20)]
    public string? ContactWhatsApp { get; set; }

    [MaxLength(150)]
    public string? ContactEmail { get; set; }

    [MaxLength(300)]
    public string? Address { get; set; }

    [MaxLength(100)]
    public string? City { get; set; }

    [MaxLength(500)]
    public string? LogoUrl { get; set; }

    [MaxLength(500)]
    public string? CoverUrl { get; set; }

    [MaxLength(300)]
    public string? WebsiteUrl { get; set; }

    [MaxLength(500)]
    public string? BusinessHours { get; set; }

    // Industry theme applied to this business' public page.
    // One of: classic | fashion | electronics | food | furniture.
    [MaxLength(60)]
    public string Theme { get; set; } = "classic";

    public bool IsPublished { get; set; } = false;

    public bool IsActive { get; set; } = true;

    public DateTime? SubscriptionExpiresOn { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Product> Products { get; set; } = new List<Product>();

    public ICollection<Testimonial> Testimonials { get; set; } = new List<Testimonial>();

    public ICollection<Subscription> Subscriptions { get; set; } = new List<Subscription>();

    public ICollection<Enquiry> Enquiries { get; set; } = new List<Enquiry>();
}
