using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using PeopleDesk.Api.DTOs;
using PeopleDesk.Api.Models;
using PeopleDesk.Api.Services;

namespace PeopleDesk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(
    UserManager<ApplicationUser> userManager,
    JwtService jwtService
) : ControllerBase
{
    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(
        RegisterRequest request)
    {
        var email = request.Email.Trim();

        var existingUser = await userManager.FindByEmailAsync(email);

        if (existingUser is not null)
        {
            return Conflict(new
            {
                message = "A user with this email already exists."
            });
        }

        var user = new ApplicationUser
        {
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Email = email,
            UserName = email
        };

        var result = await userManager.CreateAsync(
            user,
            request.Password
        );

        if (!result.Succeeded)
        {
            return BadRequest(new
            {
                errors = result.Errors.Select(error => error.Description)
            });
        }

        var response = new AuthResponse
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email!
        };

        return Created(
            $"/api/auth/users/{user.Id}",
            response
        );
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login(
        LoginRequest request)
    {
        var email = request.Email.Trim();

        var user = await userManager.FindByEmailAsync(email);

        if (user is null)
        {
            return Unauthorized(new
            {
                message = "Invalid email or password."
            });
        }

        var passwordValid = await userManager.CheckPasswordAsync(
            user,
            request.Password
        );

        if (!passwordValid)
        {
            return Unauthorized(new
            {
                message = "Invalid email or password."
            });
        }

        var roles = await userManager.GetRolesAsync(user);

        var (token, expiresAtUtc) = jwtService.GenerateToken(
            user,
            roles
        );

        var response = new LoginResponse
        {
            Token = token,
            ExpiresAtUtc = expiresAtUtc,
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email!
        };

        return Ok(response);
    }
}