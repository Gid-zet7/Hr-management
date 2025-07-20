"use client";
import Link from "next/link";
import { Calendar } from "@/components/ui/calendar";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  FaBriefcase,
  FaUserFriends,
  FaClipboardList,
  FaMoneyBillWave,
  FaChartPie,
  FaCalendarCheck,
  FaBuilding,
  FaEye,
  FaEnvelope,
  FaPhone,
  FaFileAlt,
} from "react-icons/fa";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface Job {
  _id: string;
  title: string;
  department?:
    | {
        _id: string;
        name: string;
      }
    | string;
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

interface RecentApplicant {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  status: "applied" | "interviewed" | "offer_sent" | "hired" | "rejected";
  createdAt: string;
  jobId: {
    _id: string;
    title: string;
    department?: {
      _id: string;
      name: string;
    };
  };
}

interface Interview {
  _id: string;
  applicant: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  jobId: {
    _id: string;
    title: string;
    department?: {
      _id: string;
      name: string;
    };
  };
  date: string;
  time: string;
  type: string;
  status: string;
}

const SIDEBAR_LINKS = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: <FaChartPie className="inline mr-2" />,
  },
  {
    href: "/admin/jobs",
    label: "Jobs",
    icon: <FaBriefcase className="inline mr-2" />,
  },
  {
    href: "/admin/applications",
    label: "Applications",
    icon: <FaClipboardList className="inline mr-2" />,
  },
  {
    href: "/admin/employees",
    label: "Employees",
    icon: <FaUserFriends className="inline mr-2" />,
  },
  {
    href: "/admin/departments",
    label: "Departments",
    icon: <FaBuilding className="inline mr-2" />,
  },
  {
    href: "/admin/performance",
    label: "Performance",
    icon: <FaChartPie className="inline mr-2" />,
  },
  {
    href: "/admin/payrolls",
    label: "Payrolls",
    icon: <FaMoneyBillWave className="inline mr-2" />,
  },
  {
    href: "/admin/attendance",
    label: "Attendance",
    icon: <FaCalendarCheck className="inline mr-2" />,
  },
];

const COLORS = [
  "#2563eb",
  "#10b981",
  "#f59e42",
  "#ef4444",
  "#6366f1",
  "#fbbf24",
];

export default function AdminDashboard() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [performance, setPerformance] = useState<PerformanceReview[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [payroll, setPayroll] = useState<Payroll[]>([]);
  const [recentApplicants, setRecentApplicants] = useState<RecentApplicant[]>(
    []
  );
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      const [
        jobs,
        applications,
        employees,
        performance,
        attendance,
        payroll,
        recentApplicants,
        interviews,
      ] = await Promise.all([
        fetch("/api/jobs").then((r) => r.json()),
        fetch("/api/applications").then((r) => r.json()),
        fetch("/api/employees").then((r) => r.json()),
        fetch("/api/performance").then((r) => r.json()),
        fetch("/api/attendance").then((r) => r.json()),
        fetch("/api/payroll").then((r) => r.json()),
        fetch("/api/applications")
          .then((r) => r.json())
          .then((data) => data.slice(0, 6)), // Get latest 6
        fetch("/api/interviews").then((r) => r.json()),
      ]);
      setJobs(jobs);
      setApplications(applications);
      setEmployees(employees);
      setPerformance(performance);
      setAttendance(attendance);
      setPayroll(payroll);
      setRecentApplicants(recentApplicants);
      setInterviews(interviews);
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
  const employeeGrowthData = Object.entries(employeeGrowth).map(
    ([month, count]) => ({ month, count })
  );
  const attendanceSummary = [
    {
      name: "Present",
      value: attendance.filter((a) => a.status === "present").length,
    },
    {
      name: "Absent",
      value: attendance.filter((a) => a.status === "absent").length,
    },
    {
      name: "Leave",
      value: attendance.filter((a) => a.status === "leave").length,
    },
  ];
  const payrollTotal = payroll.reduce(
    (sum, p) => sum + (p.salary || 0) + (p.bonuses || 0) - (p.deductions || 0),
    0
  );
  const performanceScores = performance.map((p) => p.score || 0);
  const performanceDist = [
    {
      name: "Excellent (>=4.5)",
      value: performanceScores.filter((s) => s >= 4.5).length,
    },
    {
      name: "Good (3-4.5)",
      value: performanceScores.filter((s) => s >= 3 && s < 4.5).length,
    },
    {
      name: "Needs Improvement (<3)",
      value: performanceScores.filter((s) => s < 3).length,
    },
  ];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "applied":
        return "secondary";
      case "interviewed":
        return "outline";
      case "offer_sent":
        return "default";
      case "hired":
        return "default";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        {/* <aside className="w-64 bg-card border-r min-h-screen p-6 flex flex-col sticky top-0">
          <Skeleton className="h-10 w-32 mb-10" />
          <div className="space-y-2">
            {SIDEBAR_LINKS.map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </aside> */}
        <div className="flex-1 p-6">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      {/* <aside className="hidden md:flex w-64 bg-card border-r min-h-screen p-6 flex-col sticky top-0">
        <div className="text-2xl font-bold mb-10">Admin</div>
        <nav className="space-y-2">
          {SIDEBAR_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center px-4 py-2 rounded-md hover:bg-muted transition"
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>
      </aside> */}
      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-12 bg-[#F9FAFB]">
          {/* Responsive grid for analytics cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Jobs</CardTitle>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex justify-center items-center ">
                  <FaBriefcase className="h-4 w-4 text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{jobs.length}</div>
                <p className="text-xs text-muted-foreground">
                  <Link
                    href="/admin/jobs"
                    className="text-primary hover:underline"
                  >
                    Manage Jobs
                  </Link>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Applications
                </CardTitle>
                <div className="w-12 h-12 bg-fuchsia-100 rounded-full flex justify-center items-center">
                  <FaClipboardList className="h-4 w-4 text-fuchsia-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{applications.length}</div>
                <p className="text-xs text-muted-foreground">
                  <Link
                    href="/admin/applications"
                    className="text-primary hover:underline"
                  >
                    Manage Applications
                  </Link>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Employees</CardTitle>
                <div className="w-12 h-12 bg-green-100 rounded-full flex justify-center items-center">
                  <FaUserFriends className="h-4 w-4 text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{employees.length}</div>
                <p className="text-xs text-muted-foreground">
                  <Link
                    href="/admin/employees"
                    className="text-primary hover:underline"
                  >
                    Manage Employees
                  </Link>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Payroll Total
                </CardTitle>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex justify-center items-center">
                  <FaMoneyBillWave className="h-4 w-4 text-yellow-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {payrollTotal.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  <Link
                    href="/admin/payrolls"
                    className="text-primary hover:underline"
                  >
                    Manage Payrolls
                  </Link>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Responsive grid for Calendar and Recent Applicants */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
            {/* Recent Applicants Table */}
            <div className="col-span-1 lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <CardTitle>Recent Applications</CardTitle>
                      <CardDescription>
                        Latest job applications received
                      </CardDescription>
                    </div>
                    <Button asChild>
                      <Link href="/admin/applications">
                        View All Applications
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Applicant</TableHead>
                        <TableHead>Job Position</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Applied Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentApplicants.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center text-muted-foreground py-8"
                          >
                            No recent applications
                          </TableCell>
                        </TableRow>
                      ) : (
                        recentApplicants.map((applicant) => (
                          <TableRow key={applicant._id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {applicant.firstName} {applicant.lastName}
                                </div>
                                <div className="text-sm text-muted-foreground flex items-center mt-1">
                                  <FaEnvelope className="mr-1 h-3 w-3" />
                                  {applicant.email}
                                </div>
                                {applicant.phone && (
                                  <div className="text-sm text-muted-foreground flex items-center mt-1">
                                    <FaPhone className="mr-1 h-3 w-3" />
                                    {applicant.phone}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {applicant.jobId?.title || "N/A"}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {applicant.jobId?.department?.name ||
                                "No Department"}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={getStatusVariant(applicant.status)}
                              >
                                {applicant.status.charAt(0).toUpperCase() +
                                  applicant.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(
                                applicant.createdAt
                              ).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                {applicant.resumeUrl && (
                                  <Button variant="ghost" size="sm" asChild>
                                    <a
                                      href={applicant.resumeUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title="View Resume"
                                    >
                                      <FaFileAlt className="h-4 w-4" />
                                    </a>
                                  </Button>
                                )}
                                <Button variant="ghost" size="sm" asChild>
                                  <Link
                                    href={`/admin/jobs/${applicant.jobId?._id}/applicants`}
                                    title="View Job Applicants"
                                  >
                                    <FaEye className="h-4 w-4" />
                                  </Link>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Calendar */}
            <div className="col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Calendar</CardTitle>
                  <CardDescription>View and select dates</CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border shadow-sm"
                    captionLayout="dropdown"
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Interview Table */}
          <div className="mb-10">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <CardTitle>Recent Interviews</CardTitle>
                    <CardDescription>
                      Latest scheduled interviews
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Job</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {interviews.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-muted-foreground py-8"
                        >
                          No interviews scheduled
                        </TableCell>
                      </TableRow>
                    ) : (
                      interviews.slice(0, 5).map((interview) => (
                        <TableRow key={interview._id}>
                          <TableCell>
                            {interview.applicant?.firstName}{" "}
                            {interview.applicant?.lastName}
                            <div className="text-xs text-muted-foreground">
                              {interview.applicant?.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            {interview.jobId?.title || "N/A"}
                          </TableCell>
                          <TableCell>
                            {interview.date
                              ? new Date(interview.date).toLocaleDateString()
                              : ""}
                          </TableCell>
                          <TableCell>{interview.time}</TableCell>
                          <TableCell className="capitalize">
                            {interview.type}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {interview.status.charAt(0).toUpperCase() +
                                interview.status.slice(1)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Responsive grid for charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-12">
            <div className="col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Applications per Job</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={applicationsPerJob}>
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="applications" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            <div className="col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Employee Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={employeeGrowthData}>
                      <XAxis dataKey="month" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            <div className="col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={attendanceSummary}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {attendanceSummary.map((entry, idx) => (
                          <Cell
                            key={`cell-${idx}`}
                            fill={COLORS[idx % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            <div className="col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={performanceDist}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {performanceDist.map((entry, idx) => (
                          <Cell
                            key={`cell-perf-${idx}`}
                            fill={COLORS[idx % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Job Management Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <CardTitle>Job Management</CardTitle>
                  <CardDescription>
                    Manage job postings and their status
                  </CardDescription>
                </div>
                <Button asChild>
                  <Link href="/admin/jobs/new">Add New Job</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={job._id}>
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell>
                        {typeof job.department === "object" &&
                        job.department !== null &&
                        "name" in job.department
                          ? job.department.name
                          : "No Department"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {job.location}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{job.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/jobs/edit/${job._id}`}>
                              Edit
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => alert("Delete not implemented")}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
