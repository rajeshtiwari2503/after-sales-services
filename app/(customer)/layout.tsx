// "use client";
// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";
// import { Ticket, MessageSquare, Star, MapPin, Bell, User, LogOut } from "lucide-react";
// import { useState } from "react";

// const NAV = [
//   { label: "My Requests", href: "/customer/dashboard", icon: Ticket },
//   { label: "Track", href: "/customer/track", icon: MapPin },
//   { label: "Chat", href: "/customer/chat", icon: MessageSquare },
//   { label: "Reviews", href: "/customer/reviews", icon: Star },
// ];

// export default function CustomerLayout({ children }: { children: React.ReactNode }) {
//   const pathname = usePathname();
//   const router = useRouter();
//   const [menuOpen, setMenuOpen] = useState(false);

//   const handleLogout = async () => {
//     await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
//     localStorage.removeItem("user");
//     router.push("/login");
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 flex flex-col">
//       {/* Top header */}
//       <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30">
//         <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center">
//               <span className="text-white text-xs font-bold">ST</span>
//             </div>
//             <span className="font-bold text-sm text-slate-800">SaaS Techify</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition cursor-pointer" aria-label="Notifications">
//               <Bell className="w-4 h-4" />
//             </button>
//             <div className="relative">
//               <button onClick={() => setMenuOpen(p => !p)}
//                 className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition cursor-pointer" aria-label="Profile">
//                 <User className="w-4 h-4" />
//               </button>
//               {menuOpen && (
//                 <div className="absolute right-0 top-full mt-1.5 w-40 bg-white rounded-xl border border-slate-200 shadow-lg py-1 z-50">
//                   <Link href="/customer/profile" onClick={() => setMenuOpen(false)}
//                     className="flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 transition cursor-pointer">
//                     <User className="w-3.5 h-3.5" /> Profile
//                   </Link>
//                   <button onClick={handleLogout}
//                     className="flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition cursor-pointer w-full">
//                     <LogOut className="w-3.5 h-3.5" /> Sign out
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Content */}
//       <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">{children}</main>

//       {/* Bottom nav — mobile */}
//       <nav className="bg-white border-t border-slate-200/80 sticky bottom-0 z-30">
//         <div className="max-w-3xl mx-auto flex">
//           {NAV.map(({ label, href, icon: Icon }) => {
//             const active = pathname === href || pathname.startsWith(href + '/');
//             return (
//               <Link key={href} href={href}
//                 className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition
//                   ${active ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}>
//                 <Icon className="w-5 h-5" />
//                 {label}
//               </Link>
//             );
//           })}
//         </div>
//       </nav>
//     </div>
//   );
// }
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Ticket, MessageSquare, Star, MapPin, Bell, User, LogOut, X, Settings } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useUser } from "@/hooks/useUser";

const BOTTOM_NAV = [
  { label: "Requests", href: "/customer/dashboard", icon: Ticket },
  { label: "Track", href: "/customer/track", icon: MapPin },
  { label: "Chat", href: "/customer/chat", icon: MessageSquare },
  { label: "Reviews", href: "/customer/reviews", icon: Star },
];

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, initials } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    localStorage.removeItem("user");
    router.push("/login");
  };

  const isActive = (href: string) =>
    pathname === href || (href !== "/customer/dashboard" && pathname.startsWith(href));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-lg mx-auto">
      {/* Top header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30">
        <div className="px-4 h-14 flex items-center justify-between">
          {/* Brand */}
          <Link href="/customer/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">ST</span>
            </div>
            <span className="font-bold text-sm text-slate-800">SaaS Techify</span>
          </Link>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            {/* Notifications */}
            <button className="relative w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 transition cursor-pointer" aria-label="Notifications">
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-red-500" />
            </button>

            {/* Profile menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(p => !p)}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold cursor-pointer ring-2 ring-transparent hover:ring-indigo-300 transition"
                aria-label="Profile menu"
              >
                {initials}
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-slate-200 shadow-xl py-1.5 z-50">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-semibold text-slate-800">{user?.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{user?.email}</p>
                  </div>
                  <Link href="/customer/profile" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 transition cursor-pointer">
                    <User className="w-3.5 h-3.5" /> Profile settings
                  </Link>
                  <button onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition cursor-pointer w-full">
                    <LogOut className="w-3.5 h-3.5" /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 py-5 pb-20">{children}</main>

      {/* Bottom navigation */}
      <nav className="bg-white border-t border-slate-200/80 fixed bottom-0 left-0 right-0 z-30 max-w-lg mx-auto">
        <div className="flex">
          {BOTTOM_NAV.map(({ label, href, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link key={href} href={href}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors
                  ${active ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}>
                <Icon className={`w-5 h-5 ${active ? "stroke-[2.5]" : ""}`} />
                <span className={`text-[10px] font-medium ${active ? "font-semibold" : ""}`}>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}