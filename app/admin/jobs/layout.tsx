"use client";
import Link from "next/link";
import {
  FaBriefcase,
  FaUserFriends,
  FaClipboardList,
  FaMoneyBillWave,
  FaChartPie,
  FaCalendarCheck,
  FaBuilding,
} from "react-icons/fa";

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

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-100/60 via-white to-blue-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white/80 backdrop-blur-lg border-r border-blue-100 min-h-screen p-6 flex flex-col sticky top-0 shadow-xl z-10">
        <div className="flex items-center mb-10">
          <div className="bg-blue-700 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-2xl mr-3 shadow">
            A
          </div>
          <span className="text-xl font-extrabold text-blue-900 tracking-tight">
            Admin
          </span>
        </div>
        <nav className="flex-1 space-y-2">
          {SIDEBAR_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition ${
                link.href === "/admin/jobs"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-blue-100 hover:text-blue-700"
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-10 text-xs text-gray-400 text-center">
          &copy; {new Date().getFullYear()} Acme HR
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="flex items-center justify-between px-8 py-6 bg-white/70 backdrop-blur border-b border-blue-100 shadow-sm sticky top-0 z-10">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-blue-900">
              Job Management
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Create, manage, and track job postings
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-lg">
              A
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
