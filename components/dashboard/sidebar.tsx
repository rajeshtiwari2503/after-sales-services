

// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";
// import {
//   LayoutDashboard, BarChart2, Ticket, Users, Wrench,
//   Monitor, Building2, FileText, Settings, ChevronLeft,
//   ChevronRight, Menu, X, LogOut, Bell, HelpCircle,  MessageSquare,
//   MessagesSquare,
//   Boxes,

//   ShieldCheck,
//   CreditCard,
//   BadgeCheck,
//   Bot,
//   Activity,
//   Package,
//   Wallet,
//   Clock,
//   MapPin,
//   Shield,
// } from "lucide-react";
// import { useUser } from "@/hooks/useUser";


// // const NAV = [
// //   {
// //     section: "Overview",
// //     items: [
// //       { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
// //       { label: "Analytics", icon: BarChart2, href: "/dashboard/analytics" },
// //     ],
// //   },
// //   {
// //     section: "Service",
// //     items: [
// //       { label: "Tickets", icon: Ticket, href: "/dashboard/tickets", badge: "12" },
// //       { label: "Customers", icon: Users, href: "/dashboard/customers" },
// //       { label: "Technicians", icon: Wrench, href: "/dashboard/technicians", dot: true },
// //         { label: "Service Centers", icon: Wrench, href: "/dashboard/service-centers", dot: true },
// //       { label: "Feedback", icon: Wrench, href: "/dashboard/feedback", dot: true },
// //       { label: "Chat", icon: Wrench, href: "/dashboard/chat", dot: true },
// //       { label: "Inventory", icon: Wrench, href: "/dashboard/inventory", dot: true },
// //       { label: "notifications", icon: Wrench, href: "/dashboard/notifications", dot: true },

// //       { label: "users", icon: Wrench, href: "/dashboard/users", dot: true },
// //       { label: "warranty", icon: Wrench, href: "/dashboard/warranty", dot: true },

// //       { label: "Billing", icon: Wrench, href: "/dashboard/billing", dot: true },
// //       { label: "Brand", icon: Wrench, href: "/dashboard/brand", dot: true },
// //     ],
// //   },
// //   {
// //     section: "Management",
// //     items: [
// //        { label: "AI", icon: Wrench, href: "/dashboard/ai", dot: true },
// //       { label: "Realtime", icon: Wrench, href: "/dashboard/realtime", dot: true },
// //       { label: "Reports", icon: FileText, href: "/dashboard/reports" },
// //       { label: "Settings", icon: Settings, href: "/dashboard/settings" },
// //     ],
// //   },
// // ];


// const NAV = [
//   {
//     section: "Overview",
//     items: [
//       {
//         label: "Dashboard",
//         icon: LayoutDashboard,
//         href: "/dashboard",
//       },
//       {
//         label: "Analytics",
//         icon: BarChart2,
//         href: "/dashboard/analytics",
//       },
//     ],
//   },

//   {
//     section: "Service",
//     items: [
//       {
//         label: "Tickets",
//         icon: Ticket,
//         href: "/dashboard/tickets",
//         badge: "12",
//       },

//       {
//         label: "Customers",
//         icon: Users,
//         href: "/dashboard/customers",
//       },

//       {
//         label: "Technicians",
//         icon: Wrench,
//         href: "/dashboard/technicians",
//         dot: true,
//       },

//       {
//         label: "Service Centers",
//         icon: Building2,
//         href: "/dashboard/service-centers",
//         dot: true,
//       },

//       {
//         label: "Feedback",
//         icon: MessageSquare,
//         href: "/dashboard/feedback",
//         dot: true,
//       },

//       {
//         label: "Chat",
//         icon: MessagesSquare,
//         href: "/dashboard/chat",
//         dot: true,
//       },

//       {
//         label: "Inventory",
//         icon: Boxes,
//         href: "/dashboard/inventory",
//         dot: true,
//       },

//       {
//         label: "Notifications",
//         icon: Bell,
//         href: "/dashboard/notifications",
//         dot: true,
//       },

//       {
//         label: "Users",
//         icon: Users,
//         href: "/dashboard/users",
//         dot: true,
//       },

//       {
//         label: "Warranty",
//         icon: ShieldCheck,
//         href: "/dashboard/warranty",
//         dot: true,
//       },

//       {
//         label: "Billing",
//         icon: CreditCard,
//         href: "/dashboard/billing",
//         dot: true,
//       },

//       {
//         label: "Brand",
//         icon: BadgeCheck,
//         href: "/dashboard/brand",
//         dot: true,
//       },
//     ],
//   },

//   {
//     section: "Management",
//     items: [
//       {
//         label: "AI",
//         icon: Bot,
//         href: "/dashboard/ai",
//         dot: true,
//       },
//  {
//         label: "Roles & Permissions",
//         icon: Users,
//         href: "/dashboard/roles",
//         dot: true,
//       },
//       {
//         label: "Realtime",
//         icon: Activity,
//         href: "/dashboard/realtime",
//         dot: true,
//       },

//       {
//         label: "Reports",
//         icon: FileText,
//         href: "/dashboard/reports",
//       },

//       {
//         label: "Settings",
//         icon: Settings,
//         href: "/dashboard/settings",
//       },
//     ],
//   },
// ];

// const NAV_BY_ROLE: Record<string, typeof NAV> = {
//   admin: NAV, // existing full nav
//   manager: [
//     { section: "Brand", items: [
//       { label: "Dashboard", icon: LayoutDashboard, href: "/brand/dashboard" },
//       { label: "Products", icon: Package, href: "/brand/products" },
//       { label: "Warranty", icon: Shield, href: "/brand/warranty" },
//       { label: "Service Centers", icon: MapPin, href: "/brand/service-centers" },
//       { label: "Analytics", icon: BarChart2, href: "/brand/analytics" },
//       { label: "Tickets", icon: Ticket, href: "/brand/tickets" },
//     ]},
//   ],
//   service_center: [
//     { section: "Operations", items: [
//       { label: "Dashboard", icon: LayoutDashboard, href: "/service-center/dashboard" },
//       { label: "Tickets", icon: Ticket, href: "/service-center/tickets", badge: "12" },
//       { label: "Technicians", icon: Users, href: "/service-center/technicians" },
//       { label: "Inventory", icon: Package, href: "/service-center/inventory" },
//       { label: "Wallet", icon: Wallet, href: "/service-center/wallet" },
//       { label: "SLA Monitor", icon: Clock, href: "/service-center/sla" },
//       { label: "Reports", icon: FileText, href: "/service-center/reports" },
//     ]},
//   ],
// };
// interface NavItemProps {
//   label: string;
//   icon: React.ElementType;
//   href: string;
//   badge?: string;
//   dot?: boolean;
//   active: boolean;
//   collapsed: boolean;
//   onClick?: () => void;
// }

// function NavItem({ label, icon: Icon, href, badge, dot, active, collapsed, onClick }: NavItemProps) {
//   return (
//     <Link
//       href={href}
//       onClick={onClick}
//       className={`relative flex items-center gap-2.5 rounded-lg transition-all duration-150 group
//         ${collapsed ? "justify-center p-2.5" : "px-3 py-2.5"}
//         ${active
//           ? "bg-indigo-500/15 text-indigo-300"
//           : "text-white/45 hover:bg-white/[0.05] hover:text-white/75"
//         }`}
//     >
//       <Icon className={`w-[18px] h-[18px] shrink-0 transition-colors ${active ? "text-indigo-400" : ""}`} />

//       {!collapsed && (
//         <>
//           <span className="text-[13px] font-medium flex-1 truncate">{label}</span>
//           {badge && (
//             <span className="bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
//               {badge}
//             </span>
//           )}
//           {dot && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />}
//         </>
//       )}

//       {/* Tooltip on collapse */}
//       {collapsed && (
//         <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 border border-white/10 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[100] shadow-xl">
//           {label}
//           {badge && <span className="ml-1.5 bg-indigo-500 text-white text-[9px] px-1 py-0.5 rounded-full">{badge}</span>}
//         </span>
//       )}

//       {/* Active indicator */}
//       {active && (
//         <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-400 rounded-r-full" />
//       )}
//     </Link>
//   );
// }

// // export default function Sidebar() {
// export default function Sidebar({ role = "admin" }: { role?: string }) {
//   const navItems = NAV_BY_ROLE[role] ?? NAV;
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

//   const Content = () => (
//     <div className="flex flex-col h-full">
//       {/* Brand */}
//       <div className={`flex items-center gap-3 h-16 px-4 border-b border-white/[0.06] shrink-0 ${collapsed ? "justify-center" : ""}`}>
//         <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-indigo-900/40">
//           <span className="text-white font-bold text-xs font-mono">ST</span>
//         </div>
//         {!collapsed && (
//           <div className="overflow-hidden">
//             <p className="text-white font-bold text-sm leading-none tracking-tight">SaaS Techify</p>
//             <p className="text-white/30 text-[10px] uppercase tracking-widest mt-0.5">After Sales</p>
//           </div>
//         )}
//       </div>

//       {/* Nav */}
//       <div className="flex-1 overflow-y-auto py-4 px-2 space-y-6 scrollbar-hide">
//         {NAV.map(({ section, items }) => (
//           <div key={section}>
//             {!collapsed && (
//               <p className="text-[10px] font-semibold text-white/20 uppercase tracking-[1.5px] px-3 mb-1.5">
//                 {section}
//               </p>
//             )}
//             {collapsed && <div className="w-6 h-px bg-white/[0.08] mx-auto mb-2" />}
//             <div className="space-y-0.5">
//               {items.map((item) => (
//                 <NavItem
//                   key={item.href}
//                   {...item}
//                   active={pathname === item.href}
//                   collapsed={collapsed}
//                   onClick={() => setMobileOpen(false)}
//                 />
//               ))}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Bottom */}
//       <div className="px-2 pb-3 space-y-1 border-t border-white/[0.06] pt-3 shrink-0">
//         {/* Help */}
//         <button className={`w-full flex items-center gap-2.5 rounded-lg text-white/35 hover:bg-white/[0.05] hover:text-white/60 transition-all cursor-pointer
//           ${collapsed ? "justify-center p-2.5" : "px-3 py-2"}`}>
//           <HelpCircle className="w-[18px] h-[18px] shrink-0" />
//           {!collapsed && <span className="text-[13px] font-medium">Help & Support</span>}
//         </button>

//         {/* User */}
//         <div className={`flex items-center gap-2.5 rounded-lg hover:bg-white/[0.05] transition cursor-pointer group
//           ${collapsed ? "justify-center p-2.5" : "px-3 py-2"}`}>
//           <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
//             {initials}
//           </div>
//           {!collapsed && (
//             <>
//               <div className="flex-1 min-w-0">
//                 <p className="text-white/80 text-xs font-semibold truncate">{user?.name || "User"}</p>
//                 <p className="text-white/30 text-[10px] capitalize">{user?.role || "member"}</p>
//               </div>
//               <button
//                 onClick={handleLogout}
//                 className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-red-400 text-white/25 cursor-pointer rounded"
//                 aria-label="Logout"
//               >
//                 <LogOut className="w-3.5 h-3.5" />
//               </button>
//             </>
//           )}
//         </div>

//         {/* Collapse toggle — desktop only */}
//         <button
//           onClick={() => setCollapsed(p => !p)}
//           className={`hidden lg:flex w-full items-center rounded-lg text-white/20 hover:text-white/50 hover:bg-white/[0.04] transition py-1.5 cursor-pointer
//             ${collapsed ? "justify-center" : "px-3 gap-2"}`}
//           aria-label="Toggle sidebar"
//         >
//           {collapsed
//             ? <ChevronRight className="w-4 h-4" />
//             : <><ChevronLeft className="w-4 h-4" /><span className="text-[11px]">Collapse</span></>
//           }
//         </button>
//       </div>
//     </div>
//   );

//   return (
//     <>
//       {/* Mobile toggle */}
//       <button
//         onClick={() => setMobileOpen(true)}
//         className="lg:hidden fixed top-4 left-4 z-50 w-9 h-9 bg-slate-900 border border-white/10 text-white rounded-lg flex items-center justify-center shadow-lg cursor-pointer"
//         aria-label="Open menu"
//       >
//         <Menu className="w-4 h-4" />
//       </button>

//       {/* Mobile overlay */}
//       {mobileOpen && (
//         <div
//           className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
//           onClick={() => setMobileOpen(false)}
//         />
//       )}

//       {/* Mobile sidebar */}
//       <aside className={`lg:hidden fixed top-0 left-0 z-50 h-screen w-64 bg-[#0a0f1e] border-r border-white/[0.06] transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
//         <button
//           onClick={() => setMobileOpen(false)}
//           className="absolute top-4 right-4 text-white/30 hover:text-white/60 transition cursor-pointer"
//           aria-label="Close"
//         >
//           <X className="w-4 h-4" />
//         </button>
//         <Content />
//       </aside>

//       {/* Desktop sidebar */}
//       <aside className={`hidden lg:flex flex-col h-screen bg-[#0a0f1e] border-r border-white/[0.06] transition-all duration-300 shrink-0 sticky top-0 ${collapsed ? "w-[68px]" : "w-60"}`}>
//         <Content />
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
  Building2, FileText, Settings, ChevronLeft,
  ChevronRight, Menu, X, LogOut, Star, Bell, HelpCircle,
  MessageSquare,
  MessagesSquare,
  Boxes,

  ShieldCheck,
  CreditCard,
  BadgeCheck,
  Bot,
  Activity,
  Package,
  Wallet,
  Clock,
  MapPin,
  Shield,
  Contact,
} from "lucide-react";
import { useUser } from "@/hooks/useUser";
import Image from "next/image";

// ─── Nav config per role ───────────────────────────────────────
const NAV_CONFIG: Record<string, { section: string; items: { label: string; icon: any; href: string; badge?: string; dot?: boolean }[] }[]> = {
  admin: [
    {
      section: "Overview",
      items: [
        {
          label: "Dashboard",
          icon: LayoutDashboard,
          href: "/dashboard",
        },
        {
          label: "Analytics",
          icon: BarChart2,
          href: "/dashboard/analytics",
        },
      ],
    },

    {
      section: "Service",
      items: [
        {
          label: "Tickets",
          icon: Ticket,
          href: "/dashboard/tickets",
          badge: "12",
        },

        {
          label: "Customers",
          icon: Users,
          href: "/dashboard/customers",
        },

        {
          label: "Technicians",
          icon: Wrench,
          href: "/dashboard/technicians",
          dot: true,
        },

        {
          label: "Service Centers",
          icon: Building2,
          href: "/dashboard/service-centers",
          dot: true,
        },

        {
          label: "Feedback",
          icon: MessageSquare,
          href: "/dashboard/feedback",
          dot: true,
        },

        {
          label: "Chat",
          icon: MessagesSquare,
          href: "/dashboard/chat",
          dot: true,
        },

        {
          label: "Contact",
          icon: Contact,
          href: "/dashboard/contact",
          dot: true,
        },
        {
          label: "Inventory",
          icon: Boxes,
          href: "/dashboard/inventory",
          dot: true,
        },

        {
          label: "Notifications",
          icon: Bell,
          href: "/dashboard/notifications",
          dot: true,
        },

        {
          label: "Users",
          icon: Users,
          href: "/dashboard/users",
          dot: true,
        },

        {
          label: "Warranty",
          icon: ShieldCheck,
          href: "/dashboard/warranty",
          dot: true,
        },

        {
          label: "Billing",
          icon: CreditCard,
          href: "/dashboard/billing",
          dot: true,
        },
        {
          label: "Wallet",
          icon: Wallet,
          href: "/dashboard/wallet",
          dot: true,
        },
        {
          label: "Brand",
          icon: BadgeCheck,
          href: "/dashboard/brand",
          dot: true,
        },
      ],
    },

    {
      section: "Management",
      items: [
        {
          label: "AI",
          icon: Bot,
          href: "/dashboard/ai",
          dot: true,
        },
        {
          label: "Audit Logs",
          icon: Star,
          href: "/dashboard/audit-logs",
          dot: true,
        },
        {
          label: "Roles & Permissions",
          icon: Users,
          href: "/dashboard/roles",
          dot: true,
        },
        {
          label: "Realtime",
          icon: Activity,
          href: "/dashboard/realtime",
          dot: true,
        },

        {
          label: "Reports",
          icon: FileText,
          href: "/dashboard/reports",
        },

        {
          label: "Settings",
          icon: Settings,
          href: "/dashboard/settings",
        },
      ],
    },
  ],
  manager: [
    {
      section: "Brand",
      items: [
        { label: "Dashboard", icon: LayoutDashboard, href: "/brand/dashboard" },
        { label: "Analytics", icon: BarChart2, href: "/brand/analytics" },
        { label: "Wallet", icon: Wallet, href: "/brand/wallet" },
      ],
    },
    {
      section: "Products",
      items: [
        { label: "Products", icon: Package, href: "/brand/products" },
        { label: "Models", icon: Package, href: "/brand/models" },
        { label: "Warranty", icon: Shield, href: "/brand/warranty" },
      ],
    },
    {
      section: "Network",
      items: [
        { label: "Service Centers", icon: MapPin, href: "/brand/service-centers" },
        { label: "Tickets", icon: Ticket, href: "/brand/tickets" },
        { label: "Reports", icon: FileText, href: "/brand/reports" },
      ],
    },
  ],
  service_center: [
    {
      section: "Operations",
      items: [
        { label: "Dashboard", icon: LayoutDashboard, href: "/service-center/dashboard" },
        { label: "Tickets", icon: Ticket, href: "/service-center/tickets", badge: "5" },
        { label: "Wallet", icon: Shield, href: "/service-center/wallet" },
      ],
    },
    {
      section: "Team",
      items: [
        { label: "Technicians", icon: Wrench, href: "/service-center/technicians" },
        { label: "Inventory", icon: Package, href: "/service-center/inventory" },
      ],
    },
    {
      section: "Finance",
      items: [
        { label: "Wallet", icon: Wallet, href: "/service-center/wallet" },
        { label: "SLA Monitor", icon: Clock, href: "/service-center/sla" },
        { label: "Reports", icon: FileText, href: "/service-center/reports" },
      ],
    },
  ],
  support: [
    {
      section: "Overview",
      items: [
        { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
        { label: "Tickets", icon: Ticket, href: "/dashboard/tickets", badge: "8" },
      ],
    },
  ],
};

// ─── Sub-components ────────────────────────────────────────────
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

function NavItem({
  label,
  icon: Icon,
  href,
  badge,
  dot,
  active,
  collapsed,
  onClick,
}: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        relative flex items-center gap-3 rounded-2xl
        transition-all duration-200 group
        overflow-hidden
        ${collapsed ? "justify-center p-3" : "px-3.5 py-3"}

        ${active
          ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm border border-blue-100"
          : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"
        }
      `}
    >

      {/* Active glow */}
      {active && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5" />
      )}

      <Icon
        className={`
          relative z-10 w-[19px] h-[19px] shrink-0
          ${active ? "text-blue-600" : ""}
        `}
      />

      {!collapsed && (
        <>
          <span className="relative z-10 text-[13px] font-semibold flex-1 truncate">
            {label}
          </span>

          {/* {badge && (
            <span className="relative z-10 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {badge}
            </span>
          )} */}

          {/* {dot && (
            <span className="relative z-10 w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
          )} */}
        </>
      )}

      {/* Tooltip */}
      {collapsed && (
        <span
          className="
            absolute left-full ml-3
            px-3 py-1.5
            bg-slate-900 text-white
            text-xs font-medium
            rounded-xl whitespace-nowrap
            opacity-0 group-hover:opacity-100
            pointer-events-none
            transition-all duration-200
            shadow-2xl z-[100]
          "
        >
          {label}
        </span>
      )}

      {/* Active bar */}
      {active && (
        <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-blue-600" />
      )}
    </Link>
  );
}

// ─── Main Sidebar ──────────────────────────────────────────────
export default function Sidebar({ role: roleProp }: { role?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, initials } = useUser();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = roleProp ?? user?.role ?? "admin";
  const navItems = NAV_CONFIG[role] ?? NAV_CONFIG.admin;

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    localStorage.removeItem("user");
    router.push("/login");
  };

  const Content = () => (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ───────────────── Brand ───────────────── */}


      {/* Glow */}

      <div className="relative z-10 flex justify-center border-b border-slate-400/80">
        <div className="relative flex items-center  md:gap-3">

          {/* Glow */}
          <div className="absolute inset-0 flex items-center justify-center blur-3xl">
            <div className="w-40 h-20 bg-cyan-300/20 rounded-full scale-110" />
          </div>

          {/* Logo */}
          <Image
            src="/logo13.png"
            alt="SaaSTechify"
            width={360}
            height={130}
            priority
            className="
      relative z-10
      h-[63px]
      w-auto
      object-contain
      drop-shadow-[0_15px_40px_rgba(34,211,238,0.22)]
      hover:scale-[1.02]
      transition-all duration-500
    "
          />

          {/* Text */}
          {!collapsed && (
            <div className="relative z-10 min-w-0">
              {/* <h2 className="text-[18px] font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                SaaSTechify
              </h2> */}

              <p className="text-[10px] uppercase tracking-[2px] text-slate-400 font-semibold mt-0.5">
                After Sales Services
              </p>
            </div>
          )}
        </div>
      </div>


      {/* ───────────────── Navigation ───────────────── */}
      <div className="flex-1 overflow-y-auto px-3 py-5 space-y-6 bg-white scrollbar-hide">

        {navItems.map(({ section, items }) => (
          <div key={section}>

            {!collapsed && (
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[2px] px-3 mb-2">
                {section}
              </p>
            )}

            {collapsed && (
              <div className="w-7 h-px bg-slate-200 mx-auto mb-3" />
            )}

            <div className="space-y-1">
              {items.map((item) => (
                <NavItem
                  key={item.href}
                  {...item}
                  active={
                    pathname === item.href  
                  }
                  collapsed={collapsed}
                  onClick={() => setMobileOpen(false)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ───────────────── Footer ───────────────── */}
      <div className="border-t border-slate-200/80 bg-slate-50 p-3 space-y-2 shrink-0">

        {/* Help */}
        <button
          className={`
            w-full flex items-center rounded-xl
            text-slate-500 hover:text-slate-900
            hover:bg-white
            transition-all duration-200
            border border-transparent hover:border-slate-200
            ${collapsed ? "justify-center p-3" : "gap-3 px-3 py-3"}
          `}
        >
          <HelpCircle className="w-[18px] h-[18px] shrink-0" />

          {!collapsed && (
            <span className="text-[13px] font-semibold">
              Help & Support
            </span>
          )}
        </button>

        {/* Notifications */}
        <button
          className={`
            w-full flex items-center rounded-xl
            text-slate-500 hover:text-slate-900
            hover:bg-white
            transition-all duration-200
            border border-transparent hover:border-slate-200
            ${collapsed ? "justify-center p-3" : "gap-3 px-3 py-3"}
          `}
        >
          <Bell className="w-[18px] h-[18px] shrink-0" />

          {!collapsed && (
            <span className="text-[13px] font-semibold">
              Notifications
            </span>
          )}
        </button>

        {/* User card */}
        <div
          className={`
            flex items-center rounded-2xl
            bg-white border border-slate-200/70
            shadow-sm hover:shadow-md
            transition-all duration-300
            ${collapsed ? "justify-center p-2.5" : "gap-3 p-3"}
          `}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-lg">
            {initials}
          </div>

          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-slate-800 truncate">
                  {user?.name ?? "User"}
                </p>

                <p className="text-[11px] text-slate-400 capitalize">
                  {user?.role ?? "member"}
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="
                  p-2 rounded-xl
                  text-slate-400 hover:text-red-500
                  hover:bg-red-50
                  transition-all
                  cursor-pointer
                "
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((p) => !p)}
          className={`
            hidden lg:flex w-full items-center justify-center
            rounded-xl border border-slate-200
            bg-white
            text-slate-500 hover:text-slate-900
            hover:bg-slate-50
            transition-all duration-300
            py-2.5 cursor-pointer
            ${collapsed ? "" : "gap-2"}
          `}
          aria-label="Toggle sidebar"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-[12px] font-semibold">
                Collapse
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="
          lg:hidden fixed top-4 left-4 z-50
          w-10 h-10 rounded-xl
          bg-white border border-slate-200
          text-slate-700
          shadow-lg
          flex items-center justify-center
        "
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`
          lg:hidden fixed top-0 left-0 z-50 h-screen
          bg-white border-r border-slate-200
          shadow-2xl
          transition-transform duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          w-[280px]
        `}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="
            absolute top-4 right-4
            text-slate-400 hover:text-slate-700
            transition cursor-pointer
          "
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <Content />
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden lg:flex flex-col h-screen sticky top-0 shrink-0
          border-r border-slate-200/70
          bg-white/95 backdrop-blur-2xl
          shadow-[0_10px_40px_rgba(15,23,42,0.06)]
          transition-all duration-300
          ${collapsed ? "w-[82px]" : "w-[285px]"}
        `}
      >
        <Content />
      </aside>
    </>
  );
}