"use client";
import { useEffect, useState } from "react";

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
}
interface PerformanceReview {
  _id: string;
  employeeId: string;
  reviewerId: string;
  date: string;
  score?: number;
  comments?: string;
  goals?: string;
}
interface Task {
  _id: string;
  title: string;
  description?: string;
  employeeId: string;
  dueDate?: string;
  completed?: boolean;
}

const SCORE_OPTIONS = [1, 2, 3, 4, 5];

export default function AdminPerformancePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [form, setForm] = useState({
    employeeId: "",
    reviewerId: "",
    date: "",
    score: 3,
    comments: "",
    goals: "",
  });
  const [taskForm, setTaskForm] = useState({
    employeeId: "",
    title: "",
    description: "",
    dueDate: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [taskSubmitting, setTaskSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [taskError, setTaskError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/employees").then((r) => r.json()),
      fetch("/api/performance").then((r) => r.json()),
      fetch("/api/tasks").then((r) => r.json()),
    ]).then(([emps, revs, tks]) => {
      setEmployees(emps);
      setReviews(revs);
      setTasks(tks);
      setLoading(false);
    });
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          score: Number(form.score),
          date: form.date ? new Date(form.date) : undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to add review");
      const newRev = await res.json();
      setReviews([newRev, ...reviews]);
      setShowModal(false);
      setForm({
        employeeId: "",
        reviewerId: "",
        date: "",
        score: 3,
        comments: "",
        goals: "",
      });
    } catch (err: any) {
      setError(err.message || "Error");
    } finally {
      setSubmitting(false);
    }
  }

  // Task assignment
  function handleTaskChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setTaskForm({ ...taskForm, [e.target.name]: e.target.value });
  }
  async function handleTaskSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTaskSubmitting(true);
    setTaskError("");
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...taskForm,
          dueDate: taskForm.dueDate ? new Date(taskForm.dueDate) : undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to assign task");
      const newTask = await res.json();
      setTasks([newTask, ...tasks]);
      setShowTaskModal(false);
      setTaskForm({ employeeId: "", title: "", description: "", dueDate: "" });
    } catch (err: any) {
      setTaskError(err.message || "Error");
    } finally {
      setTaskSubmitting(false);
    }
  }

  function getEmployeeName(id: string) {
    const emp = employees.find((e) => e._id === id);
    return emp ? `${emp.firstName} ${emp.lastName}` : id;
  }

  // Calculate performance score based on completed tasks
  function getTaskScore(employeeId: string) {
    const total = tasks.filter((t) => t.employeeId === employeeId).length;
    const completed = tasks.filter((t) => t.employeeId === employeeId && t.completed).length;
    return total === 0 ? 0 : Math.round((completed / total) * 5);
  }

  return (
    <main className="max-w-5xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Manage Performance Reviews</h1>
      <div className="flex gap-4 mb-6">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => setShowModal(true)}
        >
          Add Review
        </button>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={() => setShowTaskModal(true)}
        >
          Assign Task
        </button>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="overflow-x-auto mb-10">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 text-left">Employee</th>
                  <th className="py-2 px-4 text-left">Reviewer</th>
                  <th className="py-2 px-4 text-left">Date</th>
                  <th className="py-2 px-4 text-left">Score</th>
                  <th className="py-2 px-4 text-left">Task Score</th>
                  <th className="py-2 px-4 text-left">Comments</th>
                  <th className="py-2 px-4 text-left">Goals</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((rev) => (
                  <tr key={rev._id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4">{getEmployeeName(rev.employeeId)}</td>
                    <td className="py-2 px-4">{rev.reviewerId}</td>
                    <td className="py-2 px-4">{rev.date ? new Date(rev.date).toLocaleDateString() : ""}</td>
                    <td className="py-2 px-4">{rev.score}</td>
                    <td className="py-2 px-4">{getTaskScore(rev.employeeId)}</td>
                    <td className="py-2 px-4">{rev.comments}</td>
                    <td className="py-2 px-4">{rev.goals}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="overflow-x-auto">
            <h2 className="text-lg font-semibold mb-2">Employee Tasks</h2>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 text-left">Employee</th>
                  <th className="py-2 px-4 text-left">Title</th>
                  <th className="py-2 px-4 text-left">Description</th>
                  <th className="py-2 px-4 text-left">Due Date</th>
                  <th className="py-2 px-4 text-left">Completed</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task._id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4">{getEmployeeName(task.employeeId)}</td>
                    <td className="py-2 px-4">{task.title}</td>
                    <td className="py-2 px-4">{task.description}</td>
                    <td className="py-2 px-4">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ""}</td>
                    <td className="py-2 px-4">{task.completed ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {/* Modal for Add Review */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={() => setShowModal(false)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Add Performance Review</h2>
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
                <label className="block mb-1 font-medium">Reviewer (Admin ID or Email)</label>
                <input
                  name="reviewerId"
                  value={form.reviewerId}
                  onChange={handleChange}
                  required
                  placeholder="Reviewer ID or Email"
                  className="border px-3 py-2 rounded w-full"
                />
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
                <label className="block mb-1 font-medium">Score</label>
                <select
                  name="score"
                  value={form.score}
                  onChange={handleChange}
                  className="border px-3 py-2 rounded w-full"
                >
                  {SCORE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Comments</label>
                <textarea
                  name="comments"
                  value={form.comments}
                  onChange={handleChange}
                  className="border px-3 py-2 rounded w-full"
                  rows={2}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Goals</label>
                <textarea
                  name="goals"
                  value={form.goals}
                  onChange={handleChange}
                  className="border px-3 py-2 rounded w-full"
                  rows={2}
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
                disabled={submitting}
              >
                {submitting ? "Adding..." : "Add Review"}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Modal for Assign Task */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={() => setShowTaskModal(false)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Assign Task</h2>
            {taskError && <p className="text-red-600 mb-2">{taskError}</p>}
            <form onSubmit={handleTaskSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Employee</label>
                <select
                  name="employeeId"
                  value={taskForm.employeeId}
                  onChange={handleTaskChange}
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
                <label className="block mb-1 font-medium">Title</label>
                <input
                  name="title"
                  value={taskForm.title}
                  onChange={handleTaskChange}
                  required
                  className="border px-3 py-2 rounded w-full"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Description</label>
                <textarea
                  name="description"
                  value={taskForm.description}
                  onChange={handleTaskChange}
                  className="border px-3 py-2 rounded w-full"
                  rows={2}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Due Date</label>
                <input
                  name="dueDate"
                  type="date"
                  value={taskForm.dueDate}
                  onChange={handleTaskChange}
                  className="border px-3 py-2 rounded w-full"
                />
              </div>
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
                disabled={taskSubmitting}
              >
                {taskSubmitting ? "Assigning..." : "Assign Task"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
