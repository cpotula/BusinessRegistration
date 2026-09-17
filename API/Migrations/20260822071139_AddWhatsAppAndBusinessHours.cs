using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BusinessPortal.API.Migrations
{
    /// <inheritdoc />
    public partial class AddWhatsAppAndBusinessHours : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BusinessHours",
                table: "Businesses",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContactWhatsApp",
                table: "Businesses",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BusinessHours",
                table: "Businesses");

            migrationBuilder.DropColumn(
                name: "ContactWhatsApp",
                table: "Businesses");
        }
    }
}
