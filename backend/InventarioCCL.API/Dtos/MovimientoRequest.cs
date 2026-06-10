using System.ComponentModel.DataAnnotations;

namespace InventarioCCL.API.Dtos;

/// <summary>
/// Solicitud para registrar una entrada o salida de un producto.
/// </summary>
public class MovimientoRequest
{
    [Required(ErrorMessage = "El producto es obligatorio.")]
    public int ProductoId { get; set; }

    /// <summary>"entrada" o "salida".</summary>
    [Required(ErrorMessage = "El tipo de movimiento es obligatorio.")]
    [RegularExpression("^(entrada|salida)$", ErrorMessage = "El tipo debe ser 'entrada' o 'salida'.")]
    public string Tipo { get; set; } = string.Empty;

    [Range(1, int.MaxValue, ErrorMessage = "La cantidad debe ser mayor a cero.")]
    public int Cantidad { get; set; }
}
