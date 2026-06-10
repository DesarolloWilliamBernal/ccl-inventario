using InventarioCCL.API.Dtos;

namespace InventarioCCL.API.Services;

public interface IAuthService
{
    /// <summary>Valida las credenciales y devuelve un token, o null si son inválidas.</summary>
    LoginResponse? Autenticar(LoginRequest request);
}
