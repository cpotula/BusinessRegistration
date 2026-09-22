using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BusinessPortal.API.Migrations
{
    /// <inheritdoc />
    public partial class AddBusinessTheme : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Theme",
                table: "Businesses",
                type: "nvarchar(60)",
                maxLength: 60,
                nullable: false,
                defaultValue: "classic");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Theme",
                table: "Businesses");
        }
    }
}
