using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BusinessPortal.API.Migrations
{
    /// <inheritdoc />
    public partial class AutoPublishProductReviews : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Product reviews were previously hidden until the admin approved
            // them. Reviews now publish automatically (only verified buyers can
            // write them), so pre-existing pending reviews are made public.
            migrationBuilder.Sql("UPDATE ProductReviews SET IsApproved = 1 WHERE IsApproved = 0");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
