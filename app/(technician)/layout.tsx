 

// "use client";

// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";
// import DashboardHeader from "@/components/dashboard/header";
// import {
//   BarChart2, Briefcase, MessageSquare, Camera,
//   CheckSquare, Menu, X, ChevronLeft, ChevronRight,
// } from "lucide-react";
// import { useState } from "react";
// import { useUser } from "@/hooks/useUser";

// const NAV = [
//   { label: "Dashboard", href: "/technician/dashboard", icon: BarChart2 },
//   { label: "My Jobs", href: "/technician/jobs", icon: Briefcase },
//   { label: "Chat", href: "/technician/chat", icon: MessageSquare },
//   { label: "Photos", href: "/technician/photos", icon: Camera },
//   { label: "Summary", href: "/technician/summary", icon: CheckSquare },
// ];

// export default function TechnicianLayout({ children }: { children: React.ReactNode }) {
//   const pathname = usePathname();
//   const router = useRouter();
//   const { user, initials } = useUser();
//   const [collapsed, setCollapsed] = useState(false);
//   const [mobileOpen, setMobileOpen] = useState(false);

//   const handleLogout = async () => {
//     await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
//     localStorage.removeItem("user");
//     router.push("/login");
//   };

//   const Sidebar = () => (
//     <div className="flex flex-col h-full">
//       {/* Brand */}
//       <div className={`flex items-center gap-3 h-16 px-4 border-b border-white/[0.06] shrink-0 ${collapsed ? "justify-center" : ""}`}>
//         <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center shrink-0">
//           <span className="text-white font-bold text-xs">ST</span>
//         </div>
//         {!collapsed && (
//           <div>
//             <p className="text-white font-bold text-sm leading-none">SaaS Techify</p>
//             <p className="text-white/30 text-[10px] uppercase tracking-widest mt-0.5">Technician</p>
//           </div>
//         )}
//       </div>

//       {/* Nav */}
//       <nav className="flex-1 px-2 py-4 space-y-0.5">
//         {NAV.map(({ label, href, icon: Icon }) => {
//           const active = pathname === href || pathname.startsWith(href + "/");
//           return (
//             <Link key={href} href={href} onClick={() => setMobileOpen(false)}
//               className={`relative flex items-center gap-2.5 rounded-lg transition-all
//                 ${collapsed ? "justify-center p-2.5" : "px-3 py-2.5"}
//                 ${active ? "bg-amber-500/20 text-amber-300" : "text-white/45 hover:bg-white/[0.05] hover:text-white/75"}`}>
//               <Icon className={`w-[18px] h-[18px] shrink-0 ${active ? "text-amber-400" : ""}`} />
//               {!collapsed && <span className="text-[13px] font-medium">{label}</span>}
//               {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-amber-400 rounded-r-full" />}
//             </Link>
//           );
//         })}
//       </nav>

//       {/* Footer */}
//       <div className="px-2 pb-3 border-t border-white/[0.06] pt-3 space-y-1 shrink-0">
//         <div className={`flex items-center gap-2.5 rounded-lg hover:bg-white/[0.05] transition cursor-pointer group
//           ${collapsed ? "justify-center p-2.5" : "px-3 py-2"}`}>
//           <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
//             {initials}
//           </div>
//           {!collapsed && (
//             <div className="flex-1 min-w-0">
//               <p className="text-white/80 text-xs font-semibold truncate">{user?.name ?? "Technician"}</p>
//               <p className="text-white/30 text-[10px]">Technician</p>
//             </div>
//           )}
//         </div>
//         <button onClick={() => setCollapsed(p => !p)}
//           className={`hidden lg:flex w-full items-center rounded-lg text-white/20 hover:text-white/50 hover:bg-white/[0.04] transition py-1.5 cursor-pointer
//             ${collapsed ? "justify-center" : "px-3 gap-2"}`}>
//           {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span className="text-[11px]">Collapse</span></>}
//         </button>
//       </div>
//     </div>
//   );

//   return (
//     <div className="flex h-screen overflow-hidden bg-slate-50">
//       {/* Mobile toggle */}
//       <button onClick={() => setMobileOpen(true)}
//         className="lg:hidden fixed top-4 left-4 z-50 w-9 h-9 bg-slate-900 border border-white/10 text-white rounded-lg flex items-center justify-center shadow-lg cursor-pointer">
//         <Menu className="w-4 h-4" />
//       </button>

//       {/* Mobile overlay */}
//       {mobileOpen && (
//         <div className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
//       )}

//       {/* Mobile drawer */}
//       <aside className={`lg:hidden fixed top-0 left-0 z-50 h-screen w-60 bg-[#0a0f1e] border-r border-white/[0.06] transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
//         <button onClick={() => setMobileOpen(false)}
//           className="absolute top-4 right-4 text-white/30 hover:text-white/60 cursor-pointer">
//           <X className="w-4 h-4" />
//         </button>
//         <Sidebar />
//       </aside>

//       {/* Desktop sidebar */}
//       <aside className={`hidden lg:flex flex-col h-screen bg-[#0a0f1e] border-r border-white/[0.06] transition-all duration-300 shrink-0 sticky top-0 ${collapsed ? "w-[68px]" : "w-56"}`}>
//         <Sidebar />
//       </aside>

//       <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
//         <DashboardHeader />
//         <main className="flex-1 overflow-y-auto p-5 lg:p-6">{children}</main>
//       </div>
//     </div>
//   );
// }

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Briefcase,
  MessageSquare,
  Camera,
  CheckSquare,
  Bell,
  User,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useUser } from "@/hooks/useUser";

const BOTTOM_NAV = [
    {
    label: "Dashboard",
    href: "/technician/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Jobs",
    href: "/technician/jobs",
    icon: Briefcase,
  },
  {
    label: "Chat",
    href: "/technician/chat",
    icon: MessageSquare,
  },
  {
    label: "Photos",
    href: "/technician/photos",
    icon: Camera,
  },
  {
    label: "Summary",
    href: "/technician/summary",
    icon: CheckSquare,
  },
];

export default function TechnicianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const { user, initials } = useUser();

  const [menuOpen, setMenuOpen] =
    useState(false);

  const menuRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          e.target as Node
        )
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handler
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handler
      );
    };
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    localStorage.removeItem("user");

    router.push("/login");
  };

  const isActive = (href: string) =>
    pathname === href ||
    (href !== "/technician/dashboard" &&
      pathname.startsWith(href));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30">
        <div className="px-4 h-14 flex items-center justify-between">
          {/* Brand */}
          <Link
            href="/technician/dashboard"
            className="flex items-center gap-2"
          >
            <div className="w-7 h-7 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                ST
              </span>
            </div>

            <div>
              <span className="font-bold text-sm text-slate-800 block leading-none">
                SaaS Techify
              </span>

              <span className="text-[10px] text-slate-400 uppercase tracking-wide">
                Technician
              </span>
            </div>
          </Link>

          {/* Right */}
          <div className="flex items-center gap-1.5">
            {/* Notifications */}
            <button
              className="relative w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 transition cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4.5 h-4.5" />

              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-red-500" />
            </button>

            {/* Profile */}
            <div
              className="relative"
              ref={menuRef}
            >
              <button
                onClick={() =>
                  setMenuOpen((p) => !p)
                }
                className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-xs font-bold cursor-pointer ring-2 ring-transparent hover:ring-amber-300 transition"
              >
                {initials}
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-slate-200 shadow-xl py-1.5 z-50">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-semibold text-slate-800">
                      {user?.name ??
                        "Technician"}
                    </p>

                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {user?.email}
                    </p>
                  </div>

                  <Link
                    href="/technician/profile"
                    onClick={() =>
                      setMenuOpen(false)
                    }
                    className="flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5" />
                    Profile settings
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition cursor-pointer w-full"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 px-4 py-5 pb-20">
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="bg-white border-t border-slate-200/80 fixed bottom-0 left-0 right-0 z-30 max-w-lg mx-auto">
        <div className="flex">
          {BOTTOM_NAV.map(
            ({
              label,
              href,
              icon: Icon,
            }) => {
              const active =
                isActive(href);

              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors
                  ${
                    active
                      ? "text-amber-600"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      active
                        ? "stroke-[2.5]"
                        : ""
                    }`}
                  />

                  <span
                    className={`text-[10px] font-medium ${
                      active
                        ? "font-semibold"
                        : ""
                    }`}
                  >
                    {label}
                  </span>
                </Link>
              );
            }
          )}
        </div>
      </nav>
    </div>
  );
}