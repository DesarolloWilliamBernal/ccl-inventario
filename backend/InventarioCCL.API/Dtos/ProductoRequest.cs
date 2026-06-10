using System.ComponentModel.DataAnnotations;

namespace InventarioCCL.API.Dtos;

/// <summary>Datos para crear o actualizar un producto.</summary>
public class ProductoRequest
{
    [Required(ErrorMessage = "El nombre es obligatorio.")]
    [MaxLength(150, ErrorMessage = "El nombre no puede superar los 150 caracteres.")]
    public string Nombre { get; set; } = string.Empty;

    [Range(0, int.MaxValue, ErrorMessage = "La cantidad no puede ser negativa.")]
    public int Cantidad { get; set; }
}
