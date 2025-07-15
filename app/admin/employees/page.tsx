"use client";
import { useEffect, useState } from "react";

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
  hireDate?: string;
  salary?: number;
  employmentStatus?: string;
}

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    hireDate: "",
    salary: "",
    employmentStatus: "active",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/employees")
      .then((r) => r.json())
      .then((data) => {
        setEmployees(data);
        setLoading(false);
      });
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          salary: form.salary ? Number(form.salary) : undefined,
          hireDate: form.hireDate ? new Date(form.hireDate) : undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to add employee");
      const newEmp = await res.json();
      setEmployees([newEmp, ...employees]);
      setShowModal(false);
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        department: "",
        position: "",
        hireDate: "",
        salary: "",
        employmentStatus: "active",
      });
    } catch (err: any) {
      setError(err.message || "Error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Manage Employees</h1>
      <button
        className="mb-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={() => setShowModal(true)}
      >
        Add Employee
      </button>
      {loading ? (
        <p>Loading...</p>
      ) : employees.length === 0 ? (
        <p>No employees found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">Name</th>
                <th className="py-2 px-4 text-left">Email</th>
                <th className="py-2 px-4 text-left">Department</th>
                <th className="py-2 px-4 text-left">Position</th>
                <th className="py-2 px-4 text-left">Status</th>
                <th className="py-2 px-4 text-left">Hire Date</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp._id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{emp.firstName} {emp.lastName}</td>
                  <td className="py-2 px-4">{emp.email}</td>
                  <td className="py-2 px-4">{emp.department}</td>
                  <td className="py-2 px-4">{emp.position}</td>
                  <td className="py-2 px-4">{emp.employmentStatus}</td>
                  <td className="py-2 px-4">{emp.hireDate ? new Date(emp.hireDate).toLocaleDateString() : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Modal for Add Employee */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={() => setShowModal(false)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Add Employee</h2>
            {error && <p className="text-red-600 mb-2">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2">
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                  placeholder="First Name"
                  className="border px-3 py-2 rounded w-1/2"
                />
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Last Name"
                  className="border px-3 py-2 rounded w-1/2"
                />
              </div>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="Email"
                className="border px-3 py-2 rounded w-full"
              />
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone"
                className="border px-3 py-2 rounded w-full"
              />
              <input
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="Department"
                className="border px-3 py-2 rounded w-full"
              />
              <input
                name="position"
                value={form.position}
                onChange={handleChange}
                placeholder="Position"
                className="border px-3 py-2 rounded w-full"
              />
              <input
                name="hireDate"
                type="date"
                value={form.hireDate}
                onChange={handleChange}
                className="border px-3 py-2 rounded w-full"
              />
              <input
                name="salary"
                type="number"
                value={form.salary}
                onChange={handleChange}
                placeholder="Salary"
                className="border px-3 py-2 rounded w-full"
              />
              <select
                name="employmentStatus"
                value={form.employmentStatus}
                onChange={handleChange}
                className="border px-3 py-2 rounded w-full"
              >
                <option value="active">Active</option>
                <option value="terminated">Terminated</option>
                <option value="on_leave">On Leave</option>
              </select>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
                disabled={submitting}
              >
                {submitting ? "Adding..." : "Add Employee"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
