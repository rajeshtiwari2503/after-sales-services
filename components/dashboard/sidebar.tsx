//  "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import {
//   LayoutDashboard, BarChart2, Ticket, Users, Wrench,
//   Monitor, Building2, FileText, Settings, ChevronLeft,
//   ChevronRight, Menu, X, LogOut, Bell,
// } from "lucide-react";

// const NAV = [
//   {
//     section: "Overview",
//     items: [
//       { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
//       { label: "Analytics", icon: BarChart2, href: "/dashboard/analytics" },
//     ],
//   },
//   {
//     section: "Service",
//     items: [
//       { label: "Tickets", icon: Ticket, href: "/dashboard/tickets", badge: "12" },
//       { label: "Customers", icon: Users, href: "/dashboard/customer" },
//       { label: "Technicians", icon: Wrench, href: "/dashboard/technician", dot: true },
//       { label: "Service Centers", icon: Wrench, href: "/dashboard/service-centers", dot: true },
//       { label: "Feedback", icon: Wrench, href: "/dashboard/feedback", dot: true },
//       { label: "Chat", icon: Wrench, href: "/dashboard/chat", dot: true },
//       { label: "Inventory", icon: Wrench, href: "/dashboard/inventory", dot: true },
//       { label: "notifications", icon: Wrench, href: "/dashboard/notifications", dot: true },
      
//       { label: "users", icon: Wrench, href: "/dashboard/users", dot: true },
//       { label: "warranty", icon: Wrench, href: "/dashboard/warranty", dot: true },
     
//       { label: "Billing", icon: Wrench, href: "/dashboard/billing", dot: true },
//       { label: "Brand", icon: Wrench, href: "/dashboard/brand", dot: true },
    
 
   
//     ],
//   },
//   {
//     section: "Management",
//     items: [
//        { label: "AI", icon: Wrench, href: "/dashboard/ai", dot: true },
//       { label: "Realtime", icon: Wrench, href: "/dashboard/realtime", dot: true },
//       { label: "Reports", icon: FileText, href: "/dashboard/reports" },
//       { label: "Settings", icon: Settings, href: "/dashboard/settings" },
//     ],
//   },
// ];

// export default function Sidebar() {
//   const pathname = usePathname();
//   const [collapsed, setCollapsed] = useState(false);
//   const [mobileOpen, setMobileOpen] = useState(false);

//   const SidebarContent = () => (
//     <div className="flex flex-col h-full">
//       {/* Top — Brand */}
//       <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/[0.06] ${collapsed ? "justify-center" : ""}`}>
//         <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center shrink-0">
//           <span className="text-white font-bold text-xs font-mono">ST</span>
//         </div>
//         {!collapsed && (
//           <div className="overflow-hidden">
//             <p className="text-white font-bold text-sm leading-none">SaaS Techify</p>
//             <p className="text-white/35 text-[10px] uppercase tracking-widest mt-0.5">After Sales</p>
//           </div>
//         )}
//       </div>

//       {/* Nav */}
//       <div className="flex-1 overflow-y-auto py-3 px-2 space-y-5 scrollbar-hide">
//         {NAV.map(({ section, items }) => (
//           <div key={section}>
//             {!collapsed && (
//               <p className="text-[10px] font-semibold text-white/25 uppercase tracking-[1.2px] px-2 mb-1">
//                 {section}
//               </p>
//             )}
//             <div className="space-y-0.5">
//               {items.map(({ label, icon: Icon, href, badge, dot }) => {
//                 const active = pathname === href;
//                 return (
//                   <Link
//                     key={href}
//                     href={href}
//                     onClick={() => setMobileOpen(false)}
//                     className={`flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg transition-all group relative
//                       ${active
//                         ? "bg-indigo-500/20 text-indigo-300"
//                         : "text-white/50 hover:bg-white/[0.06] hover:text-white/80"
//                       }
//                       ${collapsed ? "justify-center px-2" : ""}
//                     `}
//                   >
//                     <Icon className={`w-[18px] h-[18px] shrink-0 ${active ? "text-indigo-400" : ""}`} />
//                     {!collapsed && (
//                       <>
//                         <span className="text-[13px] font-medium flex-1">{label}</span>
//                         {badge && (
//                           <span className="bg-indigo-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
//                             {badge}
//                           </span>
//                         )}
//                         {dot && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
//                       </>
//                     )}
//                     {/* Tooltip when collapsed */}
//                     {collapsed && (
//                       <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
//                         {label}
//                       </div>
//                     )}
//                   </Link>
//                 );
//               })}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Footer — User */}
//       <div className="p-2 border-t border-white/[0.06]">
//         {!collapsed ? (
//           <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.06] transition cursor-pointer group">
//             <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
//               RS
//             </div>
//             <div className="flex-1 overflow-hidden">
//               <p className="text-white/85 text-xs font-semibold truncate">Rahul Sharma</p>
//               <p className="text-white/30 text-[10px]">Admin</p>
//             </div>
//             <LogOut className="w-3.5 h-3.5 text-white/25 group-hover:text-white/50 transition shrink-0" />
//           </div>
//         ) : (
//           <div className="flex justify-center py-1">
//             <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold cursor-pointer">
//               RS
//             </div>
//           </div>
//         )}

//         {/* Collapse toggle — desktop */}
//         <button
//           onClick={() => setCollapsed(p => !p)}
//           className="hidden lg:flex w-full items-center justify-center mt-1 py-1.5 rounded-lg text-white/20 hover:text-white/50 hover:bg-white/[0.04] transition cursor-pointer"
//           aria-label="Toggle sidebar"
//         >
//           {collapsed
//             ? <ChevronRight className="w-4 h-4" />
//             : <ChevronLeft className="w-4 h-4" />
//           }
//         </button>
//       </div>
//     </div>
//   );

//   return (
//     <>
//       {/* Mobile toggle button */}
//       <button
//         onClick={() => setMobileOpen(true)}
//         className="lg:hidden fixed top-3.5 left-4 z-50 w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center shadow-lg"
//         aria-label="Open sidebar"
//       >
//         <Menu className="w-4 h-4" />
//       </button>

//       {/* Mobile overlay */}
//       {mobileOpen && (
//         <div
//           className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
//           onClick={() => setMobileOpen(false)}
//         />
//       )}

//       {/* Mobile sidebar */}
//       <aside
//         className={`lg:hidden fixed top-0 left-0 z-50 h-screen w-64 bg-slate-950 transition-transform duration-300
//           ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
//       >
//         <button
//           onClick={() => setMobileOpen(false)}
//           className="absolute top-4 right-4 text-white/40 hover:text-white/70 transition cursor-pointer"
//           aria-label="Close sidebar"
//         >
//           <X className="w-4 h-4" />
//         </button>
//         <SidebarContent />
//       </aside>

//       {/* Desktop sidebar */}
//       <aside
//         className={`hidden lg:flex flex-col h-screen bg-slate-950 transition-all duration-300 shrink-0 sticky top-0
//           ${collapsed ? "w-16" : "w-60"}`}
//       >
//         <SidebarContent />
//       </aside>
//     </>
//   );
// }

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, BarChart2, Ticket, Users, Wrench,
  Monitor, Building2, FileText, Settings, ChevronLeft,
  ChevronRight, Menu, X, LogOut, Bell, HelpCircle,
} from "lucide-react";
import { useUser } from "@/hooks/useUser";
 

const NAV = [
  {
    section: "Overview",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
      { label: "Analytics", icon: BarChart2, href: "/dashboard/analytics" },
    ],
  },
  {
    section: "Service",
    items: [
      { label: "Tickets", icon: Ticket, href: "/dashboard/tickets", badge: "12" },
      { label: "Customers", icon: Users, href: "/dashboard/customers" },
      { label: "Technicians", icon: Wrench, href: "/dashboard/technicians", dot: true },
        { label: "Service Centers", icon: Wrench, href: "/dashboard/service-centers", dot: true },
      { label: "Feedback", icon: Wrench, href: "/dashboard/feedback", dot: true },
      { label: "Chat", icon: Wrench, href: "/dashboard/chat", dot: true },
      { label: "Inventory", icon: Wrench, href: "/dashboard/inventory", dot: true },
      { label: "notifications", icon: Wrench, href: "/dashboard/notifications", dot: true },
      
      { label: "users", icon: Wrench, href: "/dashboard/users", dot: true },
      { label: "warranty", icon: Wrench, href: "/dashboard/warranty", dot: true },
     
      { label: "Billing", icon: Wrench, href: "/dashboard/billing", dot: true },
      { label: "Brand", icon: Wrench, href: "/dashboard/brand", dot: true },
    ],
  },
  {
    section: "Management",
    items: [
       { label: "AI", icon: Wrench, href: "/dashboard/ai", dot: true },
      { label: "Realtime", icon: Wrench, href: "/dashboard/realtime", dot: true },
      { label: "Reports", icon: FileText, href: "/dashboard/reports" },
      { label: "Settings", icon: Settings, href: "/dashboard/settings" },
    ],
  },
];

interface NavItemProps {
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
  dot?: boolean;
  active: boolean;
  collapsed: boolean;
  onClick?: () => void;
}

function NavItem({ label, icon: Icon, href, badge, dot, active, collapsed, onClick }: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`relative flex items-center gap-2.5 rounded-lg transition-all duration-150 group
        ${collapsed ? "justify-center p-2.5" : "px-3 py-2.5"}
        ${active
          ? "bg-indigo-500/15 text-indigo-300"
          : "text-white/45 hover:bg-white/[0.05] hover:text-white/75"
        }`}
    >
      <Icon className={`w-[18px] h-[18px] shrink-0 transition-colors ${active ? "text-indigo-400" : ""}`} />

      {!collapsed && (
        <>
          <span className="text-[13px] font-medium flex-1 truncate">{label}</span>
          {badge && (
            <span className="bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
              {badge}
            </span>
          )}
          {dot && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />}
        </>
      )}

      {/* Tooltip on collapse */}
      {collapsed && (
        <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 border border-white/10 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[100] shadow-xl">
          {label}
          {badge && <span className="ml-1.5 bg-indigo-500 text-white text-[9px] px-1 py-0.5 rounded-full">{badge}</span>}
        </span>
      )}

      {/* Active indicator */}
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-400 rounded-r-full" />
      )}
    </Link>
  );
}

export default function Sidebar() {
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

  const Content = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className={`flex items-center gap-3 h-16 px-4 border-b border-white/[0.06] shrink-0 ${collapsed ? "justify-center" : ""}`}>
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-indigo-900/40">
          <span className="text-white font-bold text-xs font-mono">ST</span>
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-white font-bold text-sm leading-none tracking-tight">SaaS Techify</p>
            <p className="text-white/30 text-[10px] uppercase tracking-widest mt-0.5">After Sales</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-6 scrollbar-hide">
        {NAV.map(({ section, items }) => (
          <div key={section}>
            {!collapsed && (
              <p className="text-[10px] font-semibold text-white/20 uppercase tracking-[1.5px] px-3 mb-1.5">
                {section}
              </p>
            )}
            {collapsed && <div className="w-6 h-px bg-white/[0.08] mx-auto mb-2" />}
            <div className="space-y-0.5">
              {items.map((item) => (
                <NavItem
                  key={item.href}
                  {...item}
                  active={pathname === item.href}
                  collapsed={collapsed}
                  onClick={() => setMobileOpen(false)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div className="px-2 pb-3 space-y-1 border-t border-white/[0.06] pt-3 shrink-0">
        {/* Help */}
        <button className={`w-full flex items-center gap-2.5 rounded-lg text-white/35 hover:bg-white/[0.05] hover:text-white/60 transition-all cursor-pointer
          ${collapsed ? "justify-center p-2.5" : "px-3 py-2"}`}>
          <HelpCircle className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span className="text-[13px] font-medium">Help & Support</span>}
        </button>

        {/* User */}
        <div className={`flex items-center gap-2.5 rounded-lg hover:bg-white/[0.05] transition cursor-pointer group
          ${collapsed ? "justify-center p-2.5" : "px-3 py-2"}`}>
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-white/80 text-xs font-semibold truncate">{user?.name || "User"}</p>
                <p className="text-white/30 text-[10px] capitalize">{user?.role || "member"}</p>
              </div>
              <button
                onClick={handleLogout}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-red-400 text-white/25 cursor-pointer rounded"
                aria-label="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

        {/* Collapse toggle — desktop only */}
        <button
          onClick={() => setCollapsed(p => !p)}
          className={`hidden lg:flex w-full items-center rounded-lg text-white/20 hover:text-white/50 hover:bg-white/[0.04] transition py-1.5 cursor-pointer
            ${collapsed ? "justify-center" : "px-3 gap-2"}`}
          aria-label="Toggle sidebar"
        >
          {collapsed
            ? <ChevronRight className="w-4 h-4" />
            : <><ChevronLeft className="w-4 h-4" /><span className="text-[11px]">Collapse</span></>
          }
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-9 h-9 bg-slate-900 border border-white/10 text-white rounded-lg flex items-center justify-center shadow-lg cursor-pointer"
        aria-label="Open menu"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside className={`lg:hidden fixed top-0 left-0 z-50 h-screen w-64 bg-[#0a0f1e] border-r border-white/[0.06] transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 text-white/30 hover:text-white/60 transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
        <Content />
      </aside>

      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col h-screen bg-[#0a0f1e] border-r border-white/[0.06] transition-all duration-300 shrink-0 sticky top-0 ${collapsed ? "w-[68px]" : "w-60"}`}>
        <Content />
      </aside>
    </>
  );
}