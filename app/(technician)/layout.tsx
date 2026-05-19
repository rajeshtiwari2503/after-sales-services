// "use client";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import DashboardHeader from "@/components/dashboard/header";
// import { Briefcase, CheckSquare, MessageSquare, Camera, BarChart2 } from "lucide-react";

// const NAV = [
//   { label: "Dashboard", href: "/technician/dashboard", icon: BarChart2 },
//   { label: "My Jobs", href: "/technician/jobs", icon: Briefcase },
//   { label: "Chat", href: "/technician/chat", icon: MessageSquare },
//   { label: "Photos", href: "/technician/photos", icon: Camera },
//   { label: "Summary", href: "/technician/summary", icon: CheckSquare },
// ];

// export default function TechnicianLayout({ children }: { children: React.ReactNode }) {
//   const pathname = usePathname();
//   return (
//     <div className="flex h-screen overflow-hidden bg-slate-50">
//       {/* Slim sidebar */}
//       <aside className="hidden md:flex w-56 bg-slate-950 flex-col shrink-0 sticky top-0 h-screen">
//         <div className="flex items-center gap-2.5 h-16 px-4 border-b border-white/[0.06]">
//           <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
//             <span className="text-white text-xs font-bold">ST</span>
//           </div>
//           <div>
//             <p className="text-white text-sm font-bold">SaaS Techify</p>
//             <p className="text-white/30 text-[10px] uppercase tracking-widest">Technician</p>
//           </div>
//         </div>
//         <nav className="flex-1 px-2 py-4 space-y-0.5">
//           {NAV.map(({ label, href, icon: Icon }) => {
//             const active = pathname === href || pathname.startsWith(href + '/');
//             return (
//               <Link key={href} href={href}
//                 className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition
//                   ${active ? "bg-amber-500/20 text-amber-300" : "text-white/45 hover:bg-white/[0.05] hover:text-white/75"}`}>
//                 <Icon className="w-4 h-4 shrink-0" />
//                 {label}
//               </Link>
//             );
//           })}
//         </nav>
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
import DashboardHeader from "@/components/dashboard/header";
import {
  BarChart2, Briefcase, MessageSquare, Camera,
  CheckSquare, Menu, X, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { useUser } from "@/hooks/useUser";

const NAV = [
  { label: "Dashboard", href: "/technician/dashboard", icon: BarChart2 },
  { label: "My Jobs", href: "/technician/jobs", icon: Briefcase },
  { label: "Chat", href: "/technician/chat", icon: MessageSquare },
  { label: "Photos", href: "/technician/photos", icon: Camera },
  { label: "Summary", href: "/technician/summary", icon: CheckSquare },
];

export default function TechnicianLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, initials } = useUser();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    localStorage.removeItem("user");
    router.push("/login");
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className={`flex items-center gap-3 h-16 px-4 border-b border-white/[0.06] shrink-0 ${collapsed ? "justify-center" : ""}`}>
        <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-xs">ST</span>
        </div>
        {!collapsed && (
          <div>
            <p className="text-white font-bold text-sm leading-none">SaaS Techify</p>
            <p className="text-white/30 text-[10px] uppercase tracking-widest mt-0.5">Technician</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href} onClick={() => setMobileOpen(false)}
              className={`relative flex items-center gap-2.5 rounded-lg transition-all
                ${collapsed ? "justify-center p-2.5" : "px-3 py-2.5"}
                ${active ? "bg-amber-500/20 text-amber-300" : "text-white/45 hover:bg-white/[0.05] hover:text-white/75"}`}>
              <Icon className={`w-[18px] h-[18px] shrink-0 ${active ? "text-amber-400" : ""}`} />
              {!collapsed && <span className="text-[13px] font-medium">{label}</span>}
              {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-amber-400 rounded-r-full" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 pb-3 border-t border-white/[0.06] pt-3 space-y-1 shrink-0">
        <div className={`flex items-center gap-2.5 rounded-lg hover:bg-white/[0.05] transition cursor-pointer group
          ${collapsed ? "justify-center p-2.5" : "px-3 py-2"}`}>
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white/80 text-xs font-semibold truncate">{user?.name ?? "Technician"}</p>
              <p className="text-white/30 text-[10px]">Technician</p>
            </div>
          )}
        </div>
        <button onClick={() => setCollapsed(p => !p)}
          className={`hidden lg:flex w-full items-center rounded-lg text-white/20 hover:text-white/50 hover:bg-white/[0.04] transition py-1.5 cursor-pointer
            ${collapsed ? "justify-center" : "px-3 gap-2"}`}>
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span className="text-[11px]">Collapse</span></>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Mobile toggle */}
      <button onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-9 h-9 bg-slate-900 border border-white/10 text-white rounded-lg flex items-center justify-center shadow-lg cursor-pointer">
        <Menu className="w-4 h-4" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile drawer */}
      <aside className={`lg:hidden fixed top-0 left-0 z-50 h-screen w-60 bg-[#0a0f1e] border-r border-white/[0.06] transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <button onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 text-white/30 hover:text-white/60 cursor-pointer">
          <X className="w-4 h-4" />
        </button>
        <Sidebar />
      </aside>

      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col h-screen bg-[#0a0f1e] border-r border-white/[0.06] transition-all duration-300 shrink-0 sticky top-0 ${collapsed ? "w-[68px]" : "w-56"}`}>
        <Sidebar />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-5 lg:p-6">{children}</main>
      </div>
    </div>
  );
}