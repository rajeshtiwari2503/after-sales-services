"use client";

import { usePathname } from "next/navigation";
import { Bell, Search, ChevronRight } from "lucide-react";

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Welcome back, Rahul 👋" },
  "/dashboard/analytics": { title: "Analytics", subtitle: "Performance overview" },
  "/dashboard/tickets": { title: "Tickets", subtitle: "Manage service requests" },
  "/dashboard/customers": { title: "Customers", subtitle: "Customer management" },
  "/dashboard/technicians": { title: "Technicians", subtitle: "Field team management" },
  "/dashboard/assets": { title: "Assets", subtitle: "Track your equipment" },
  "/dashboard/vendors": { title: "Vendors", subtitle: "Vendor management" },
  "/dashboard/reports": { title: "Reports", subtitle: "Insights and exports" },
  "/dashboard/settings": { title: "Settings", subtitle: "Account & preferences" },
};

export default function DashboardHeader() {
  const pathname = usePathname();
  const page = PAGE_TITLES[pathname] ?? { title: "Dashboard", subtitle: "" };
  const segments = pathname.split("/").filter(Boolean);

  return (
    <header className="bg-white border-b border-slate-200/80 px-6 lg:px-8 h-16 flex items-center justify-between shrink-0 sticky top-0 z-30">
      {/* Left */}
      <div className="flex items-center gap-4">
        {/* Breadcrumb */}
        <nav className="hidden sm:flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
          {segments.map((seg, i) => {
            const isLast = i === segments.length - 1;
            return (
              <span key={seg} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
                <span className={isLast ? "text-slate-800 font-medium capitalize" : "text-slate-400 capitalize"}>
                  {seg}
                </span>
              </span>
            );
          })}
        </nav>

        {/* Mobile page title */}
        <h1 className="sm:hidden text-base font-bold text-slate-800 ml-10">{page.title}</h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <button className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 text-xs hover:border-slate-300 transition cursor-pointer">
          <Search className="w-3.5 h-3.5" />
          <span>Search...</span>
          <kbd className="ml-2 text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
        </button>

        {/* Mobile search icon */}
        <button className="sm:hidden w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition cursor-pointer">
          <Search className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition cursor-pointer">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-slate-200 mx-1" />

        {/* Avatar */}
        <div className="flex items-center gap-2 cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
            RS
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold text-slate-700 leading-none">Rahul Sharma</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}