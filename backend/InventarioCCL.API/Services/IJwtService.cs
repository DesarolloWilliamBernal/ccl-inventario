namespace InventarioCCL.API.Services;

public interface IJwtService
{
    /// <summary>Genera un token JWT firmado para el usuario indicado.</summary>
    (string token, DateTime expiraEn) GenerarToken(string usuario);
}
