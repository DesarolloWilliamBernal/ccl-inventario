namespace InventarioCCL.API.Configuration;

/// <summary>
/// Credenciales fijas en memoria (definidas en appsettings) para el login.
/// </summary>
public class CredencialesSettings
{
    public const string SectionName = "Credenciales";

    public string Usuario { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
