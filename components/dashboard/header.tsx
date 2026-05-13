// "use client";

// import { usePathname } from "next/navigation";
// import { Bell, Search, ChevronRight } from "lucide-react";

// const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
//   "/dashboard": { title: "Dashboard", subtitle: "Welcome back, Rahul 👋" },
//   "/dashboard/analytics": { title: "Analytics", subtitle: "Performance overview" },
//   "/dashboard/tickets": { title: "Tickets", subtitle: "Manage service requests" },
//   "/dashboard/customers": { title: "Customers", subtitle: "Customer management" },
//   "/dashboard/technicians": { title: "Technicians", subtitle: "Field team management" },
//   "/dashboard/assets": { title: "Assets", subtitle: "Track your equipment" },
//   "/dashboard/vendors": { title: "Vendors", subtitle: "Vendor management" },
//   "/dashboard/reports": { title: "Reports", subtitle: "Insights and exports" },
//   "/dashboard/settings": { title: "Settings", subtitle: "Account & preferences" },
// };

// export default function DashboardHeader() {
//   const pathname = usePathname();
//   const page = PAGE_TITLES[pathname] ?? { title: "Dashboard", subtitle: "" };
//   const segments = pathname.split("/").filter(Boolean);

//   return (
//     <header className="bg-white border-b border-slate-200/80 px-6 lg:px-8 h-16 flex items-center justify-between shrink-0 sticky top-0 z-30">
//       {/* Left */}
//       <div className="flex items-center gap-4">
//         {/* Breadcrumb */}
//         <nav className="hidden sm:flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
//           {segments.map((seg, i) => {
//             const isLast = i === segments.length - 1;
//             return (
//               <span key={seg} className="flex items-center gap-1.5">
//                 {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
//                 <span className={isLast ? "text-slate-800 font-medium capitalize" : "text-slate-400 capitalize"}>
//                   {seg}
//                 </span>
//               </span>
//             );
//           })}
//         </nav>

//         {/* Mobile page title */}
//         <h1 className="sm:hidden text-base font-bold text-slate-800 ml-10">{page.title}</h1>
//       </div>

//       {/* Right */}
//       <div className="flex items-center gap-2">
//         {/* Search */}
//         <button className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 text-xs hover:border-slate-300 transition cursor-pointer">
//           <Search className="w-3.5 h-3.5" />
//           <span>Search...</span>
//           <kbd className="ml-2 text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
//         </button>

//         {/* Mobile search icon */}
//         <button className="sm:hidden w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition cursor-pointer">
//           <Search className="w-4 h-4" />
//         </button>

//         {/* Notifications */}
//         <button className="relative w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition cursor-pointer">
//           <Bell className="w-4 h-4" />
//           <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
//         </button>

//         {/* Divider */}
//         <div className="w-px h-5 bg-slate-200 mx-1" />

//         {/* Avatar */}
//         <div className="flex items-center gap-2 cursor-pointer group">
//           <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
//             RS
//           </div>
//           <div className="hidden md:block">
//             <p className="text-xs font-semibold text-slate-700 leading-none">Rahul Sharma</p>
//             <p className="text-[10px] text-slate-400 mt-0.5">Admin</p>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }

"use client";

import { usePathname, useRouter } from "next/navigation";
import { Bell, Search, ChevronRight, LogOut, Settings, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
 
import Link from "next/link";
import { useUser } from "@/hooks/useUser";

const BREADCRUMBS: Record<string, string> = {
  dashboard: "Dashboard",
  analytics: "Analytics",
  tickets: "Tickets",
  customers: "Customers",
  technicians: "Technicians",
  assets: "Assets",
  vendors: "Vendors",
  reports: "Reports",
  settings: "Settings",
};

const PAGE_SUBTITLES: Record<string, string> = {
  "/dashboard": "Overview of your service operations",
  "/dashboard/analytics": "Performance metrics & insights",
  "/dashboard/tickets": "Manage all service requests",
  "/dashboard/customers": "Customer records & history",
  "/dashboard/technicians": "Field team management",
  "/dashboard/assets": "Equipment & asset tracking",
  "/dashboard/vendors": "Vendor management",
  "/dashboard/reports": "Reports & data exports",
  "/dashboard/settings": "Account & preferences",
};

export default function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, initials, greeting } = useUser();
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const segments = pathname.split("/").filter(Boolean);
  const subtitle = PAGE_SUBTITLES[pathname] ?? "";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-5 lg:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30">
      {/* Left — Breadcrumb */}
      <div className="flex flex-col justify-center">
        <nav className="hidden sm:flex items-center gap-1 text-sm" aria-label="Breadcrumb">
          {segments.map((seg, i) => {
            const isLast = i === segments.length - 1;
            const label = BREADCRUMBS[seg] ?? seg;
            return (
              <span key={seg} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
                <span className={`capitalize ${isLast ? "text-slate-800 font-semibold" : "text-slate-400"}`}>
                  {label}
                </span>
              </span>
            );
          })}
        </nav>
        {subtitle && (
          <p className="hidden lg:block text-xs text-slate-400 mt-0.5">{subtitle}</p>
        )}
        {/* Mobile title */}
        <h1 className="sm:hidden text-base font-bold text-slate-800 ml-10">
          {BREADCRUMBS[segments[segments.length - 1]] ?? "Dashboard"}
        </h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Search bar — md+ */}
        <button className="hidden md:flex items-center gap-2 h-8 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 text-xs hover:border-indigo-300 hover:text-slate-600 transition cursor-pointer group">
          <Search className="w-3.5 h-3.5 group-hover:text-indigo-500 transition" />
          <span>Search...</span>
          <kbd className="ml-2 text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
        </button>

        {/* Search icon — mobile */}
        <button className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition cursor-pointer">
          <Search className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-indigo-300 transition cursor-pointer">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500 border border-white" />
        </button>

        <div className="w-px h-5 bg-slate-200 mx-0.5" />

        {/* User dropdown */}
        <div className="relative" ref={dropRef}>
          <button
            onClick={() => setDropOpen(p => !p)}
            className="flex items-center gap-2 cursor-pointer group"
            aria-label="User menu"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-transparent group-hover:ring-indigo-300 transition">
              {initials}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-slate-700 leading-none">{user?.name ?? "User"}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 capitalize">{user?.role ?? "member"}</p>
            </div>
          </button>

          {/* Dropdown */}
          {dropOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-slate-200 shadow-xl shadow-slate-200/60 py-1.5 z-50">
              {/* User info */}
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                <p className="text-xs text-slate-400">{user?.email}</p>
              </div>

              <div className="py-1">
                <Link
                  href="/dashboard/settings"
                  onClick={() => setDropOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition cursor-pointer"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <Link
                  href="/dashboard/profile"
                  onClick={() => setDropOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
              </div>

              <div className="border-t border-slate-100 py-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition w-full cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}