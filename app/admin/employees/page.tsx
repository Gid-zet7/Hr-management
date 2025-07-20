"use client";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department?: string; // Will store department _id
  position?: string;
  hireDate?: string;
  salary?: number;
  employmentStatus?: string;
}

interface Department {
  _id: string;
  name: string;
}

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "terminated", label: "Terminated" },
  { value: "on_leave", label: "On Leave" },
];

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
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
    // Fetch employees
    fetch("/api/employees")
      .then((r) => r.json())
      .then((data) => {
        setEmployees(data);
        setLoading(false);
      });
    // Fetch departments
    fetch("/api/departments")
      .then((r) => r.json())
      .then((data) => {
        setDepartments(data);
      });
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleStatusChange(value: string) {
    setForm((prev) => ({ ...prev, employmentStatus: value }));
  }

  function handleDepartmentChange(value: string) {
    setForm((prev) => ({ ...prev, department: value }));
  }

  function getDepartmentName(deptId: string | undefined) {
    if (!deptId) return "";
    const dept = departments.find((d) => d._id === deptId);
    return dept ? dept.name : "";
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
      <Button className="mb-6" onClick={() => setShowModal(true)}>
        Add Employee
      </Button>
      {loading ? (
        <p>Loading...</p>
      ) : employees.length === 0 ? (
        <p>No employees found.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Hire Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((emp) => (
                <TableRow key={emp._id}>
                  <TableCell>
                    {emp.firstName} {emp.lastName}
                  </TableCell>
                  <TableCell>{emp.email}</TableCell>
                  <TableCell>{getDepartmentName(emp.department)}</TableCell>
                  <TableCell>{emp.position}</TableCell>
                  <TableCell>{emp.employmentStatus}</TableCell>
                  <TableCell>
                    {emp.hireDate
                      ? new Date(emp.hireDate).toLocaleDateString()
                      : ""}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Employee</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new employee.
            </DialogDescription>
          </DialogHeader>
          {error && <p className="text-red-600 mb-2">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <div className="w-1/2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                  placeholder="First Name"
                />
              </div>
              <div className="w-1/2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Last Name"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="Email"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone"
              />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Select
                value={form.department}
                onValueChange={handleDepartmentChange}
              >
                <SelectTrigger id="department" className="w-full">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.length === 0 ? (
                    <div className="px-3 py-2 text-gray-500 text-sm">
                      No departments found
                    </div>
                  ) : (
                    departments.map((dept) => (
                      <SelectItem key={dept._id} value={dept._id}>
                        {dept.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                name="position"
                value={form.position}
                onChange={handleChange}
                placeholder="Position"
              />
            </div>
            <div>
              <Label htmlFor="hireDate">Hire Date</Label>
              <Input
                id="hireDate"
                name="hireDate"
                type="date"
                value={form.hireDate}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="salary">Salary</Label>
              <Input
                id="salary"
                name="salary"
                type="number"
                value={form.salary}
                onChange={handleChange}
                placeholder="Salary"
              />
            </div>
            <div>
              <Label htmlFor="employmentStatus">Employment Status</Label>
              <Select
                value={form.employmentStatus}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger id="employmentStatus" className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Adding..." : "Add Employee"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
