using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BusinessPortal.API.Migrations
{
    /// <inheritdoc />
    public partial class MakeEnquiryBusinessIdNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Enquiries_Businesses_BusinessId",
                table: "Enquiries");

            migrationBuilder.AlterColumn<int>(
                name: "BusinessId",
                table: "Enquiries",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddForeignKey(
                name: "FK_Enquiries_Businesses_BusinessId",
                table: "Enquiries",
                column: "BusinessId",
                principalTable: "Businesses",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Enquiries_Businesses_BusinessId",
                table: "Enquiries");

            migrationBuilder.AlterColumn<int>(
                name: "BusinessId",
                table: "Enquiries",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Enquiries_Businesses_BusinessId",
                table: "Enquiries",
                column: "BusinessId",
                principalTable: "Businesses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
