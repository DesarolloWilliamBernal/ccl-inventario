using InventarioCCL.API.Data;
using InventarioCCL.API.Dtos;
using InventarioCCL.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InventarioCCL.API.Controllers;

[ApiController]
[Route("productos")]
[Authorize]
public class ProductosController : ControllerBase
{
    private readonly InventarioDbContext _context;

    public ProductosController(InventarioDbContext context)
    {
        _context = context;
    }

    /// <summary>GET /productos/inventario — estado actual del inventario.</summary>
    [HttpGet("inventario")]
    public async Task<ActionResult<IEnumerable<Producto>>> Inventario()
    {
        var productos = await _context.Productos
            .OrderBy(p => p.Nombre)
            .ToListAsync();

        return Ok(productos);
    }

    /// <summary>POST /productos — crea un nuevo producto.</summary>
    [HttpPost]
    public async Task<ActionResult<Producto>> Crear([FromBody] ProductoRequest request)
    {
        var producto = new Producto
        {
            Nombre = request.Nombre.Trim(),
            Cantidad = request.Cantidad
        };

        _context.Productos.Add(producto);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(Inventario), new { id = producto.Id }, producto);
    }

    /// <summary>PUT /productos/{id} — actualiza nombre y/o cantidad de un producto.</summary>
    [HttpPut("{id:int}")]
    public async Task<ActionResult<Producto>> Actualizar(int id, [FromBody] ProductoRequest request)
    {
        var producto = await _context.Productos.FindAsync(id);

        if (producto is null)
        {
            return NotFound(new { mensaje = $"No existe un producto con Id {id}." });
        }

        producto.Nombre = request.Nombre.Trim();
        producto.Cantidad = request.Cantidad;

        await _context.SaveChangesAsync();

        return Ok(producto);
    }

    /// <summary>DELETE /productos/{id} — elimina un producto.</summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Eliminar(int id)
    {
        var producto = await _context.Productos.FindAsync(id);

        if (producto is null)
        {
            return NotFound(new { mensaje = $"No existe un producto con Id {id}." });
        }

        _context.Productos.Remove(producto);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>POST /productos/movimiento — registra una entrada o salida de un producto.</summary>
    [HttpPost("movimiento")]
    public async Task<ActionResult<Producto>> RegistrarMovimiento([FromBody] MovimientoRequest request)
    {
        var producto = await _context.Productos.FindAsync(request.ProductoId);

        if (producto is null)
        {
            return NotFound(new { mensaje = $"No existe un producto con Id {request.ProductoId}." });
        }

        var esEntrada = request.Tipo.Equals("entrada", StringComparison.OrdinalIgnoreCase);

        if (esEntrada)
        {
            producto.Cantidad += request.Cantidad;
        }
        else
        {
            if (request.Cantidad > producto.Cantidad)
            {
                return BadRequest(new
                {
                    mensaje = $"Stock insuficiente. Disponible: {producto.Cantidad}, solicitado: {request.Cantidad}."
                });
            }

            producto.Cantidad -= request.Cantidad;
        }

        // Registro de auditoría del movimiento.
        _context.Movimientos.Add(new Movimiento
        {
            ProductoId = producto.Id,
            ProductoNombre = producto.Nombre,
            Tipo = esEntrada ? "entrada" : "salida",
            Cantidad = request.Cantidad,
            CantidadResultante = producto.Cantidad,
            Fecha = DateTime.UtcNow,
            Usuario = User.Identity?.Name ?? "desconocido"
        });

        await _context.SaveChangesAsync();

        return Ok(producto);
    }
}
