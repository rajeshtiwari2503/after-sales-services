 

// "use client";

// import { usePathname, useRouter } from "next/navigation";
// import { Bell, Search, ChevronRight, LogOut, Settings, User } from "lucide-react";
// import { useState, useRef, useEffect } from "react";
 
// import Link from "next/link";
// import { useUser } from "@/hooks/useUser";

// const BREADCRUMBS: Record<string, string> = {
//   dashboard: "Dashboard",
//   analytics: "Analytics",
//   tickets: "Tickets",
//   customers: "Customers",
//   technicians: "Technicians",
//   assets: "Assets",
//   vendors: "Vendors",
//   reports: "Reports",
//   settings: "Settings",
// };

// const PAGE_SUBTITLES: Record<string, string> = {
//   "/dashboard": "Overview of your service operations",
//   "/dashboard/analytics": "Performance metrics & insights",
//   "/dashboard/tickets": "Manage all service requests",
//   "/dashboard/customers": "Customer records & history",
//   "/dashboard/technicians": "Field team management",
//   "/dashboard/assets": "Equipment & asset tracking",
//   "/dashboard/vendors": "Vendor management",
//   "/dashboard/reports": "Reports & data exports",
//   "/dashboard/settings": "Account & preferences",
// };

// export default function DashboardHeader() {
//   const pathname = usePathname();
//   const router = useRouter();
//   const { user, initials, greeting } = useUser();
//   const [dropOpen, setDropOpen] = useState(false);
//   const dropRef = useRef<HTMLDivElement>(null);

//   const segments = pathname.split("/").filter(Boolean);
//   const subtitle = PAGE_SUBTITLES[pathname] ?? "";

//   useEffect(() => {
//     const handler = (e: MouseEvent) => {
//       if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
//         setDropOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, []);

//   const handleLogout = async () => {
//     await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
//     localStorage.removeItem("user");
//     router.push("/login");
//   };

//   return (
//     <header className="h-16 bg-white border-b border-slate-200/80 px-5 lg:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30">
//       {/* Left — Breadcrumb */}
//       <div className="flex flex-col justify-center">
//         <nav className="hidden sm:flex items-center gap-1 text-sm" aria-label="Breadcrumb">
//           {segments.map((seg, i) => {
//             const isLast = i === segments.length - 1;
//             const label = BREADCRUMBS[seg] ?? seg;
//             return (
//               <span key={seg} className="flex items-center gap-1">
//                 {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
//                 <span className={`capitalize ${isLast ? "text-slate-800 font-semibold" : "text-slate-400"}`}>
//                   {label}
//                 </span>
//               </span>
//             );
//           })}
//         </nav>
//         {subtitle && (
//           <p className="hidden lg:block text-xs text-slate-400 mt-0.5">{subtitle}</p>
//         )}
//         {/* Mobile title */}
//         <h1 className="sm:hidden text-base font-bold text-slate-800 ml-10">
//           {BREADCRUMBS[segments[segments.length - 1]] ?? "Dashboard"}
//         </h1>
//       </div>

//       {/* Right */}
//       <div className="flex items-center gap-2">
//         {/* Search bar — md+ */}
//         <button className="hidden md:flex items-center gap-2 h-8 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 text-xs hover:border-indigo-300 hover:text-slate-600 transition cursor-pointer group">
//           <Search className="w-3.5 h-3.5 group-hover:text-indigo-500 transition" />
//           <span>Search...</span>
//           <kbd className="ml-2 text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
//         </button>

//         {/* Search icon — mobile */}
//         <button className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition cursor-pointer">
//           <Search className="w-4 h-4" />
//         </button>

//         {/* Notifications */}
//         <button className="relative w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-indigo-300 transition cursor-pointer">
//           <Bell className="w-4 h-4" />
//           <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500 border border-white" />
//         </button>

//         <div className="w-px h-5 bg-slate-200 mx-0.5" />

//         {/* User dropdown */}
//         <div className="relative" ref={dropRef}>
//           <button
//             onClick={() => setDropOpen(p => !p)}
//             className="flex items-center gap-2 cursor-pointer group"
//             aria-label="User menu"
//           >
//             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-transparent group-hover:ring-indigo-300 transition">
//               {initials}
//             </div>
//             <div className="hidden md:block text-left">
//               <p className="text-xs font-semibold text-slate-700 leading-none">{user?.name ?? "User"}</p>
//               <p className="text-[10px] text-slate-400 mt-0.5 capitalize">{user?.role ?? "member"}</p>
//             </div>
//           </button>

//           {/* Dropdown */}
//           {dropOpen && (
//             <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-slate-200 shadow-xl shadow-slate-200/60 py-1.5 z-50">
//               {/* User info */}
//               <div className="px-4 py-2.5 border-b border-slate-100">
//                 <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
//                 <p className="text-xs text-slate-400">{user?.email}</p>
//               </div>

//               <div className="py-1">
//                 <Link
//                   href="/dashboard/settings"
//                   onClick={() => setDropOpen(false)}
//                   className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition cursor-pointer"
//                 >
//                   <Settings className="w-4 h-4" />
//                   Settings
//                 </Link>
//                 <Link
//                   href="/dashboard/profile"
//                   onClick={() => setDropOpen(false)}
//                   className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition cursor-pointer"
//                 >
//                   <User className="w-4 h-4" />
//                   Profile
//                 </Link>
//               </div>

//               <div className="border-t border-slate-100 py-1">
//                 <button
//                   onClick={handleLogout}
//                   className="flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition w-full cursor-pointer"
//                 >
//                   <LogOut className="w-4 h-4" />
//                   Sign out
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </header>
//   );
// }


"use client";

import { usePathname, useRouter } from "next/navigation";
import { Bell, Search, ChevronRight, LogOut, Settings, User, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import Link from "next/link";

// ─── Breadcrumb labels ──────────────────────────────────────────
const BREADCRUMBS: Record<string, string> = {
  dashboard: "Dashboard", analytics: "Analytics",
  tickets: "Tickets", customers: "Customers",
  technicians: "Technicians", assets: "Assets",
  vendors: "Vendors", reports: "Reports",
  settings: "Settings", users: "Users",
  brands: "Brands", "service-centers": "Service Centers",
  "audit-logs": "Audit Logs", roles: "Roles",
  brand: "Brand", warranty: "Warranty",
  products: "Products", models: "Models",
  inventory: "Inventory", wallet: "Wallet",
  sla: "SLA", jobs: "My Jobs",
  chat: "Chat", photos: "Photos",
  summary: "Summary", track: "Track",
  reviews: "Reviews", profile: "Profile",
  new: "New", create: "Create", edit: "Edit",
};

export default function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, initials } = useUser();
  const [dropOpen, setDropOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const segments = pathname.split("/").filter(Boolean);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    localStorage.removeItem("user");
    router.push("/login");
  };

  // Role-based profile link
  const profileLink = () => {
    const role = user?.role;
    if (role === "customer") return "/customer/profile";
    if (role === "technician") return "/technician/profile";
    return "/dashboard/settings";
  };

  // Mock notifications
  const notifications = [
    { id: "1", title: "New ticket assigned", desc: "TKT-000042 has been assigned to you", time: "2m ago", read: false },
    { id: "2", title: "SLA warning", desc: "TKT-000038 response deadline in 30 mins", time: "28m ago", read: false },
    { id: "3", title: "Ticket resolved", desc: "TKT-000035 was marked as resolved", time: "2h ago", read: true },
  ];
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-5 lg:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30">

      {/* Left — Breadcrumb */}
      <div className="flex flex-col justify-center pl-10 lg:pl-0">
        <nav className="hidden sm:flex items-center gap-1 text-sm" aria-label="Breadcrumb">
          {segments.map((seg, i) => {
            const isLast = i === segments.length - 1;
            const label = BREADCRUMBS[seg] ?? seg;
            // Skip UUID-like segments in breadcrumb display
            const isId = seg.length === 24 || seg.match(/^[0-9a-f]{24}$/i);
            if (isId && !isLast) return null;
            return (
              <span key={seg} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
                <span className={`capitalize ${isLast ? "text-slate-800 font-semibold" : "text-slate-400"}`}>
                  {isId ? "Detail" : label}
                </span>
              </span>
            );
          })}
        </nav>
        {/* Mobile title */}
        <h1 className="sm:hidden text-base font-bold text-slate-800 truncate">
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
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(p => !p)}
            className="relative w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-indigo-300 transition cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500 border border-white" />
            )}
          </button>

          {/* Notifications dropdown */}
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-slate-200 shadow-xl z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-800">Notifications</p>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full font-semibold">
                      {unreadCount} new
                    </span>
                  )}
                  <button onClick={() => setNotifOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {notifications.map(notif => (
                  <div key={notif.id} className={`px-4 py-3 hover:bg-slate-50 cursor-pointer ${!notif.read ? "bg-blue-50/30" : ""}`}>
                    <div className="flex items-start gap-2.5">
                      {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />}
                      <div className={`flex-1 ${notif.read ? "pl-4" : ""}`}>
                        <p className="text-xs font-semibold text-slate-800">{notif.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{notif.desc}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{notif.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-slate-100">
                <button className="text-xs text-indigo-600 hover:underline cursor-pointer w-full text-center">
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>

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
                <p className="text-sm font-semibold text-slate-800">{user?.name ?? "User"}</p>
                <p className="text-xs text-slate-400">{user?.email ?? ""}</p>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full mt-1 inline-block capitalize
                  ${user?.role === "admin" ? "bg-purple-50 text-purple-700" :
                    user?.role === "manager" ? "bg-blue-50 text-blue-700" :
                    user?.role === "technician" ? "bg-amber-50 text-amber-700" :
                    "bg-slate-100 text-slate-600"}`}>
                  {user?.role ?? "member"}
                </span>
              </div>

              <div className="py-1">
                <Link
                  href={profileLink()}
                  onClick={() => setDropOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition cursor-pointer"
                >
                  <User className="w-4 h-4" /> Profile
                </Link>
                <Link
                  href="/dashboard/settings"
                  onClick={() => setDropOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition cursor-pointer"
                >
                  <Settings className="w-4 h-4" /> Settings
                </Link>
              </div>

              <div className="border-t border-slate-100 py-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition w-full cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}