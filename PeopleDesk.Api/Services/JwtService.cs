using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using PeopleDesk.Api.Models;

namespace PeopleDesk.Api.Services;

public class JwtService(IConfiguration configuration)
{
    public (string Token, DateTime ExpiresAtUtc) GenerateToken(
        ApplicationUser user,
        IList<string> roles)
    {
        var key = configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("JWT key is missing.");

        var issuer = configuration["Jwt:Issuer"]
            ?? throw new InvalidOperationException("JWT issuer is missing.");

        var audience = configuration["Jwt:Audience"]
            ?? throw new InvalidOperationException("JWT audience is missing.");

        var expiresAtUtc = DateTime.UtcNow.AddMinutes(60);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email ?? ""),
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Name, user.UserName ?? ""),
            new(ClaimTypes.GivenName, user.FirstName),
            new(ClaimTypes.Surname, user.LastName)
        };

        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var securityKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(key)
        );

        var credentials = new SigningCredentials(
            securityKey,
            SecurityAlgorithms.HmacSha256
        );

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expiresAtUtc,
            signingCredentials: credentials
        );

        return (
            new JwtSecurityTokenHandler().WriteToken(token),
            expiresAtUtc
        );
    }
}