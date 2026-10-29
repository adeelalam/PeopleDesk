export type Department =
  | "Engineering"
  | "Design"
  | "Human Resources"
  | "Marketing"
  | "Finance"
  | "Operations";

export type EmployeeStatus = "Active" | "On leave" | "Inactive";

export interface Employee {
  id: number;
  name: string;
  email: string;
  role: string;
  department: Department;
  status: EmployeeStatus;
  joined: string;
}

export type EmployeeInput = Omit<Employee, "id">;