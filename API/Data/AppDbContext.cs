using BusinessPortal.API.Models;
using Microsoft.EntityFrameworkCore;

namespace BusinessPortal.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Business> Businesses => Set<Business>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<ProductVideo> ProductVideos => Set<ProductVideo>();
    public DbSet<Testimonial> Testimonials => Set<Testimonial>();
    public DbSet<Subscription> Subscriptions => Set<Subscription>();
    public DbSet<Enquiry> Enquiries => Set<Enquiry>();
    public DbSet<Announcement> Announcements => Set<Announcement>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Category>()
            .HasIndex(c => c.Slug)
            .IsUnique();

        modelBuilder.Entity<Business>()
            .HasIndex(b => b.Slug)
            .IsUnique();

        modelBuilder.Entity<Business>()
            .HasOne(b => b.OwnerUser)
            .WithMany()
            .HasForeignKey(b => b.OwnerUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Business>()
            .HasOne(b => b.Category)
            .WithMany(c => c.Businesses)
            .HasForeignKey(b => b.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Product>()
            .HasOne(p => p.Business)
            .WithMany(b => b.Products)
            .HasForeignKey(p => p.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ProductImage>()
            .HasOne(i => i.Product)
            .WithMany(p => p.Images)
            .HasForeignKey(i => i.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ProductVideo>()
            .HasOne(v => v.Product)
            .WithMany(p => p.Videos)
            .HasForeignKey(v => v.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Testimonial>()
            .HasOne(t => t.Business)
            .WithMany(b => b.Testimonials)
            .HasForeignKey(t => t.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Subscription>()
            .HasOne(s => s.Business)
            .WithMany(b => b.Subscriptions)
            .HasForeignKey(s => s.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Enquiry>()
            .HasOne(e => e.Business)
            .WithMany(b => b.Enquiries)
            .HasForeignKey(e => e.BusinessId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
