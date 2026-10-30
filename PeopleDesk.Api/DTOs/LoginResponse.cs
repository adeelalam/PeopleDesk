namespace PeopleDesk.Api.DTOs;

public class LoginResponse
{
    public string Token { get; set; } = "";
    public DateTime ExpiresAtUtc { get; set; }

    public string Id { get; set; } = "";
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public string Email { get; set; } = "";
}