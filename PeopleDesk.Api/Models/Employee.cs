
using System.ComponentModel.DataAnnotations;

namespace PeopleDesk.Api.Models;

public class Employee : IValidatableObject
{
    public int Id { get; set; }

    [Required(ErrorMessage = "First name is required.")]
    [StringLength(100, ErrorMessage = "First name cannot exceed 100 characters.")]
    public string FirstName { get; set; } = "";

    [Required(ErrorMessage = "Last name is required.")]
    [StringLength(100, ErrorMessage = "Last name cannot exceed 100 characters.")]
    public string LastName { get; set; } = "";

    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Enter a valid email address.")]
    [StringLength(254, ErrorMessage = "Email cannot exceed 254 characters.")]
    public string Email { get; set; } = "";

    [Required(ErrorMessage = "Department is required.")]
    [RegularExpression(
        "^(Engineering|Design|Human Resources|Marketing|Finance|Operations)$",
        ErrorMessage = "Select a valid department."
    )]
    public string Department { get; set; } = "";

    [Required(ErrorMessage = "Job title is required.")]
    [StringLength(100, ErrorMessage = "Job title cannot exceed 100 characters.")]
    public string JobTitle { get; set; } = "";

    [Required(ErrorMessage = "Status is required.")]
    [RegularExpression(
        "^(Active|On leave|Inactive)$",
        ErrorMessage = "Select a valid employee status."
    )]
    public string Status { get; set; } = "Active";

    public DateOnly HireDate { get; set; }

    public IEnumerable<ValidationResult> Validate(
        ValidationContext validationContext)
    {
        if (HireDate == default)
        {
            yield return new ValidationResult(
                "Hire date is required.",
                new[] { nameof(HireDate) }
            );
        }
        else if (HireDate > DateOnly.FromDateTime(DateTime.UtcNow))
        {
            yield return new ValidationResult(
                "Hire date cannot be in the future.",
                new[] { nameof(HireDate) }
            );
        }
    }
}
