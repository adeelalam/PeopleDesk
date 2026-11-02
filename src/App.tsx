import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  Activity,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  LayoutDashboard,
  Mail,
  Menu,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Settings,
  Trash2,
  UserRound,
  Users,
  X,
  LogOut,
} from "lucide-react";

import { useAuth } from "./AuthContext";
import Login from "./Login";

import {
  getEmployees,
  createEmployee,
  updateEmployee as updateEmployeeApi,
  deleteEmployee as deleteEmployeeApi,
} from "./api";

import type {
  Department,
  Employee,
  EmployeeInput,
  EmployeeStatus,
} from "./types";

const departments: Department[] = [
  "Engineering",
  "Design",
  "Human Resources",
  "Marketing",
  "Finance",
  "Operations",
];

const statuses: EmployeeStatus[] = ["Active", "On leave", "Inactive"];

const emptyForm: EmployeeInput = {
  name: "",
  email: "",
  role: "",
  department: "Engineering",
  status: "Active",
  joined: new Date().toISOString().slice(0, 10),
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function App() {

  const { user, isAuthenticated, logout } = useAuth();

  const userInitials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : "U";

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] =
    useState("All departments");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] =
    useState<Employee | null>(null);
  const [form, setForm] = useState<EmployeeInput>(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const pageSize = 6;

  // Load employees from the .NET API when the page opens.
 useEffect(() => {
  if (!isAuthenticated) {
    setEmployees([]);
    setLoading(false);
    return;
  }

  let cancelled = false;

  async function loadEmployees() {
    try {
      setLoading(true);
      setApiError("");

      const data = await getEmployees();

      if (!cancelled) {
        setEmployees(data);
      }
    } catch (error) {
      if (!cancelled) {
        setApiError(
          error instanceof Error
            ? error.message
            : "Failed to load employees from the server."
        );
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  }

  void loadEmployees();

  return () => {
    cancelled = true;
  };
}, [isAuthenticated]);

  // Automatically dismiss success messages.
  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return employees.filter((employee) => {
      const matchesSearch =
        !query ||
        [
          employee.name,
          employee.email,
          employee.role,
          employee.department,
        ].some((value) => value.toLowerCase().includes(query));

      const matchesDepartment =
        departmentFilter === "All departments" ||
        employee.department === departmentFilter;

      const matchesStatus =
        statusFilter === "All statuses" ||
        employee.status === statusFilter;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [employees, search, departmentFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const visibleEmployees = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const activeCount = employees.filter(
    (employee) => employee.status === "Active"
  ).length;

  const onLeaveCount = employees.filter(
    (employee) => employee.status === "On leave"
  ).length;

  function openCreate() {
    setEditingEmployee(null);
    setForm({
      ...emptyForm,
      joined: new Date().toISOString().slice(0, 10),
    });
    setFormError("");
    setApiError("");
    setModalOpen(true);
  }

  function openEdit(employee: Employee) {
    setEditingEmployee(employee);

    const { id: _id, ...input } = employee;
    setForm(input);

    setFormError("");
    setApiError("");
    setModalOpen(true);
  }

  // Create a new employee or update an existing employee through the API.
  async function saveEmployee(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    // Validate required fields.
    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.role.trim() ||
      !form.joined
    ) {
      setFormError(
        "Please complete name, email, job title and join date."
      );
      return;
    }

    // Validate email format.
    const email = form.email.trim();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      setFormError("Enter a valid email address.");
      return;
    }

     // Prevent duplicate email addresses.
    const duplicate = employees.some(
      (employee) =>
        employee.email.toLowerCase() ===
          form.email.trim().toLowerCase() &&
        employee.id !== editingEmployee?.id
    );

    if (duplicate) {
      setFormError("An employee with this email already exists.");
      return;
    }

// To Do: Validate hire date.
// const today = new Date();

// const todayString = [
//   today.getFullYear(),
//   String(today.getMonth() + 1).padStart(2, "0"),
//   String(today.getDate()).padStart(2, "0"),
// ].join("-");

// const hireDatePattern = /^\d{4}-\d{2}-\d{2}$/;

// if (
//   !hireDatePattern.test(form.joined) ||
//   Number.isNaN(new Date(`${form.joined}T00:00:00`).getTime()) ||
//   new Date(`${form.joined}T00:00:00`).toISOString().slice(0, 10) !== form.joined
// ) {
//   setFormError("Enter a valid hire date.");
//   return;
// }

// if (form.joined > todayString) {
//   setFormError("Hire date cannot be in the future.");
//   return;
// }

// Validate department.
const validDepartments = [
  "Engineering",
  "Design",
  "Human Resources",
  "Marketing",
  "Finance",
  "Operations",
];

if (!validDepartments.includes(form.department)) {
  setFormError("Please select a valid department.");
  return;
}

// Validate employee status.
const validStatuses = ["Active", "On leave", "Inactive"];

if (!validStatuses.includes(form.status)) {
  setFormError("Please select a valid employee status.");
  return;
}

    const normalized: EmployeeInput = {
      ...form,
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role.trim(),
    };

    try {
      setSaving(true);
      setFormError("");
      setApiError("");

      if (editingEmployee) {
        const updated = await updateEmployeeApi(
          editingEmployee.id,
          normalized
        );

        setEmployees((current) =>
          current.map((employee) =>
            employee.id === updated.id ? updated : employee
          )
        );

        setToast("Employee updated successfully");
      } else {
        const created = await createEmployee(normalized);

        setEmployees((current) => [created, ...current]);
        setToast("Employee added successfully");
        setPage(1);
      }

      setModalOpen(false);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Failed to save employee. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  // Delete the selected employee through the API.
  async function deleteEmployee() {
    if (!deleteTarget || deleting) return;

    try {
      setDeleting(true);
      setApiError("");

      await deleteEmployeeApi(deleteTarget.id);

      setEmployees((current) =>
        current.filter((employee) => employee.id !== deleteTarget.id)
      );

      setDeleteTarget(null);
      setToast("Employee deleted");
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Failed to delete employee."
      );
    } finally {
      setDeleting(false);
    }
  }

  function resetFilters() {
    setSearch("");
    setDepartmentFilter("All departments");
    setStatusFilter("All statuses");
    setPage(1);
  }

  function exportCsv() {
    const escapeCsv = (value: string) =>
      `"${value.replaceAll('"', '""')}"`;

    const rows = [
      ["Name", "Email", "Job title", "Department", "Status", "Join date"],
      ...filtered.map((employee) => [
        employee.name,
        employee.email,
        employee.role,
        employee.department,
        employee.status,
        employee.joined,
      ]),
    ];

    const csv = rows
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" })
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = "employees.csv";
    link.click();

    URL.revokeObjectURL(url);
    setToast("Employee list exported");
  }

  if (!isAuthenticated || !user) {
    return <Login />;
  }

  return (
    <div className="app-shell">
      <aside
        className={`sidebar ${mobileNavOpen ? "sidebar-open" : ""}`}
      >
        <div className="brand">
          <div className="brand-mark">
            <Users size={21} strokeWidth={2.4} />
          </div>

          <span>
            people<span className="brand-light">desk</span>
          </span>

          <button
            className="icon-button mobile-close"
            aria-label="Close menu"
            onClick={() => setMobileNavOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <nav className="nav-list">
          <button className="nav-item">
            <LayoutDashboard size={18} />
            Overview
          </button>

          <button className="nav-item active">
            <Users size={18} />
            Employees
            <span className="nav-count">{employees.length}</span>
          </button>

          <button className="nav-item">
            <CalendarDays size={18} />
            Attendance
          </button>

          <button className="nav-item">
            <BriefcaseBusiness size={18} />
            Departments
          </button>

          <button className="nav-item">
            <Activity size={18} />
            Reports
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="workspace-label">PREFERENCES</div>

          <button className="nav-item">
            <Settings size={18} />
            Settings
          </button>

          <button className="nav-item">
            <CircleHelp size={18} />
            Help &amp; support
          </button>

          <div className="sidebar-profile">
  <div className="avatar avatar-admin">{userInitials}</div>

  <div className="profile-copy">
    <strong>{user.firstName} {user.lastName}</strong>
    <span>{user.email}</span>
  </div>

  <button
    type="button"
    className="icon-button"
    aria-label="Log out"
    title="Log out"
    onClick={logout}
  >
    <LogOut size={18} />
  </button>
</div>
</div>
</aside>       

      {mobileNavOpen && (
        <button
          className="nav-scrim"
          aria-label="Close navigation"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              aria-label="Open menu"
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu size={20} />
            </button>

            <span>Workspace</span>
            <span className="crumb-slash">/</span>
            <strong>Employees</strong>
          </div>

          <div className="topbar-actions">
            <div className="search-global">
              <Search size={16} />
              <span>Search anything...</span>
              <kbd>⌘ K</kbd>
            </div>

            <button
              className="icon-button notification-button"
              aria-label="Notifications"
            >
              <Bell size={19} />
              <i />
            </button>

            <div className="top-avatar">{ userInitials}</div>
          </div>
        </header>

        <div className="content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                <Building2 size={14} />
                PEOPLE &amp; CULTURE
              </div>

              <h1>
                Employees <span className="heading-count">{employees.length}</span>
              </h1>

              <p className="subtitle">
                Manage your people, teams, and employee information.
              </p>
            </div>

            <button className="primary-button" onClick={openCreate}>
              <Plus size={17} />
              Add employee
            </button>
          </div>

          <section className="stats-grid" aria-label="Employee statistics">
            <StatCard
              icon={<Users size={18} />}
              label="Total employees"
              value={employees.length.toString()}
              note="Across all departments"
              tone="violet"
            />

            <StatCard
              icon={<Activity size={18} />}
              label="Active employees"
              value={activeCount.toString()}
              note={`${
                employees.length
                  ? Math.round((activeCount / employees.length) * 100)
                  : 0
              }% of workforce`}
              tone="green"
            />

            <StatCard
              icon={<Clock3 size={18} />}
              label="On leave"
              value={onLeaveCount.toString()}
              note="Currently away"
              tone="amber"
            />

            <StatCard
              icon={<Building2 size={18} />}
              label="Departments"
              value={new Set(
                employees.map((employee) => employee.department)
              ).size.toString()}
              note="Teams represented"
              tone="blue"
            />
          </section>

          <section className="directory-card">
            <div className="directory-heading">
              <div>
                <h2>All employees</h2>
                <p>A directory of everyone in your workspace.</p>
              </div>

              <button
                className="secondary-button export-button"
                onClick={exportCsv}
                disabled={loading || employees.length === 0}
              >
                Export CSV <ChevronDown size={15} />
              </button>
            </div>

            {apiError && (
              <div className="form-error" role="alert">
                {apiError}
              </div>
            )}

            <div className="filters">
              <label className="search-field">
                <Search size={17} />
                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search employees..."
                  aria-label="Search employees"
                />
              </label>

              <label className="select-wrap">
                <span className="sr-only">Filter by department</span>
                <select
                  value={departmentFilter}
                  onChange={(event) => {
                    setDepartmentFilter(event.target.value);
                    setPage(1);
                  }}
                >
                  <option>All departments</option>
                  {departments.map((department) => (
                    <option key={department}>{department}</option>
                  ))}
                </select>
                <ChevronDown size={15} />
              </label>

              <label className="select-wrap">
                <span className="sr-only">Filter by status</span>
                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value);
                    setPage(1);
                  }}
                >
                  <option>All statuses</option>
                  {statuses.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
                <ChevronDown size={15} />
              </label>

              {(search ||
                departmentFilter !== "All departments" ||
                statusFilter !== "All statuses") && (
                <button className="clear-filters" onClick={resetFilters}>
                  Clear filters
                </button>
              )}
            </div>

            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        aria-label="Select all visible employees"
                      />
                    </th>
                    <th>EMPLOYEE</th>
                    <th>JOB TITLE</th>
                    <th>DEPARTMENT</th>
                    <th>STATUS</th>
                    <th>JOIN DATE</th>
                    <th>
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {visibleEmployees.map((employee) => (
                    <tr key={employee.id}>
                      <td>
                        <input
                          type="checkbox"
                          aria-label={`Select ${employee.name}`}
                        />
                      </td>

                      <td>
                        <div className="employee-cell">
                          <div
                            className={`avatar avatar-${employee.id % 6}`}
                          >
                            {initials(employee.name)}
                          </div>

                          <div className="employee-copy">
                            <strong>{employee.name}</strong>
                            <span>{employee.email}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="job-title">{employee.role}</span>
                      </td>

                      <td>
                        <span className="department-tag">
                          <span
                            className={`department-dot dot-${employee.department
                              .toLowerCase()
                              .replaceAll(" ", "-")}`}
                          />
                          {employee.department}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`status status-${employee.status
                            .toLowerCase()
                            .replaceAll(" ", "-")}`}
                        >
                          <i />
                          {employee.status}
                        </span>
                      </td>

                      <td className="date-cell">
                        {new Date(
                          `${employee.joined}T12:00:00`
                        ).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td>
                        <div className="row-actions">
                          <button
                            className="icon-button"
                            aria-label={`Edit ${employee.name}`}
                            onClick={() => openEdit(employee)}
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            className="icon-button delete-action"
                            aria-label={`Delete ${employee.name}`}
                            onClick={() => {
                              setApiError("");
                              setDeleteTarget(employee);
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {!loading && visibleEmployees.length === 0 && (
                    <tr>
                      <td colSpan={7}>
                        <div className="empty-state">
                          <Search size={25} />
                          <strong>No employees found</strong>
                          <span>
                            {apiError
                              ? "Check the server connection and try again."
                              : "Try changing your search or filters."}
                          </span>
                          <button
                            className="secondary-button"
                            onClick={resetFilters}
                          >
                            Clear filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}

                  {loading && (
                    <tr>
                      <td colSpan={7}>
                        <div className="empty-state" role="status">
                          <span>Loading employees from the server...</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <footer className="table-footer">
              <span>
                Showing{" "}
                <strong>
                  {filtered.length
                    ? (safePage - 1) * pageSize + 1
                    : 0}
                  –{Math.min(safePage * pageSize, filtered.length)}
                </strong>{" "}
                of <strong>{filtered.length}</strong> employees
              </span>

              <div className="pagination">
                <button
                  className="page-arrow"
                  disabled={safePage === 1}
                  aria-label="Previous page"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  <ChevronLeft size={17} />
                </button>

                <span>
                  Page <strong>{safePage}</strong> of{" "}
                  <strong>{totalPages}</strong>
                </span>

                <button
                  className="page-arrow"
                  disabled={safePage === totalPages}
                  aria-label="Next page"
                  onClick={() =>
                    setPage((current) =>
                      Math.min(totalPages, current + 1)
                    )
                  }
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </footer>
          </section>

          <div className="page-footnote">
            <span>
              <span className="live-dot" />
              {loading
                ? "Connecting to server..."
                : apiError
                  ? "Server connection needs attention"
                  : "Connected to employee database"}
            </span>

            <span>
              PeopleDesk <span className="footnote-divider">·</span>{" "}
              Employee directory
            </span>
          </div>
        </div>
      </main>

      {modalOpen && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setModalOpen(false);
            }
          }}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="employee-modal-title"
          >
            <div className="modal-header">
              <div>
                <div className="modal-icon">
                  <UserRound size={20} />
                </div>

                <h2 id="employee-modal-title">
                  {editingEmployee ? "Edit employee" : "Add employee"}
                </h2>

                <p>
                  {editingEmployee
                    ? "Update this employee's information."
                    : "Add a new person to your workspace."}
                </p>
              </div>

              <button
                className="icon-button"
                aria-label="Close dialog"
                disabled={saving}
                onClick={() => setModalOpen(false)}
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={saveEmployee}>
              <div className="form-grid">
                <label className="form-field full">
                  <span>
                    Full name <b>*</b>
                  </span>
                  <input
                    autoFocus
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    placeholder="e.g. Alex Morgan"
                    required
                  />
                </label>

                <label className="form-field full">
                  <span>
                    Email address <b>*</b>
                  </span>
                  <div className="input-with-icon">
                    <Mail size={16} />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          email: event.target.value,
                        }))
                      }
                      placeholder="alex@company.com"
                      required
                    />
                  </div>
                </label>

                <label className="form-field full">
                  <span>
                    Job title <b>*</b>
                  </span>
                  <input
                    value={form.role}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        role: event.target.value,
                      }))
                    }
                    placeholder="e.g. Software Engineer"
                    required
                  />
                </label>

                <label className="form-field">
                  <span>Department</span>
                  <select
                    value={form.department}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        department: event.target.value as Department,
                      }))
                    }
                  >
                    {departments.map((department) => (
                      <option key={department}>{department}</option>
                    ))}
                  </select>
                </label>

                <label className="form-field">
                  <span>Status</span>
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        status: event.target.value as EmployeeStatus,
                      }))
                    }
                  >
                    {statuses.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </label>

                <label className="form-field full">
                  <span>
                    Join date <b>*</b>
                  </span>
                  <input
                    type="date"
                    value={form.joined}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        joined: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
              </div>

              {formError && (
                <div className="form-error" role="alert">
                  {formError}
                </div>
              )}

              <div className="modal-footer">
                <button
                  type="button"
                  className="secondary-button"
                  disabled={saving}
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  <Check size={16} />
                  {saving
                    ? "Saving..."
                    : editingEmployee
                      ? "Save changes"
                      : "Add employee"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {deleteTarget && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleting) {
              setDeleteTarget(null);
            }
          }}
        >
          <section
            className="modal confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
          >
            <div className="confirm-icon">
              <Trash2 size={22} />
            </div>

            <h2 id="delete-title">Delete employee?</h2>

            <p>
              Are you sure you want to remove{" "}
              <strong>{deleteTarget.name}</strong>? This action cannot be
              undone.
            </p>

            <div className="modal-footer">
              <button
                className="secondary-button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>

              <button
                className="danger-button"
                disabled={deleting}
                onClick={() => void deleteEmployee()}
              >
                <Trash2 size={16} />
                {deleting ? "Deleting..." : "Delete employee"}
              </button>
            </div>
          </section>
        </div>
      )}

      {toast && (
        <div className="toast" role="status">
          <span className="toast-check">
            <Check size={15} />
          </span>

          {toast}

          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  note,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  note: string;
  tone: string;
}) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <span className={`stat-icon ${tone}`}>{icon}</span>
        <button
          className="icon-button stat-more"
          aria-label={`${label} details`}
        >
          <MoreHorizontal size={18} />
        </button>
      </div>

      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-note">{note}</div>
    </article>
  );
}

export default App;