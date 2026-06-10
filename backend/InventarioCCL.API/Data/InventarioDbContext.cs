using InventarioCCL.API.Models;
using Microsoft.EntityFrameworkCore;

namespace InventarioCCL.API.Data;

public class InventarioDbContext : DbContext
{
    public InventarioDbContext(DbContextOptions<InventarioDbContext> options) : base(options)
    {
    }

    public DbSet<Producto> Productos => Set<Producto>();
    public DbSet<Movimiento> Movimientos => Set<Movimiento>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Producto>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Nombre).IsRequired().HasMaxLength(150);
            entity.Property(p => p.Cantidad).IsRequired();
        });

        modelBuilder.Entity<Movimiento>(entity =>
        {
            entity.HasKey(m => m.Id);
            entity.Property(m => m.ProductoNombre).IsRequired().HasMaxLength(150);
            entity.Property(m => m.Tipo).IsRequired().HasMaxLength(10);
            entity.Property(m => m.Usuario).IsRequired().HasMaxLength(100);
        });

        // Datos iniciales cargados manualmente (sin migraciones complejas).
        modelBuilder.Entity<Producto>().HasData(
            new Producto { Id = 1, Nombre = "Laptop Dell Latitude 5440", Cantidad = 25 },
            new Producto { Id = 2, Nombre = "Monitor LG 24 pulgadas", Cantidad = 40 },
            new Producto { Id = 3, Nombre = "Teclado mecánico", Cantidad = 60 },
            new Producto { Id = 4, Nombre = "Mouse inalámbrico", Cantidad = 80 },
            new Producto { Id = 5, Nombre = "Silla ergonómica", Cantidad = 15 }
        );
    }
}
