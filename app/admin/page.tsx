"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

interface Job {
  _id: string;
  title: string;
  department?: string;
  location?: string;
  status?: string;
}
interface Application {
  _id: string;
  jobId: string;
  createdAt?: string;
}
interface Employee {
  _id: string;
  startDate?: string;
}
interface PerformanceReview {
  _id: string;
  score?: number;
}
interface Attendance {
  _id: string;
  status?: string;
}
interface Payroll {
  _id: string;
  salary?: number;
  bonuses?: number;
  deductions?: number;
}

const SIDEBAR_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/jobs", label: "Jobs" },
  { href: "/admin/applications", label: "Applications" },
  { href: "/admin/employees", label: "Employees" },
  { href: "/admin/performance", label: "Performance" },
  { href: "/admin/payrolls", label: "Payrolls" },
  { href: "/admin/attendance", label: "Attendance" },
];

const COLORS = ["#2563eb", "#10b981", "#f59e42", "#ef4444", "#6366f1", "#fbbf24"];

export default function AdminDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [performance, setPerformance] = useState<PerformanceReview[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [payroll, setPayroll] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      const [jobs, applications, employees, performance, attendance, payroll] = await Promise.all([
        fetch("/api/jobs").then((r) => r.json()),
        fetch("/api/applications").then((r) => r.json()),
        fetch("/api/employees").then((r) => r.json()),
        fetch("/api/performance").then((r) => r.json()),
        fetch("/api/attendance").then((r) => r.json()),
        fetch("/api/payroll").then((r) => r.json()),
      ]);
      setJobs(jobs);
      setApplications(applications);
      setEmployees(employees);
      setPerformance(performance);
      setAttendance(attendance);
      setPayroll(payroll);
      setLoading(false);
    }
    fetchAll();
  }, []);

  // Analytics data
  const applicationsPerJob = jobs.map((job) => ({
    name: job.title,
    applications: applications.filter((a) => a.jobId === job._id).length,
  }));
  const employeeGrowth = employees
    .map((e) => e.startDate?.slice(0, 7))
    .reduce((acc, month) => {
      if (!month) return acc;
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  const employeeGrowthData = Object.entries(employeeGrowth).map(([month, count]) => ({ month, count }));
  const attendanceSummary = [
    { name: "Present", value: attendance.filter((a) => a.status === "present").length },
    { name: "Absent", value: attendance.filter((a) => a.status === "absent").length },
    { name: "Leave", value: attendance.filter((a) => a.status === "leave").length },
  ];
  const payrollTotal = payroll.reduce((sum, p) => sum + (p.salary || 0) + (p.bonuses || 0) - (p.deductions || 0), 0);
  const performanceScores = performance.map((p) => p.score || 0);
  const performanceDist = [
    { name: "Excellent (>=4.5)", value: performanceScores.filter((s) => s >= 4.5).length },
    { name: "Good (3-4.5)", value: performanceScores.filter((s) => s >= 3 && s < 4.5).length },
    { name: "Needs Improvement (<3)", value: performanceScores.filter((s) => s < 3).length },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r min-h-screen p-6 hidden md:block">
        <h2 className="text-xl font-bold mb-8 text-blue-900">Admin</h2>
        <nav className="space-y-4">
          {SIDEBAR_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="block text-gray-700 hover:text-blue-700 font-medium">
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      {/* Main content */}
      <main className="flex-1 p-6 md:p-12">
        <h1 className="text-3xl font-bold mb-6 text-blue-900">Admin Dashboard</h1>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            {/* Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
              <div className="bg-white p-6 rounded shadow text-center">
                <div className="text-2xl font-bold">{jobs.length}</div>
                <div className="text-gray-700">Jobs</div>
                <Link href="/admin/jobs" className="text-blue-600 underline">Manage Jobs</Link>
              </div>
              <div className="bg-white p-6 rounded shadow text-center">
                <div className="text-2xl font-bold">{applications.length}</div>
                <div className="text-gray-700">Applications</div>
                <Link href="/admin/applications" className="text-blue-600 underline">Manage Applications</Link>
              </div>
              <div className="bg-white p-6 rounded shadow text-center">
                <div className="text-2xl font-bold">{employees.length}</div>
                <div className="text-gray-700">Employees</div>
                <Link href="/admin/employees" className="text-blue-600 underline">Manage Employees</Link>
              </div>
              <div className="bg-white p-6 rounded shadow text-center">
                <div className="text-2xl font-bold">{payrollTotal.toLocaleString()}</div>
                <div className="text-gray-700">Payroll Total</div>
                <Link href="/admin/payrolls" className="text-blue-600 underline">Manage Payrolls</Link>
              </div>
            </div>
            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="bg-white p-6 rounded shadow">
                <h2 className="font-semibold mb-4">Applications per Job</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={applicationsPerJob}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={60} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="applications" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white p-6 rounded shadow">
                <h2 className="font-semibold mb-4">Employee Growth</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={employeeGrowthData}>
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white p-6 rounded shadow">
                <h2 className="font-semibold mb-4">Attendance Summary</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={attendanceSummary} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {attendanceSummary.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white p-6 rounded shadow">
                <h2 className="font-semibold mb-4">Performance Distribution</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={performanceDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {performanceDist.map((entry, idx) => (
                        <Cell key={`cell-perf-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Job Management Table */}
            <div className="bg-white p-6 rounded shadow mb-10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-lg">Job Management</h2>
                <Link href="/admin/jobs/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add New Job</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 text-left">Title</th>
                      <th className="py-2 px-4 text-left">Department</th>
                      <th className="py-2 px-4 text-left">Location</th>
                      <th className="py-2 px-4 text-left">Status</th>
                      <th className="py-2 px-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr key={job._id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4">{job.title}</td>
                        <td className="py-2 px-4">{job.department}</td>
                        <td className="py-2 px-4">{job.location}</td>
                        <td className="py-2 px-4">{job.status}</td>
                        <td className="py-2 px-4 space-x-2">
                          <Link href={`/admin/jobs/edit/${job._id}`} className="text-blue-600 hover:underline">Edit</Link>
                          <button className="text-red-600 hover:underline" onClick={() => alert('Delete not implemented')}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
