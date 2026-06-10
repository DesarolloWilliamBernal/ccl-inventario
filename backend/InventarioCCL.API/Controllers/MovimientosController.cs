using InventarioCCL.API.Data;
using InventarioCCL.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InventarioCCL.API.Controllers;

[ApiController]
[Route("movimientos")]
[Authorize]
public class MovimientosController : ControllerBase
{
    private readonly InventarioDbContext _context;

    public MovimientosController(InventarioDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// GET /movimientos — historial de movimientos (más recientes primero).
    /// Permite filtrar por producto con ?productoId=.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Movimiento>>> Listar([FromQuery] int? productoId)
    {
        var consulta = _context.Movimientos.AsQueryable();

        if (productoId.HasValue)
        {
            consulta = consulta.Where(m => m.ProductoId == productoId.Value);
        }

        var movimientos = await consulta
            .OrderByDescending(m => m.Fecha)
            .ToListAsync();

        return Ok(movimientos);
    }
}
