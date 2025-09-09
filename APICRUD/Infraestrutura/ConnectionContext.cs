using Microsoft.EntityFrameworkCore;
using APICRUD.Model;
using Microsoft.Extensions.Configuration;

namespace APICRUD.Infraestrutura
{
    public class ConnectionContext : DbContext
    {
        private readonly IConfiguration _configuration;

        public ConnectionContext(DbContextOptions<ConnectionContext> options) : base(options) { }

        public DbSet<cliente> clientes { get; set; }
        public DbSet<item> itens { get; set; }
        public DbSet<pedido> pedidos { get; set; }
        public DbSet<pedidoItem> pedidoitens { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<pedido>(entity =>
            {
                entity.ToTable("pedidos");
                entity.HasKey(e => e.id);
                entity.Property(e => e.id).ValueGeneratedOnAdd();
            });

            modelBuilder.Entity<pedidoItem>(entity =>
            {
                entity.ToTable("pedidoitens");
                entity.HasKey(e => e.id);
                entity.Property(e => e.id).ValueGeneratedOnAdd();
            });

            modelBuilder.Entity<pedido>()
                .HasMany(p => p.PedidoItens)
                .WithOne(pi => pi.pedidos)
                .HasForeignKey(pi => pi.pedidoid)
                .OnDelete(DeleteBehavior.Cascade);
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                var connectionString = _configuration.GetConnectionString("DefaultConnection");
                optionsBuilder.UseNpgsql(connectionString);
            }
        }
    }
}
