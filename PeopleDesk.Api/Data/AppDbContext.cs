using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PeopleDesk.Api.Models;

namespace PeopleDesk.Api.Data;

public sealed class AppDbContext(
    DbContextOptions<AppDbContext> options
) : IdentityDbContext<ApplicationUser>(options)
{
    public DbSet<Employee> Employees => Set<Employee>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        var employee = modelBuilder.Entity<Employee>();

        employee.HasKey(e => e.Id);
        employee.Property(e => e.FirstName).HasMaxLength(80).IsRequired();
        employee.Property(e => e.LastName).HasMaxLength(80).IsRequired();
        employee.Property(e => e.Email).HasMaxLength(254).IsRequired();
        employee.HasIndex(e => e.Email).IsUnique();
        employee.Property(e => e.Department).HasMaxLength(100).IsRequired();
        employee.Property(e => e.JobTitle).HasMaxLength(120).IsRequired();
        employee.Property(e => e.Status).HasMaxLength(20).IsRequired();
    }
}