using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace APICRUD.Migrations
{
    /// <inheritdoc />
    public partial class RemoveTotalFromPedidos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "foto_item",
                table: "itens",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "islogged",
                table: "clientes",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "senha",
                table: "clientes",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "foto_item",
                table: "itens");

            migrationBuilder.DropColumn(
                name: "islogged",
                table: "clientes");

            migrationBuilder.DropColumn(
                name: "senha",
                table: "clientes");
        }
    }
}
