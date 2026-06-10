using InventarioCCL.API.Dtos;
using InventarioCCL.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace InventarioCCL.API.Controllers;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>POST /auth/login — autentica al usuario y devuelve un token JWT.</summary>
    [HttpPost("login")]
    public ActionResult<LoginResponse> Login([FromBody] LoginRequest request)
    {
        var resultado = _authService.Autenticar(request);

        if (resultado is null)
        {
            return Unauthorized(new { mensaje = "Usuario o contraseña incorrectos." });
        }

        return Ok(resultado);
    }
}
