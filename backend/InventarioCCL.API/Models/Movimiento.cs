namespace InventarioCCL.API.Models;

/// <summary>
/// Registro de auditoría de una entrada o salida de inventario.
/// Guarda una "foto" del nombre del producto y del stock resultante para
/// conservar el historial aunque el producto se edite o elimine después.
/// </summary>
public class Movimiento
{
    public int Id { get; set; }
    public int ProductoId { get; set; }
    public string ProductoNombre { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty;
    public int Cantidad { get; set; }
    public int CantidadResultante { get; set; }
    public DateTime Fecha { get; set; }
    public string Usuario { get; set; } = string.Empty;
}
