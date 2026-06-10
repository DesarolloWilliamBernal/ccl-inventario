namespace InventarioCCL.API.Models;

/// <summary>
/// Producto del inventario. Es la única tabla persistida (productos).
/// </summary>
public class Producto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public int Cantidad { get; set; }
}
