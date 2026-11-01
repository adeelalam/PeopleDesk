
import type { Employee, EmployeeInput } from "./types";
import { request } from "./httpClient";

interface ApiEmployee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  jobTitle: string;
  status: string;
  hireDate: string;
}

function toEmployee(apiEmployee: ApiEmployee): Employee {
  return {
    id: apiEmployee.id,
    name: `${apiEmployee.firstName} ${apiEmployee.lastName}`.trim(),
    email: apiEmployee.email,
    role: apiEmployee.jobTitle,
    department: apiEmployee.department as Employee["department"],
    status: apiEmployee.status as Employee["status"],
    joined: apiEmployee.hireDate,
  };
}

function toApiEmployee(employee: EmployeeInput) {
  const nameParts = employee.name.trim().split(/\s+/);

  return {
    firstName: nameParts[0] ?? "",
    lastName: nameParts.slice(1).join(" "),
    email: employee.email,
    department: employee.department,
    jobTitle: employee.role,
    status: employee.status,
    hireDate: employee.joined,
  };
}

export async function getEmployees(): Promise<Employee[]> {
  const employees = await request<ApiEmployee[]>("/Employees");

  return employees.map(toEmployee);
}

export async function createEmployee(
  employee: EmployeeInput
): Promise<Employee> {
  const created = await request<ApiEmployee>("/Employees", {
    method: "POST",
    body: toApiEmployee(employee),
  });

  return toEmployee(created);
}

export async function updateEmployee(
  id: number,
  employee: EmployeeInput
): Promise<Employee> {
  const updated = await request<ApiEmployee>(`/Employees/${id}`, {
    method: "PUT",
    body: toApiEmployee(employee),
  });

  return toEmployee(updated);
}

export async function deleteEmployee(id: number): Promise<void> {
  await request<void>(`/Employees/${id}`, {
    method: "DELETE",
  });
}
