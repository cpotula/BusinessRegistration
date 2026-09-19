using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BusinessPortal.API.Migrations
{
    /// <inheritdoc />
    public partial class AddOrderDelivery : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DeliveryAddress",
                table: "Orders",
                type: "nvarchar(300)",
                maxLength: 300,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeliveryName",
                table: "Orders",
                type: "nvarchar(300)",
                maxLength: 300,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeliveryPhone",
                table: "Orders",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DeliveryAddress",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "DeliveryName",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "DeliveryPhone",
                table: "Orders");
        }
    }
}
