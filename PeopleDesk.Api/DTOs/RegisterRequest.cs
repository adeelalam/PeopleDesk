using System.ComponentModel.DataAnnotations;

namespace PeopleDesk.Api.DTOs;

public class RegisterRequest
{
    [Required]
    [StringLength(80)]
    public string FirstName { get; set; } = "";

    [Required]
    [StringLength(80)]
    public string LastName { get; set; } = "";

    [Required]
    [EmailAddress]
    public string Email { get; set; } = "";

    [Required]
    [MinLength(8)]
    public string Password { get; set; } = "";
}