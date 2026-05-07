import {
  LayoutDashboard,
  Users,
  Wrench,
  ClipboardList,
  BarChart3,
  Settings,
} from "lucide-react";

export const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/dashboard/users",
    icon: Users,
  },
  {
    title: "Tickets",
    href: "/dashboard/tickets",
    icon: ClipboardList,
  },
  {
    title: "Service Centers",
    href: "/dashboard/service-centers",
    icon: Wrench,
  },
  {
    title: "Reports",
    href: "/dashboard/reports",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];