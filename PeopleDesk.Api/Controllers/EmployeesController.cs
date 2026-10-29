
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PeopleDesk.Api.Data;
using PeopleDesk.Api.Models;

namespace PeopleDesk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmployeesController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Employee>>> GetAll()
    {
        var employees = await db.Employees
            .AsNoTracking()
            .OrderBy(e => e.LastName)
            .ThenBy(e => e.FirstName)
            .ToListAsync();

        return Ok(employees);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Employee>> GetById(int id)
    {
        var employee = await db.Employees.FindAsync(id);

        if (employee is null)
            return NotFound();

        return Ok(employee);
    }

    
[HttpPost]
public async Task<ActionResult<Employee>> Create(Employee employee)
{
    var email = employee.Email.Trim();

    var emailExists = await db.Employees
        .AnyAsync(e => e.Email.ToLower() == email.ToLower());

    if (emailExists)
    {
        return Conflict(new
        {
            message = "An employee with this email already exists."
        });
    }

    employee.FirstName = employee.FirstName.Trim();
    employee.LastName = employee.LastName.Trim();
    employee.Email = email;
    employee.JobTitle = employee.JobTitle.Trim();

    db.Employees.Add(employee);
    await db.SaveChangesAsync();

    return CreatedAtAction(
        nameof(GetById),
        new { id = employee.Id },
        employee
    );
}


    
[HttpPut("{id:int}")]
public async Task<IActionResult> Update(int id, Employee employee)
{
    if (id != employee.Id)
    {
        return BadRequest(new
        {
            message = "The employee ID in the URL does not match the request body."
        });
    }

    var existingEmployee = await db.Employees.FindAsync(id);

    if (existingEmployee is null)
    {
        return NotFound(new
        {
            message = $"Employee with ID {id} was not found."
        });
    }

    var email = employee.Email.Trim();

    var emailExists = await db.Employees
        .AnyAsync(e => e.Id != id &&
                       e.Email.ToLower() == email.ToLower());

    if (emailExists)
    {
        return Conflict(new
        {
            message = "Another employee with this email already exists."
        });
    }

    existingEmployee.FirstName = employee.FirstName.Trim();
    existingEmployee.LastName = employee.LastName.Trim();
    existingEmployee.Email = email;
    existingEmployee.Department = employee.Department;
    existingEmployee.JobTitle = employee.JobTitle.Trim();
    existingEmployee.Status = employee.Status;
    existingEmployee.HireDate = employee.HireDate;

    await db.SaveChangesAsync();

    return NoContent();
}

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var employee = await db.Employees.FindAsync(id);

        if (employee is null)
            return NotFound();

        db.Employees.Remove(employee);
        await db.SaveChangesAsync();

        return NoContent();
    }
}
