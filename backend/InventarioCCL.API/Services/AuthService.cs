using InventarioCCL.API.Configuration;
using InventarioCCL.API.Dtos;
using Microsoft.Extensions.Options;

namespace InventarioCCL.API.Services;

public class AuthService : IAuthService
{
    private readonly CredencialesSettings _credenciales;
    private readonly IJwtService _jwtService;

    public AuthService(IOptions<CredencialesSettings> credenciales, IJwtService jwtService)
    {
        _credenciales = credenciales.Value;
        _jwtService = jwtService;
    }

    public LoginResponse? Autenticar(LoginRequest request)
    {
        var credencialesValidas =
            string.Equals(request.Usuario, _credenciales.Usuario, StringComparison.Ordinal) &&
            string.Equals(request.Password, _credenciales.Password, StringComparison.Ordinal);

        if (!credencialesValidas)
        {
            return null;
        }

        var (token, expiraEn) = _jwtService.GenerarToken(request.Usuario);

        return new LoginResponse
        {
            Token = token,
            Usuario = request.Usuario,
            ExpiraEn = expiraEn
        };
    }
}
