using System.Text.RegularExpressions;
using BusinessPortal.API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace BusinessPortal.API.Data;

public static class DbSeeder
{
    public static void Seed(AppDbContext db)
    {
        db.Database.Migrate();

        if (db.Users.Any())
            return;

        var hasher = new PasswordHasher<User>();

        var admin = new User
        {
            Name = "Administrator",
            Email = "admin@businessportal.local",
            Phone = null,
            PasswordHash = hasher.HashPassword(null!, "Admin@123"),
            Role = UserRole.Admin,
            IsActive = true
        };
        db.Users.Add(admin);

        var owner = new User
        {
            Name = "Sample Owner",
            Email = "owner@businessportal.local",
            Phone = "9876543210",
            PasswordHash = hasher.HashPassword(null!, "Owner@123"),
            Role = UserRole.BusinessOwner,
            IsActive = true
        };
        db.Users.Add(owner);
        db.SaveChanges();

        var categories = new[]
        {
            new Category { Name = "Restaurants & Cafes", Slug = "restaurants-cafes", SortOrder = 1 },
            new Category { Name = "Retail & Shopping", Slug = "retail-shopping", SortOrder = 2 },
            new Category { Name = "Health & Beauty", Slug = "health-beauty", SortOrder = 3 },
            new Category { Name = "Home Services", Slug = "home-services", SortOrder = 4 },
            new Category { Name = "IT & Professional Services", Slug = "it-professional-services", SortOrder = 5 },
            new Category { Name = "Education & Training", Slug = "education-training", SortOrder = 6 },
            new Category { Name = "Automotive", Slug = "automotive", SortOrder = 7 },
            new Category { Name = "Real Estate", Slug = "real-estate", SortOrder = 8 },
        };
        db.Categories.AddRange(categories);
        db.SaveChanges();

        var foodCat = categories[0];
        var retailCat = categories[1];

        var business1 = new Business
        {
            OwnerUserId = owner.Id,
            Name = "Spice Junction Restaurant",
            Slug = Slugify("Spice Junction Restaurant"),
            CategoryId = foodCat.Id,
            Description = "Authentic multi-cuisine restaurant serving North Indian, South Indian and Chinese delicacies.",
            ContactPhone = "9123456780",
            ContactWhatsApp = "9123456780",
            ContactEmail = "contact@spicejunction.example",
            Address = "12 MG Road, Central District",
            City = "Hyderabad",
            BusinessHours = "Mon-Sun: 11:00 AM - 11:00 PM",
            IsPublished = true,
            IsActive = true,
            SubscriptionExpiresOn = DateTime.UtcNow.AddMonths(6)
        };

        var business2 = new Business
        {
            OwnerUserId = owner.Id,
            Name = "Urban Threads Apparel",
            Slug = Slugify("Urban Threads Apparel"),
            CategoryId = retailCat.Id,
            Description = "Modern fashion store offering premium clothing and accessories for men and women.",
            ContactPhone = "9123456781",
            ContactWhatsApp = "9123456781",
            ContactEmail = "hello@urbanthreads.example",
            Address = "45 Banjara Hills Road No 3",
            City = "Hyderabad",
            BusinessHours = "Mon-Sat: 10:00 AM - 9:00 PM, Sun: 11:00 AM - 8:00 PM",
            IsPublished = true,
            IsActive = true,
            SubscriptionExpiresOn = DateTime.UtcNow.AddMonths(3)
        };

        db.Businesses.AddRange(business1, business2);
        db.SaveChanges();

        var product1 = new Product
        {
            BusinessId = business1.Id,
            Name = "Hyderabadi Chicken Biryani",
            Description = "Slow-cooked basmati rice with marinated chicken, saffron and aromatic spices.",
            Price = 299m,
            IsActive = true
        };

        var product2 = new Product
        {
            BusinessId = business1.Id,
            Name = "Paneer Butter Masala",
            Description = "Cottage cheese simmered in a rich tomato-butter gravy.",
            Price = 249m,
            IsActive = true
        };

        var product3 = new Product
        {
            BusinessId = business2.Id,
            Name = "Classic Denim Jacket",
            Description = "Timeless blue denim jacket in regular fit.",
            Price = 1599m,
            IsActive = true
        };

        db.Products.AddRange(product1, product2, product3);
        db.SaveChanges();

        db.Testimonials.AddRange(
            new Testimonial { BusinessId = business1.Id, CustomerName = "Ramesh K", Rating = 5, ReviewText = "Best biryani in the area. Quick delivery and great taste!", IsApproved = true },
            new Testimonial { BusinessId = business1.Id, CustomerName = "Sita L", Rating = 4, ReviewText = "Good ambience and courteous staff.", IsApproved = true },
            new Testimonial { BusinessId = business2.Id, CustomerName = "Anil P", Rating = 5, ReviewText = "Great collection and reasonable prices. Highly recommended.", IsApproved = true }
        );

        db.Subscriptions.AddRange(
            new Subscription
            {
                BusinessId = business1.Id,
                PlanName = "Annual",
                Amount = 5000m,
                PaymentMethod = "Manual",
                PaymentStatus = SubscriptionStatus.Paid,
                StartDate = DateTime.UtcNow.AddMonths(-6),
                EndDate = DateTime.UtcNow.AddMonths(6),
                TransactionRef = "SUB-2026-0001",
                Notes = "Seed data"
            },
            new Subscription
            {
                BusinessId = business2.Id,
                PlanName = "Quarterly",
                Amount = 1500m,
                PaymentMethod = "Manual",
                PaymentStatus = SubscriptionStatus.Paid,
                StartDate = DateTime.UtcNow.AddMonths(-3),
                EndDate = DateTime.UtcNow.AddMonths(3),
                TransactionRef = "SUB-2026-0002",
                Notes = "Seed data"
            }
        );

        db.Enquiries.AddRange(
            new Enquiry { BusinessId = business1.Id, Name = "Visitor One", Email = "visitor1@example.com", Phone = "9000000001", Message = "Do you offer home delivery?", IsRead = false }
        );

        db.Announcements.AddRange(
            new Announcement { Title = "Welcome to Enterprise Business Portal", Message = "Register your business today and get discovered by thousands of customers.", Audience = "All" }
        );

        db.SaveChanges();
    }

    private static string Slugify(string value)
    {
        var slug = value.ToLowerInvariant().Trim();
        slug = Regex.Replace(slug, @"[^a-z0-9\s-]", "");
        slug = Regex.Replace(slug, @"\s+", "-");
        slug = Regex.Replace(slug, @"-+", "-");
        return slug.Trim('-');
    }
}
