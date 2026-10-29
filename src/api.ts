
import type { Employee, EmployeeInput } from "./types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5183/api";

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

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `API request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
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
    body: JSON.stringify(toApiEmployee(employee)),
  });

  return toEmployee(created);
}

export async function updateEmployee(
  id: number,
  employee: EmployeeInput
): Promise<Employee> {
  const updated = await request<ApiEmployee>(`/Employees/${id}`, {
    method: "PUT",
    body: JSON.stringify(toApiEmployee(employee)),
  });

  return toEmployee(updated);
}

export async function deleteEmployee(id: number): Promise<void> {
  await request<void>(`/Employees/${id}`, {
    method: "DELETE",
  });
}
