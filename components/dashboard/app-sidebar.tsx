"use client";
import { useEffect, useState } from "react";
// import { getUsersession } from "@/lib/actions";
import {
  UserCircle2,
  Home,
  ListOrdered,
  Package,
  PlusCircle,
  LayoutDashboard,
  UserCircleIcon,
  LogOut,
} from "lucide-react";
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
// import { ModeToggle } from "../header/mode-toggle";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@radix-ui/react-dropdown-menu";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@radix-ui/react-collapsible";
import { User2 } from "lucide-react";
import { ChevronUp, ChevronDown } from "lucide-react";
import Link from "next/link";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

// Menu items.
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

export function AppSidebar() {
  // const { getPermission, isLoading } = useKindeBrowserClient();
  // const isAdmin = !isLoading && getPermission("admin")?.isGranted;
  // const [session, setSession] = useState<User>();

  // useEffect(() => {
  //   const fetchSession = async () => {
  //     try {
  //       const userSession = await getUsersession();
  //       setSession(userSession);
  //     } catch (error) {
  //       console.error("Error fetching session:", error);
  //     }
  //   };

  //   fetchSession();
  // }, []);

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="bg-white">
        <SidebarGroup>
          <Link href={"/"}>
            <SidebarGroupLabel>Acme</SidebarGroupLabel>
          </Link>
          <SidebarGroupContent>
            <SidebarMenu>
              {SIDEBAR_LINKS.map((item) => {
                // Skip rendering admin-only items if the user is not an admin
                // if (item.adminOnly && !isAdmin) return null;

                return (
                  // <Collapsible
                  //   key={item.label}
                  //   defaultOpen
                  //   className="group/collapsible"
                  // >
                  //   <SidebarGroupLabel asChild>
                  //     <CollapsibleTrigger className="flex w-full items-center justify-between">
                  //       {item.title}
                  //       <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  //     </CollapsibleTrigger>
                  //   </SidebarGroupLabel>
                  //   <CollapsibleContent>

                  <SidebarMenuItem className="mt-4">
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.href}
                        className="flex items-center px-4 py-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground font-medium transition"
                      >
                        {item.icon}

                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              {/* <ModeToggle /> */}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="p-6">
                <SidebarMenuButton>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`#`} alt="profile" />
                    <AvatarFallback>
                      <User2 />
                    </AvatarFallback>
                  </Avatar>{" "}
                  {"Username"}
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <LogoutLink>
                <DropdownMenuContent
                  side="top"
                  className="w-[--radix-popper-anchor-width] p-4 rounded-2xl "
                >
                  <DropdownMenuItem className="flex gap-2 justify-center items-center hover:bg-slate-100 dark:hover:bg-slate-900  rounded-2xl">
                    <LogOut className="h-5 w-5" />
                    <span className="p-4"> Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </LogoutLink>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
