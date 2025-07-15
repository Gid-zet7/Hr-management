"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { FaBriefcase, FaUserFriends, FaClipboardList, FaMoneyBillWave, FaChartPie, FaCalendarCheck } from "react-icons/fa";

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
  { href: "/admin", label: "Dashboard", icon: <FaChartPie className="inline mr-2" /> },
  { href: "/admin/jobs", label: "Jobs", icon: <FaBriefcase className="inline mr-2" /> },
  { href: "/admin/applications", label: "Applications", icon: <FaClipboardList className="inline mr-2" /> },
  { href: "/admin/employees", label: "Employees", icon: <FaUserFriends className="inline mr-2" /> },
  { href: "/admin/performance", label: "Performance", icon: <FaChartPie className="inline mr-2" /> },
  { href: "/admin/payrolls", label: "Payrolls", icon: <FaMoneyBillWave className="inline mr-2" /> },
  { href: "/admin/attendance", label: "Attendance", icon: <FaCalendarCheck className="inline mr-2" /> },
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
    <div className="flex min-h-screen bg-gradient-to-br from-blue-100/60 via-white to-blue-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white/80 backdrop-blur-lg border-r border-blue-100 min-h-screen p-6 flex flex-col sticky top-0 shadow-xl z-10">
        <div className="flex items-center mb-10">
          <div className="bg-blue-700 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-2xl mr-3 shadow">A</div>
          <span className="text-xl font-extrabold text-blue-900 tracking-tight">Admin</span>
        </div>
        <nav className="flex-1 space-y-2">
          {SIDEBAR_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-100 hover:text-blue-700 font-medium transition">
              {link.icon}{link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-10 text-xs text-gray-400 text-center">&copy; {new Date().getFullYear()} Acme HR</div>
      </aside>
      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="flex items-center justify-between px-8 py-6 bg-white/70 backdrop-blur border-b border-blue-100 shadow-sm sticky top-0 z-10">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-blue-900">Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Welcome back, Admin!</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-lg">A</div>
          </div>
        </header>
        <main className="flex-1 p-6 md:p-12">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              {/* Analytics */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-12">
                <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6 flex flex-col items-center border-t-4 border-blue-600">
                  <FaBriefcase className="text-blue-600 text-3xl mb-2" />
                  <div className="text-3xl font-extrabold text-blue-900">{jobs.length}</div>
                  <div className="text-gray-600">Jobs</div>
                  <Link href="/admin/jobs" className="mt-2 text-blue-600 underline font-medium">Manage Jobs</Link>
                </div>
                <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6 flex flex-col items-center border-t-4 border-green-500">
                  <FaClipboardList className="text-green-500 text-3xl mb-2" />
                  <div className="text-3xl font-extrabold text-green-700">{applications.length}</div>
                  <div className="text-gray-600">Applications</div>
                  <Link href="/admin/applications" className="mt-2 text-green-600 underline font-medium">Manage Applications</Link>
                </div>
                <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6 flex flex-col items-center border-t-4 border-purple-500">
                  <FaUserFriends className="text-purple-500 text-3xl mb-2" />
                  <div className="text-3xl font-extrabold text-purple-700">{employees.length}</div>
                  <div className="text-gray-600">Employees</div>
                  <Link href="/admin/employees" className="mt-2 text-purple-600 underline font-medium">Manage Employees</Link>
                </div>
                <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6 flex flex-col items-center border-t-4 border-yellow-500">
                  <FaMoneyBillWave className="text-yellow-500 text-3xl mb-2" />
                  <div className="text-3xl font-extrabold text-yellow-700">{payrollTotal.toLocaleString()}</div>
                  <div className="text-gray-600">Payroll Total</div>
                  <Link href="/admin/payrolls" className="mt-2 text-yellow-600 underline font-medium">Manage Payrolls</Link>
                </div>
              </div>
              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6">
                  <h2 className="font-semibold mb-4 text-blue-900">Applications per Job</h2>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={applicationsPerJob}>
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={60} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="applications" fill="#2563eb" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6">
                  <h2 className="font-semibold mb-4 text-blue-900">Employee Growth</h2>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={employeeGrowthData}>
                      <XAxis dataKey="month" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6">
                  <h2 className="font-semibold mb-4 text-blue-900">Attendance Summary</h2>
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
                <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6">
                  <h2 className="font-semibold mb-4 text-blue-900">Performance Distribution</h2>
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
              <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-8 mb-10">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-semibold text-xl text-blue-900">Job Management</h2>
                  <Link href="/admin/jobs/new" className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 font-semibold shadow">Add New Job</Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-blue-50">
                        <th className="py-3 px-4 text-left font-semibold">Title</th>
                        <th className="py-3 px-4 text-left font-semibold">Department</th>
                        <th className="py-3 px-4 text-left font-semibold">Location</th>
                        <th className="py-3 px-4 text-left font-semibold">Status</th>
                        <th className="py-3 px-4 text-left font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map((job) => (
                        <tr key={job._id} className="border-b hover:bg-blue-50 transition">
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
    </div>
  );
}
