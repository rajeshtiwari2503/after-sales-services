"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import DashboardHeader from "@/components/dashboard/header";
import { Briefcase, CheckSquare, MessageSquare, Camera, BarChart2 } from "lucide-react";

const NAV = [
  { label: "Dashboard", href: "/technician/dashboard", icon: BarChart2 },
  { label: "My Jobs", href: "/technician/jobs", icon: Briefcase },
  { label: "Chat", href: "/technician/chat", icon: MessageSquare },
  { label: "Photos", href: "/technician/photos", icon: Camera },
  { label: "Summary", href: "/technician/summary", icon: CheckSquare },
];

export default function TechnicianLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Slim sidebar */}
      <aside className="hidden md:flex w-56 bg-slate-950 flex-col shrink-0 sticky top-0 h-screen">
        <div className="flex items-center gap-2.5 h-16 px-4 border-b border-white/[0.06]">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">ST</span>
          </div>
          <div>
            <p className="text-white text-sm font-bold">SaaS Techify</p>
            <p className="text-white/30 text-[10px] uppercase tracking-widest">Technician</p>
          </div>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-0.5">
          {NAV.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition
                  ${active ? "bg-amber-500/20 text-amber-300" : "text-white/45 hover:bg-white/[0.05] hover:text-white/75"}`}>
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-5 lg:p-6">{children}</main>
      </div>
    </div>
  );
}