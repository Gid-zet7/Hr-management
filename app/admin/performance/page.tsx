"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSelectChange(name: string, value: string) {
    setForm({ ...form, [name]: value });
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
  function handleTaskChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setTaskForm({ ...taskForm, [e.target.name]: e.target.value });
  }
  function handleTaskSelectChange(name: string, value: string) {
    setTaskForm({ ...taskForm, [name]: value });
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
    const completed = tasks.filter(
      (t) => t.employeeId === employeeId && t.completed
    ).length;
    return total === 0 ? 0 : Math.round((completed / total) * 5);
  }

  return (
    <main className="max-w-5xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Manage Performance Reviews</h1>
      <div className="flex gap-4 mb-6">
        <Button
          variant="default"
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowModal(true)}
        >
          Add Review
        </Button>
        <Button
          variant="default"
          className="bg-green-600 hover:bg-green-700"
          onClick={() => setShowTaskModal(true)}
        >
          Assign Task
        </Button>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="overflow-x-auto mb-10">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead>Employee</TableHead>
                  <TableHead>Reviewer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Task Score</TableHead>
                  <TableHead>Comments</TableHead>
                  <TableHead>Goals</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((rev) => (
                  <TableRow key={rev._id} className="border-b hover:bg-gray-50">
                    <TableCell>{getEmployeeName(rev.employeeId)}</TableCell>
                    <TableCell>{rev.reviewerId}</TableCell>
                    <TableCell>
                      {rev.date ? new Date(rev.date).toLocaleDateString() : ""}
                    </TableCell>
                    <TableCell>{rev.score}</TableCell>
                    <TableCell>{getTaskScore(rev.employeeId)}</TableCell>
                    <TableCell>{rev.comments}</TableCell>
                    <TableCell>{rev.goals}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="overflow-x-auto">
            <h2 className="text-lg font-semibold mb-2">Employee Tasks</h2>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead>Employee</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Completed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow
                    key={task._id}
                    className="border-b hover:bg-gray-50"
                  >
                    <TableCell>{getEmployeeName(task.employeeId)}</TableCell>
                    <TableCell>{task.title}</TableCell>
                    <TableCell>{task.description}</TableCell>
                    <TableCell>
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString()
                        : ""}
                    </TableCell>
                    <TableCell>{task.completed ? "Yes" : "No"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
      {/* Modal for Add Review */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Performance Review</DialogTitle>
          </DialogHeader>
          {error && <p className="text-red-600 mb-2">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="employeeId" className="mb-1 font-medium">
                Employee
              </Label>
              <Select
                value={form.employeeId}
                onValueChange={(val) => handleSelectChange("employeeId", val)}
                required
              >
                <SelectTrigger id="employeeId" className="w-full">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e._id} value={e._id}>
                      {e.firstName} {e.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reviewerId" className="mb-1 font-medium">
                Reviewer (Admin ID or Email)
              </Label>
              <Input
                id="reviewerId"
                name="reviewerId"
                value={form.reviewerId}
                onChange={handleChange}
                required
                placeholder="Reviewer ID or Email"
              />
            </div>
            <div>
              <Label htmlFor="date" className="mb-1 font-medium">
                Date
              </Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="score" className="mb-1 font-medium">
                Score
              </Label>
              <Select
                value={String(form.score)}
                onValueChange={(val) => handleSelectChange("score", val)}
              >
                <SelectTrigger id="score" className="w-full">
                  <SelectValue placeholder="Select score" />
                </SelectTrigger>
                <SelectContent>
                  {SCORE_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={String(opt)}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="comments" className="mb-1 font-medium">
                Comments
              </Label>
              <Textarea
                id="comments"
                name="comments"
                value={form.comments}
                onChange={handleChange}
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="goals" className="mb-1 font-medium">
                Goals
              </Label>
              <Textarea
                id="goals"
                name="goals"
                value={form.goals}
                onChange={handleChange}
                rows={2}
              />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={submitting}
              >
                {submitting ? "Adding..." : "Add Review"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Modal for Assign Task */}
      <Dialog open={showTaskModal} onOpenChange={setShowTaskModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Task</DialogTitle>
          </DialogHeader>
          {taskError && <p className="text-red-600 mb-2">{taskError}</p>}
          <form onSubmit={handleTaskSubmit} className="space-y-4">
            <div>
              <Label htmlFor="taskEmployeeId" className="mb-1 font-medium">
                Employee
              </Label>
              <Select
                value={taskForm.employeeId}
                onValueChange={(val) =>
                  handleTaskSelectChange("employeeId", val)
                }
                required
              >
                <SelectTrigger id="taskEmployeeId" className="w-full">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e._id} value={e._id}>
                      {e.firstName} {e.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="title" className="mb-1 font-medium">
                Title
              </Label>
              <Input
                id="title"
                name="title"
                value={taskForm.title}
                onChange={handleTaskChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="description" className="mb-1 font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={taskForm.description}
                onChange={handleTaskChange}
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="dueDate" className="mb-1 font-medium">
                Due Date
              </Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                value={taskForm.dueDate}
                onChange={handleTaskChange}
              />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={taskSubmitting}
              >
                {taskSubmitting ? "Assigning..." : "Assign Task"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
