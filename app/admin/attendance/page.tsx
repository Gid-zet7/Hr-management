"use client";
import { useEffect, useState } from "react";

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
}
interface Attendance {
  _id: string;
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status?: "present" | "absent" | "leave";
}

const STATUS_OPTIONS = ["present", "absent", "leave"];

export default function AdminAttendancePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    employeeId: "",
    date: "",
    checkIn: "",
    checkOut: "",
    status: "present",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/employees").then((r) => r.json()),
      fetch("/api/attendance").then((r) => r.json()),
    ]).then(([emps, att]) => {
      setEmployees(emps);
      setAttendance(att);
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
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          checkIn: form.checkIn ? new Date(form.checkIn) : undefined,
          checkOut: form.checkOut ? new Date(form.checkOut) : undefined,
          date: form.date ? new Date(form.date) : undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to add attendance record");
      const newRec = await res.json();
      setAttendance([newRec, ...attendance]);
      setShowModal(false);
      setForm({
        employeeId: "",
        date: "",
        checkIn: "",
        checkOut: "",
        status: "present",
      });
    } catch (err: any) {
      setError(err.message || "Error");
    } finally {
      setSubmitting(false);
    }
  }

  function getEmployeeName(id: string) {
    const emp = employees.find((e) => e._id === id);
    return emp ? `${emp.firstName} ${emp.lastName}` : id;
  }

  return (
    <main className="max-w-5xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Manage Attendance</h1>
      <button
        className="mb-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={() => setShowModal(true)}
      >
        Add Attendance
      </button>
      {loading ? (
        <p>Loading...</p>
      ) : attendance.length === 0 ? (
        <p>No attendance records found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">Employee</th>
                <th className="py-2 px-4 text-left">Date</th>
                <th className="py-2 px-4 text-left">Status</th>
                <th className="py-2 px-4 text-left">Check In</th>
                <th className="py-2 px-4 text-left">Check Out</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((rec) => (
                <tr key={rec._id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{getEmployeeName(rec.employeeId)}</td>
                  <td className="py-2 px-4">{rec.date ? new Date(rec.date).toLocaleDateString() : ""}</td>
                  <td className="py-2 px-4 capitalize">{rec.status}</td>
                  <td className="py-2 px-4">{rec.checkIn ? new Date(rec.checkIn).toLocaleTimeString() : ""}</td>
                  <td className="py-2 px-4">{rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString() : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Modal for Add Attendance */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={() => setShowModal(false)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Add Attendance</h2>
            {error && <p className="text-red-600 mb-2">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Employee</label>
                <select
                  name="employeeId"
                  value={form.employeeId}
                  onChange={handleChange}
                  required
                  className="border px-3 py-2 rounded w-full"
                >
                  <option value="">Select employee</option>
                  {employees.map((e) => (
                    <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Date</label>
                <input
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  className="border px-3 py-2 rounded w-full"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="border px-3 py-2 rounded w-full"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <div className="w-1/2">
                  <label className="block mb-1 font-medium">Check In</label>
                  <input
                    name="checkIn"
                    type="time"
                    value={form.checkIn}
                    onChange={handleChange}
                    className="border px-3 py-2 rounded w-full"
                  />
                </div>
                <div className="w-1/2">
                  <label className="block mb-1 font-medium">Check Out</label>
                  <input
                    name="checkOut"
                    type="time"
                    value={form.checkOut}
                    onChange={handleChange}
                    className="border px-3 py-2 rounded w-full"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
                disabled={submitting}
              >
                {submitting ? "Adding..." : "Add Attendance"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
