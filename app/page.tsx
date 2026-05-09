"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  Menu, X, Wrench, Zap, BarChart3, Shield, Globe, ArrowRight,
  CheckCircle, Star, Users, Clock, TrendingUp, ChevronRight,
  Ticket, Building2, UserCheck, Cpu, Bell, Wallet,
  MessageSquare, Upload, Settings, MapPin, Award, Play,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";

// ─── Animated Counter ────────────────────────────────────────────
function AnimatedCounter({ end, suffix = "", duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const startTime = performance.now();
        const animate = (now: number) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(eased * end));
          if (progress < 1) requestAnimationFrame(animate);
          else setCount(end);
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{count.toLocaleString("en-IN")}{suffix}</span>;
}

// ─── Floating Badge ───────────────────────────────────────────────
function FloatingBadge({ icon, label, value, color, delay }: {
  icon: React.ReactNode; label: string; value: string; color: string; delay: number;
}) {
  return (
    <div
      className="absolute bg-white/[0.08] backdrop-blur-xl border border-white/[0.12] rounded-2xl px-4 py-3 flex items-center gap-3 shadow-2xl"
      style={{ animation: `float ${3 + delay * 0.5}s ease-in-out infinite`, animationDelay: `${delay * 0.3}s` }}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-white font-bold text-sm leading-none">{value}</p>
        <p className="text-slate-400 text-xs mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────
function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#modules", label: "Modules" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#pricing", label: "Pricing" },
  ];

  return (
    // <header
    //   className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
    //     ? "bg-[#030712]/95 backdrop-blur-2xl border-b border-white/[0.06] shadow-[0_1px_40px_rgba(0,0,0,0.4)]"
    //     : "bg-transparent"
    //     }`}
    // >
    //   <div className="max-w-7xl mx-auto px-5 sm:px-8 h-[72px] flex items-center justify-between">
    //     {/* Logo */}
    //     <Link
    //       href="/"
    //       className="flex items-center gap-3 group"
    //     >
    //       <div className="relative">
    //         <Image
    //           src="/logo1.png"
    //           alt="SaaS Techify Logo"
    //           width={150}
    //           height={150}
    //           className="object-contain transition-transform duration-300 group-hover:scale-105"
    //           priority
    //         />
    //       </div>
    //     </Link>

    //     {/* Desktop Nav */}
    //     <nav className="hidden lg:flex items-center gap-1">
    //       {navLinks.map((link) => (
    //         <a
    //           key={link.href}
    //           href={link.href}
    //           className="text-slate-400 hover:text-white px-4 py-2 rounded-lg hover:bg-white/[0.06] transition-all text-sm font-medium"
    //         >
    //           {link.label}
    //         </a>
    //       ))}
    //     </nav>

    //     {/* Desktop CTA */}
    //     <div className="hidden lg:flex items-center gap-3">
    //       <Link
    //         href="/login"
    //         className="text-slate-300 hover:text-white px-4 py-2 text-sm font-semibold transition-colors"
    //       >
    //         Sign in
    //       </Link>
    //       <Link
    //         href="/register"
    //         className="relative group bg-gradient-to-r from-[#0ea5e9] to-[#6366f1] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 hover:scale-[1.02] transition-all"
    //       >
    //         Start Free Trial
    //         <span className="ml-1.5">→</span>
    //       </Link>
    //     </div>

    //     {/* Mobile Button */}
    //     <button
    //       onClick={() => setOpen(!open)}
    //       className="lg:hidden w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-slate-300 hover:bg-white/[0.08] transition"
    //     >
    //       {open ? <X size={18} /> : <Menu size={18} />}
    //     </button>
    //   </div>

    //   {/* Mobile Menu */}
    //   {open && (
    //     <div className="lg:hidden bg-[#0a0d18]/98 backdrop-blur-2xl border-t border-white/[0.06]">
    //       <div className="px-6 py-6 flex flex-col gap-2">
    //         {navLinks.map((link) => (
    //           <a
    //             key={link.href}
    //             href={link.href}
    //             className="text-slate-300 font-medium py-3 border-b border-white/[0.05] flex items-center justify-between"
    //             onClick={() => setOpen(false)}
    //           >
    //             {link.label}
    //             <ChevronRight size={14} className="text-slate-600" />
    //           </a>
    //         ))}
    //         <div className="flex flex-col gap-3 pt-5">
    //           <Link href="/login" className="border border-white/10 py-3 rounded-xl text-center text-sm font-semibold text-slate-300">Sign in</Link>
    //           <Link href="/register" className="bg-gradient-to-r from-[#0ea5e9] to-[#6366f1] py-3 rounded-xl text-center text-sm font-semibold text-white">Start Free Trial →</Link>
    //         </div>
    //       </div>
    //     </div>
    //   )}
    // </header>
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled
        ? "bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm"
        : "bg-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-[72px] flex items-center justify-between">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 group"
        >
          <div className="relative">
            <Image
              src="/logo.png"
              alt="SaaS Techify Logo"
              width={250}
              height={150}
              className="object-contain transition-transform duration-300 group-hover:scale-105"
              priority
            />
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-xl transition-all text-sm font-semibold ${scrolled
                ? "text-slate-700 hover:text-blue-600 hover:bg-slate-100"
                : "text-slate-200 hover:text-white hover:bg-white/10"
                }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/login"
            className={`px-4 py-2 text-sm font-semibold transition-colors ${scrolled
              ? "text-slate-700 hover:text-blue-600"
              : "text-slate-200 hover:text-white"
              }`}
          >
            Sign in
          </Link>

          <Link
            href="/register"
            className={`relative group px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${scrolled
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
              : "bg-white text-slate-900 hover:bg-slate-100"
              }`}
          >
            Start Free Trial
            <span className="ml-1.5">→</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpen(!open)}
          className={`lg:hidden w-10 h-10 rounded-xl border flex items-center justify-center transition ${scrolled
            ? "border-slate-200 text-slate-700 hover:bg-slate-100"
            : "border-white/10 text-slate-200 hover:bg-white/10"
            }`}
        >
          {open ? (
            <X size={18} />
          ) : (
            <Menu size={18} />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div
          className={`lg:hidden border-t backdrop-blur-2xl ${scrolled
            ? "bg-white border-slate-200"
            : "bg-[#0a0d18]/95 border-white/10"
            }`}
        >
          <div className="px-6 py-6 flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() =>
                  setOpen(false)
                }
                className={`font-medium py-3 flex items-center justify-between border-b transition ${scrolled
                  ? "text-slate-700 border-slate-100 hover:text-blue-600"
                  : "text-slate-200 border-white/5 hover:text-white"
                  }`}
              >
                {link.label}

                <ChevronRight
                  size={14}
                  className={
                    scrolled
                      ? "text-slate-400"
                      : "text-slate-600"
                  }
                />
              </a>
            ))}

            <div className="flex flex-col gap-3 pt-5">
              <Link
                href="/login"
                className={`py-3 rounded-xl text-center text-sm font-semibold border transition ${scrolled
                  ? "border-slate-200 text-slate-700 hover:bg-slate-100"
                  : "border-white/10 text-slate-200 hover:bg-white/10"
                  }`}
              >
                Sign in
              </Link>

              <Link
                href="/register"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 py-3 rounded-xl text-center text-sm font-semibold text-white shadow-lg shadow-blue-500/20"
              >
                Start Free Trial →
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-[calc(100vh-72px)] flex items-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#0ea5e9]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#6366f1]/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzYgMzRjMCAxLjEtLjkgMi0yIDJzLTItLjktMi0yIC45LTIgMi0yIDIgLjkgMiAyeiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvZz48L3N2Zz4=')] opacity-50" />
      </div>

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 mt-5 py-15 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2.5 border border-sky-500/20 bg-sky-500/5 text-sky-400 text-xs font-semibold px-4 py-2 rounded-full mb-8 backdrop-blur-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Enterprise After-Sales CRM Platform v3.0
            </div>

            <h1 className="text-5xl lg:text-[64px] font-black leading-[1.05] tracking-tight text-white">
              Automate{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400">
                Every Service
              </span>{" "}
              Operation
            </h1>

            <p className="text-slate-400 text-lg mt-7 leading-relaxed">
              AI-powered end-to-end after-sales platform for brands, service centers, technicians,
              and customers. From ticket creation to resolution — fully automated.
            </p>

            <div className="flex flex-wrap gap-4 mt-10">
              <button className="bg-gradient-to-r from-[#0ea5e9] to-[#6366f1] hover:scale-[1.02] text-white px-8 py-4 rounded-2xl font-semibold text-[15px] shadow-2xl shadow-sky-500/20 hover:shadow-sky-500/40 transition-all flex items-center gap-2.5">
                Start Free — 14 Days
                <ArrowRight size={17} />
              </button>
              <button className="border border-white/10 text-slate-300 hover:bg-white/[0.06] hover:text-white px-8 py-4 rounded-2xl font-semibold text-[15px] transition-all flex items-center gap-2.5">
                <Play size={16} className="text-sky-400" />
                Watch Demo
              </button>
            </div>

            {/* Trust row */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-10">
              {["No credit card", "Setup in 5 min", "SOC2 Certified", "99.9% Uptime"].map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-slate-400 text-sm">
                  <CheckCircle size={13} className="text-emerald-400" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Right — Dashboard preview */}
          <div className="relative hidden lg:block">
            {/* Glow */}
            <div className="absolute -inset-8 bg-gradient-to-r from-sky-500/10 to-indigo-500/10 rounded-[48px] blur-2xl" />

            {/* Main card */}
            <div className="relative bg-[#0d1117] border border-white/[0.08] rounded-[28px] overflow-hidden shadow-2xl">
              {/* Top bar */}
              <div className="bg-[#141921] border-b border-white/[0.06] px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                </div>
                <div className="flex items-center gap-2 bg-white/[0.05] border border-white/[0.06] rounded-lg px-3 py-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-slate-400 text-xs font-mono">dashboard.servicecrm.io</span>
                </div>
                <div className="w-16" />
              </div>

              <div className="p-6 space-y-4">
                {/* Stat row */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Active Tickets", value: "1,284", change: "+12%", color: "text-sky-400" },
                    { label: "SLA Compliance", value: "96.2%", change: "+3%", color: "text-emerald-400" },
                    { label: "Avg Resolution", value: "4.2h", change: "-18%", color: "text-violet-400" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-4">
                      <p className="text-slate-500 text-xs">{stat.label}</p>
                      <p className={`text-2xl font-black mt-1.5 ${stat.color}`}>{stat.value}</p>
                      <p className="text-emerald-400 text-xs mt-1 flex items-center gap-1">
                        <TrendingUp size={10} />
                        {stat.change}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Ticket list preview */}
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between">
                    <span className="text-slate-300 text-sm font-semibold">Recent Tickets</span>
                    <span className="text-sky-400 text-xs cursor-pointer">View all →</span>
                  </div>
                  {[
                    { id: "TKT-8821", issue: "Screen not working", status: "IN_PROGRESS", priority: "HIGH", time: "2m ago" },
                    { id: "TKT-8820", issue: "Battery drainage", status: "ASSIGNED", priority: "MEDIUM", time: "15m ago" },
                    { id: "TKT-8819", issue: "Charging port issue", status: "PENDING", priority: "LOW", time: "1h ago" },
                  ].map((ticket) => (
                    <div key={ticket.id} className="px-4 py-3 border-b border-white/[0.03] flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-sky-500/70 text-xs font-mono">{ticket.id}</span>
                        <span className="text-slate-300 text-sm">{ticket.issue}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ticket.status === "IN_PROGRESS" ? "bg-violet-500/15 text-violet-400" :
                          ticket.status === "ASSIGNED" ? "bg-sky-500/15 text-sky-400" :
                            "bg-amber-500/15 text-amber-400"
                          }`}>
                          {ticket.status.replace("_", " ")}
                        </span>
                        <span className="text-slate-600 text-xs">{ticket.time}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Activity bar */}
                <div className="flex items-end gap-1.5 h-16">
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm bg-gradient-to-t from-sky-600/40 to-sky-400/40 transition-all"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Floating badges */}
            {/* <div className="absolute -left-12 top-1/4">
              <FloatingBadge icon={<CheckCircle size={16} className="text-white" />} label="Resolved today" value="248 Tickets" color="bg-emerald-500/80" delay={0} />
            </div>
            <div className="absolute -right-10 top-1/2">
              <FloatingBadge icon={<Zap size={16} className="text-white" />} label="AI Auto-assigned" value="3 Tickets" color="bg-violet-500/80" delay={1} />
            </div>
            <div className="absolute -left-6 bottom-16">
              <FloatingBadge icon={<Star size={16} className="text-white" />} label="Avg Rating" value="4.9 / 5.0" color="bg-amber-500/80" delay={2} />
            </div> */}

            <div className="absolute left-0 top-[12%] -translate-x-1/2 z-20 hidden xl:block">
              <FloatingBadge
                icon={
                  <CheckCircle
                    size={16}
                    className="text-white"
                  />
                }
                label="Resolved Today"
                value="248 Tickets"
                color="bg-emerald-500/90"
                delay={0}
              />
            </div>

            <div className="absolute left-50 top-1/2 translate-x-1/2 -translate-y-1/2 z-20 hidden xl:block">
              <FloatingBadge
                icon={
                  <Zap
                    size={16}
                    className="text-white"
                  />
                }
                label="AI Auto Assigned"
                value="3 Tickets"
                color="bg-violet-500/90"
                delay={1}
              />
            </div>

            <div className="absolute left-0 bottom-[12%] -translate-x-1/2 z-20 hidden xl:block">
              <FloatingBadge
                icon={
                  <Star
                    size={16}
                    className="text-white"
                  />
                }
                label="Average Rating"
                value="4.9 / 5.0"
                color="bg-amber-500/90"
                delay={2}
              />
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 pt-16 border-t border-white/[0.06]">
          {[
            { label: "Tickets Managed", value: 50000, suffix: "+" },
            { label: "Active Service Centers", value: 2400, suffix: "+" },
            { label: "Brands Onboarded", value: 380, suffix: "+" },
            { label: "Customer Satisfaction", value: 98, suffix: "%" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-4xl lg:text-5xl font-black text-white tabular-nums">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-slate-500 text-sm mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Trusted By ───────────────────────────────────────────────────
function TrustedBy() {
  const brands = ["Samsung", "LG Electronics", "Whirlpool", "Bosch India", "Haier", "Godrej", "IFB", "Voltas"];
  return (
    <div className="border-y border-white/[0.05] py-10 overflow-hidden bg-white/[0.01]">
      <p className="text-center text-slate-600 text-xs font-semibold tracking-widest uppercase mb-8">Trusted by India's leading brands</p>
      <div className="flex gap-16 animate-[scroll_20s_linear_infinite] whitespace-nowrap">
        {[...brands, ...brands].map((brand, i) => (
          <span key={i} className="text-slate-600 font-bold text-sm hover:text-slate-400 transition-colors cursor-default">{brand}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Features Grid ────────────────────────────────────────────────
function Features() {
  const features = [
    {
      icon: <Cpu size={22} />,
      title: "AI-Powered Ticket Routing",
      desc: "Automatically classify, prioritize, and assign tickets to the right service center and technician using machine learning based on issue type, location, and availability.",
      color: "from-violet-500/20 to-indigo-500/20 border-violet-500/20 text-violet-400",
    },
    {
      icon: <MapPin size={22} />,
      title: "Live Technician Tracking",
      desc: "Real-time GPS tracking of technicians on the field. Customers see live location updates and ETA. Managers monitor efficiency with heatmaps and route analytics.",
      color: "from-sky-500/20 to-cyan-500/20 border-sky-500/20 text-sky-400",
    },
    {
      icon: <BarChart3 size={22} />,
      title: "Enterprise Analytics & BI",
      desc: "Advanced dashboards with SLA compliance, technician productivity, brand performance, revenue insights, complaint trends, and exportable reports.",
      color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/20 text-emerald-400",
    },
    {
      icon: <MessageSquare size={22} />,
      title: "Real-Time Communication",
      desc: "Socket.IO powered chat between customers, technicians, service centers, and admins. Ticket-threaded conversations with file sharing and read receipts.",
      color: "from-orange-500/20 to-amber-500/20 border-orange-500/20 text-orange-400",
    },
    {
      icon: <Shield size={22} />,
      title: "Warranty Management",
      desc: "Auto-calculate warranty status on ticket creation. Smart warranty rule engine per brand and product model. Expired warranty billing automation.",
      color: "from-pink-500/20 to-rose-500/20 border-pink-500/20 text-pink-400",
    },
    {
      icon: <Wallet size={22} />,
      title: "Wallet & Commission Engine",
      desc: "Automated commission splitting between service centers and technicians per ticket. Digital wallet with transaction history and instant payout requests.",
      color: "from-cyan-500/20 to-blue-500/20 border-cyan-500/20 text-cyan-400",
    },
    {
      icon: <Bell size={22} />,
      title: "Omnichannel Notifications",
      desc: "Email, SMS, WhatsApp, and in-app push notifications at every ticket lifecycle stage. Customizable notification templates per role and event type.",
      color: "from-amber-500/20 to-yellow-500/20 border-amber-500/20 text-amber-400",
    },
    {
      icon: <Globe size={22} />,
      title: "Multi-Tenant SaaS Architecture",
      desc: "Isolated data per brand tenant. Support for unlimited brands, each with their own service centers, technicians, customers, products, and configurations.",
      color: "from-teal-500/20 to-green-500/20 border-teal-500/20 text-teal-400",
    },
    {
      icon: <Upload size={22} />,
      title: "Media & Document Hub",
      desc: "Attach photos, videos, and documents to tickets. Secure AWS S3 storage with pre-signed URLs. Bulk import users and products via Excel templates.",
      color: "from-red-500/20 to-orange-500/20 border-red-500/20 text-red-400",
    },
  ];

  return (
    <section id="features" className="max-w-7xl mx-auto px-5 sm:px-8 py-28">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-widest mb-5 border border-sky-500/20 bg-sky-500/5 px-4 py-2 rounded-full">
          <Zap size={12} /> Powerful Features
        </div>
        <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight">
          Everything You Need to Run{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">World-Class Service</span>
        </h2>
        <p className="text-slate-400 mt-5 leading-relaxed">
          A complete after-sales ecosystem — not just a ticketing tool. Every module is production-ready and interconnected.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {features.map((feature, i) => (
          <div
            key={i}
            className={`relative group border bg-gradient-to-br ${feature.color} rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300 cursor-default`}
          >
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 border`}>
              {feature.icon}
            </div>
            <h3 className="text-white font-bold text-[17px] mb-3">{feature.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Customer Raises Request",
      desc: "Customer submits a service ticket with photos/videos, product details, and issue description. Warranty is auto-checked.",
      icon: <Ticket size={20} />,
    },
    {
      step: "02",
      title: "AI Routes to Service Center",
      desc: "AI engine matches the ticket to the nearest approved service center based on capability, location, and load.",
      icon: <Cpu size={20} />,
    },
    {
      step: "03",
      title: "Technician Gets Assigned",
      desc: "Service center assigns the best-fit technician. Technician gets notified instantly with job details and navigation.",
      icon: <UserCheck size={20} />,
    },
    {
      step: "04",
      title: "Real-Time Job Execution",
      desc: "Technician updates status live: Start → In Progress → Parts Ordered → Completed. Customer sees every step.",
      icon: <Clock size={20} />,
    },
    {
      step: "05",
      title: "Customer Rates & Closes",
      desc: "Post-service, customer rates quality, timeliness, and communication. Commission auto-splits to wallet.",
      icon: <Star size={20} />,
    },
  ];

  return (
    <section id="how-it-works" className="max-w-7xl mx-auto px-5 sm:px-8 py-28">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 text-violet-400 text-xs font-bold uppercase tracking-widest mb-5 border border-violet-500/20 bg-violet-500/5 px-4 py-2 rounded-full">
          <Settings size={12} /> How It Works
        </div>
        <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight">
          From Request to{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">Resolution</span>
          {" "}in Minutes
        </h2>
      </div>

      <div className="relative">
        {/* Connector line */}
        <div className="hidden lg:block absolute top-11 left-[60px] right-[60px] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="relative flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="relative z-10 w-[88px] h-[88px] rounded-2xl bg-[#0d1117] border border-white/[0.08] flex flex-col items-center justify-center mb-5 shadow-xl group hover:border-sky-500/30 transition-all">
                <span className="text-sky-400/50 text-[10px] font-black tracking-wider mb-0.5">{step.step}</span>
                <div className="text-sky-400">{step.icon}</div>
              </div>
              <h4 className="text-white font-bold text-[15px] mb-2">{step.title}</h4>
              <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Modules ──────────────────────────────────────────────────────
function Modules() {
  const [active, setActive] = useState(0);

  const modules = [
    {
      icon: <Ticket size={18} />,
      title: "Ticket Management",
      highlights: ["Full lifecycle: PENDING → CLOSED", "SLA tracking & breach alerts", "Multi-priority queue", "Bulk operations", "Ticket cloning & templates"],
      preview: (
        <div className="space-y-3">
          {[
            { id: "TKT-9012", title: "Display issue – Samsung TV", priority: "CRITICAL", sla: "2h left", status: "IN_PROGRESS" },
            { id: "TKT-9011", title: "Compressor noise – Whirlpool", priority: "HIGH", sla: "5h left", status: "ASSIGNED" },
            { id: "TKT-9010", title: "Remote unresponsive – LG", priority: "MEDIUM", sla: "12h left", status: "PENDING" },
            { id: "TKT-9009", title: "Water leakage – Bosch WM", priority: "HIGH", sla: "Done", status: "COMPLETED" },
          ].map((t) => (
            <div key={t.id} className="flex items-center justify-between bg-white/[0.03] border border-white/[0.05] rounded-xl px-4 py-3">
              <div>
                <span className="text-sky-400/60 text-[11px] font-mono block">{t.id}</span>
                <span className="text-slate-200 text-sm font-medium">{t.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.priority === "CRITICAL" ? "bg-red-500/15 text-red-400" :
                  t.priority === "HIGH" ? "bg-orange-500/15 text-orange-400" :
                    "bg-amber-500/15 text-amber-400"
                  }`}>{t.priority}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.status === "IN_PROGRESS" ? "bg-violet-500/15 text-violet-400" :
                  t.status === "COMPLETED" ? "bg-emerald-500/15 text-emerald-400" :
                    t.status === "ASSIGNED" ? "bg-sky-500/15 text-sky-400" :
                      "bg-amber-500/15 text-amber-400"
                  }`}>{t.status.replace("_", " ")}</span>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      icon: <Building2 size={18} />,
      title: "Service Centers",
      highlights: ["Approval & onboarding workflow", "Capability & coverage mapping", "Performance scorecards", "Geo-based auto-assignment", "Multi-branch management"],
      preview: (
        <div className="space-y-3">
          {[
            { name: "TechFix Lucknow", area: "Gomtinagar, LKO", rating: 4.8, tickets: 142, status: "APPROVED" },
            { name: "QuickServ Delhi", area: "Connaught Place, DL", rating: 4.6, tickets: 98, status: "APPROVED" },
            { name: "RepairPro Mumbai", area: "Andheri West, MH", rating: 4.9, tickets: 217, status: "APPROVED" },
          ].map((sc) => (
            <div key={sc.name} className="bg-white/[0.03] border border-white/[0.05] rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-slate-200 text-sm font-semibold">{sc.name}</p>
                <p className="text-slate-500 text-xs flex items-center gap-1 mt-0.5"><MapPin size={10} />{sc.area}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-amber-400 text-sm font-bold flex items-center gap-1"><Star size={10} />{sc.rating}</p>
                  <p className="text-slate-500 text-xs">{sc.tickets} tickets</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">{sc.status}</span>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      icon: <Users size={18} />,
      title: "User Management",
      highlights: ["5 role-based access levels", "Bulk import via Excel", "Status control & audit log", "Profile & permission mgmt", "RBAC middleware"],
      preview: (
        <div className="space-y-3">
          {[
            { name: "Rahul Verma", role: "TECHNICIAN", email: "rahul@fix.com", status: "Active", tickets: 34 },
            { name: "Priya Sharma", role: "SERVICE_CENTER", email: "priya@sc.com", status: "Active", tickets: 128 },
            { name: "Amit Singh", role: "CUSTOMER", email: "amit@gmail.com", status: "Active", tickets: 6 },
            { name: "Neha Gupta", role: "BRAND", email: "neha@samsung.in", status: "Inactive", tickets: 0 },
          ].map((u) => (
            <div key={u.name} className="bg-white/[0.03] border border-white/[0.05] rounded-xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border border-white/[0.08] flex items-center justify-center text-sky-400 text-xs font-bold">{u.name[0]}</div>
                <div>
                  <p className="text-slate-200 text-sm font-medium">{u.name}</p>
                  <p className="text-slate-600 text-[11px]">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">{u.role.replace("_", " ")}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.status === "Active" ? "bg-emerald-500/15 text-emerald-400" : "bg-slate-500/15 text-slate-500"}`}>{u.status}</span>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      icon: <BarChart3 size={18} />,
      title: "Analytics & Reports",
      highlights: ["SLA compliance tracking", "Brand performance KPIs", "Technician productivity", "Revenue insights", "Custom date/location filters"],
      preview: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Tickets This Month", value: "3,841", trend: "+14%" },
              { label: "Revenue", value: "₹8.4L", trend: "+22%" },
              { label: "Avg Resolution", value: "4.2h", trend: "-18%" },
              { label: "SLA Compliance", value: "96.4%", trend: "+3%" },
            ].map((s) => (
              <div key={s.label} className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-3">
                <p className="text-slate-500 text-[11px]">{s.label}</p>
                <p className="text-white text-xl font-black mt-1">{s.value}</p>
                <p className="text-emerald-400 text-xs flex items-center gap-1 mt-0.5"><TrendingUp size={9} />{s.trend}</p>
              </div>
            ))}
          </div>
          <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-3">
            <p className="text-slate-500 text-xs mb-3">Weekly Ticket Trend</p>
            <div className="flex items-end gap-2 h-14">
              {[55, 72, 48, 88, 65, 92, 78].map((h, i) => (
                <div key={i} className="flex-1 rounded-sm bg-gradient-to-t from-sky-600/50 to-sky-400/30" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      icon: <Award size={18} />,
      title: "Feedback & Rating",
      highlights: ["5-point category ratings", "Post-service auto-trigger", "Brand feedback analytics", "Technician leaderboard", "Review moderation"],
      preview: (
        <div className="space-y-3">
          {[
            { customer: "Amit K.", rating: 5, comment: "Technician was on time and fixed the issue perfectly!", tech: "Ravi Technician" },
            { customer: "Sneha M.", rating: 4, comment: "Good service but slight delay in arrival.", tech: "Rohan Verma" },
            { customer: "Deepak S.", rating: 5, comment: "Excellent communication throughout. Highly recommend.", tech: "Priya Singh" },
          ].map((f, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/[0.05] rounded-xl px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300 text-sm font-medium">{f.customer}</span>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={11} className={j < f.rating ? "text-amber-400 fill-amber-400" : "text-slate-700"} />
                  ))}
                </div>
              </div>
              <p className="text-slate-500 text-xs italic">"{f.comment}"</p>
              <p className="text-sky-400/60 text-[10px] mt-1.5">via {f.tech}</p>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <section id="modules" className="bg-[#080b12] border-y border-white/[0.05] py-28">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-5 border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 rounded-full">
            <Cpu size={12} /> Core Modules
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight">
            Complete CRM Ecosystem,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Zero Gaps</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-[300px_1fr] gap-8">
          {/* Tab list */}
          <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
            {modules.map((mod, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-left whitespace-nowrap lg:whitespace-normal transition-all shrink-0 lg:shrink ${active === i
                  ? "bg-white/[0.07] border border-white/[0.1] text-white"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]"
                  }`}
              >
                <span className={active === i ? "text-sky-400" : "text-slate-600"}>{mod.icon}</span>
                <span className="font-semibold text-sm">{mod.title}</span>
                {active === i && <ChevronRight size={14} className="ml-auto text-sky-400 hidden lg:block" />}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-white font-black text-2xl mb-5">{modules[active].title}</h3>
                <ul className="space-y-3">
                  {modules[active].highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-400 text-sm">
                      <CheckCircle size={15} className="text-emerald-400 mt-0.5 shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-slate-600 text-xs uppercase tracking-widest mb-4 font-semibold">Live Preview</p>
                {modules[active].preview}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Roles ────────────────────────────────────────────────────────
function Roles() {
  const roles = [
    {
      title: "Super Admin",
      color: "from-red-500/10 to-orange-500/10 border-red-500/15 text-red-400",
      icon: <Shield size={20} />,
      perms: ["Full platform control", "Manage all brands & SCs", "System configuration", "Analytics & audit logs", "Role & permission management"],
    },
    {
      title: "Brand Manager",
      color: "from-violet-500/10 to-purple-500/10 border-violet-500/15 text-violet-400",
      icon: <Award size={20} />,
      perms: ["Brand dashboard", "Product & model management", "Warranty configuration", "Assign service centers", "Brand-level analytics"],
    },
    {
      title: "Service Center",
      color: "from-sky-500/10 to-blue-500/10 border-sky-500/15 text-sky-400",
      icon: <Building2 size={20} />,
      perms: ["Incoming ticket management", "Technician assignment", "Inventory & parts tracking", "Commission & wallet view", "SLA monitoring"],
    },
    {
      title: "Technician",
      color: "from-cyan-500/10 to-teal-500/10 border-cyan-500/15 text-cyan-400",
      icon: <Wrench size={20} />,
      perms: ["Assigned job list", "Start / Pause / Complete", "Upload job photos", "Chat with customer", "Daily task summary"],
    },
    {
      title: "Customer",
      color: "from-emerald-500/10 to-green-500/10 border-emerald-500/15 text-emerald-400",
      icon: <Users size={20} />,
      perms: ["Raise service request", "Track ticket live", "Chat with technician", "Rate & review service", "Service history"],
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 py-28">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 text-pink-400 text-xs font-bold uppercase tracking-widest mb-5 border border-pink-500/20 bg-pink-500/5 px-4 py-2 rounded-full">
          <Users size={12} /> Role-Based Access
        </div>
        <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight">
          5 Roles,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400">One Unified Platform</span>
        </h2>
        <p className="text-slate-400 mt-5">Every stakeholder gets a tailored experience with exactly the right permissions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
        {roles.map((role, i) => (
          <div key={i} className={`bg-gradient-to-br ${role.color} border rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300`}>
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${role.color} border flex items-center justify-center mb-4`}>
              {role.icon}
            </div>
            <h4 className="text-white font-bold text-[16px] mb-4">{role.title}</h4>
            <ul className="space-y-2">
              {role.perms.map((p, j) => (
                <li key={j} className="text-slate-400 text-xs flex items-start gap-2">
                  <CheckCircle size={11} className="text-emerald-400 mt-0.5 shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Pricing ─────────────────────────────────────────────────────
function Pricing() {
  const [annual, setAnnual] = useState(false);

  const plans = [
    {
      name: "Starter",
      monthly: 4999,
      annual: 3999,
      users: "20",
      storage: "10GB",
      scs: "3 Service Centers",
      highlight: false,
      features: ["Ticket Management", "Email Notifications", "Basic Analytics", "Customer Portal", "Email Support"],
    },
    {
      name: "Professional",
      monthly: 14999,
      annual: 11999,
      users: "100",
      storage: "100GB",
      scs: "25 Service Centers",
      highlight: true,
      features: ["Everything in Starter", "AI Auto-Assignment", "Live Tracking", "Wallet & Commission", "WhatsApp Alerts", "Priority Support"],
    },
    {
      name: "Enterprise",
      monthly: null,
      annual: null,
      users: "Unlimited",
      storage: "Unlimited",
      scs: "Unlimited SCs",
      highlight: false,
      features: ["Everything in Pro", "IoT Integration", "Custom AI Models", "Multi-Tenant Setup", "SLA Customization", "Dedicated CSM"],
    },
  ];

  return (
    <section id="pricing" className="bg-[#080b12] border-y border-white/[0.05] py-28">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest mb-5 border border-amber-500/20 bg-amber-500/5 px-4 py-2 rounded-full">
            <Wallet size={12} /> Transparent Pricing
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight">
            Plans That Scale{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">With Your Business</span>
          </h2>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={`text-sm font-medium ${!annual ? "text-white" : "text-slate-500"}`}>Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative w-12 h-6 rounded-full transition-colors ${annual ? "bg-sky-500" : "bg-white/10"}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${annual ? "translate-x-7" : "translate-x-1"}`} />
            </button>
            <span className={`text-sm font-medium ${annual ? "text-white" : "text-slate-500"}`}>
              Annual
              <span className="ml-2 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">Save 20%</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-2xl p-8 border transition-all hover:-translate-y-1 ${plan.highlight
                ? "bg-gradient-to-b from-sky-500/10 to-indigo-500/10 border-sky-500/30 shadow-2xl shadow-sky-500/10"
                : "bg-[#0d1117] border-white/[0.07]"
                }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-sky-500 to-indigo-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                  Most Popular
                </div>
              )}

              <h3 className="text-white font-black text-2xl">{plan.name}</h3>
              <div className="mt-5 mb-6">
                {plan.monthly ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-white">
                      ₹{(annual ? plan.annual! : plan.monthly!).toLocaleString("en-IN")}
                    </span>
                    <span className="text-slate-500 text-sm">/month</span>
                  </div>
                ) : (
                  <span className="text-5xl font-black text-white">Custom</span>
                )}
              </div>

              <div className="space-y-2 mb-8 pb-8 border-b border-white/[0.07]">
                {[plan.users + " Users", plan.storage + " Storage", plan.scs].map((meta) => (
                  <p key={meta} className="text-slate-400 text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400/50" />
                    {meta}
                  </p>
                ))}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="text-slate-300 text-sm flex items-center gap-2.5">
                    <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${plan.highlight
                  ? "bg-gradient-to-r from-sky-500 to-indigo-500 text-white hover:shadow-lg hover:shadow-sky-500/30 hover:scale-[1.02]"
                  : "border border-white/10 text-slate-300 hover:bg-white/[0.07] hover:text-white"
                  }`}
              >
                {plan.monthly ? "Start Free Trial" : "Contact Sales"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ────────────────────────────────────────────────
function Testimonials() {
  const testimonials = [
    {
      name: "Vikram Mehta",
      title: "Head of After-Sales, Samsung India",
      text: "ServiceCRM transformed our after-sales operation. Ticket resolution time dropped by 40% in the first month. The AI auto-assignment alone saved us 3 FTEs.",
      rating: 5,
    },
    {
      name: "Ananya Desai",
      title: "Operations Director, QuickFix Centers",
      text: "Managing 200+ technicians across 15 cities used to be chaos. Now everything is tracked in one place. The wallet & commission module is a game changer.",
      rating: 5,
    },
    {
      name: "Rajesh Kumar",
      title: "CEO, TechCare Network",
      text: "We evaluated 6 CRM platforms. SaaS Techify was the only one with true multi-tenant architecture and real-time tracking out of the box. Worth every rupee.",
      rating: 5,
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 py-28">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-black text-white">Loved by Service Leaders</h2>
        <p className="text-slate-500 mt-3">Real results from real customers across India</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <div key={i} className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-7 hover:-translate-y-1 transition-all">
            <div className="flex items-center gap-0.5 mb-5">
              {Array.from({ length: t.rating }).map((_, j) => (
                <Star key={j} size={13} className="text-amber-400 fill-amber-400" />
              ))}
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">"{t.text}"</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border border-white/[0.08] flex items-center justify-center text-sky-400 font-bold text-sm">
                {t.name[0]}
              </div>
              <div>
                <p className="text-white text-sm font-bold">{t.name}</p>
                <p className="text-slate-600 text-xs">{t.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────
function CTA() {
  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20 pb-32">
      <div className="relative rounded-[32px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0ea5e9]/20 via-[#6366f1]/20 to-[#ec4899]/10" />
        <div className="absolute inset-0 border border-white/[0.08] rounded-[32px]" />
        <div className="absolute top-0 left-1/3 w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-[80px]" />
        <div className="relative px-10 py-20 text-center">
          <p className="text-sky-400 text-xs font-bold uppercase tracking-widest mb-5">Get Started Today</p>
          <h2 className="text-4xl lg:text-6xl font-black text-white leading-tight max-w-3xl mx-auto">
            Ready to Transform Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">After-Sales Business?</span>
          </h2>
          <p className="text-slate-400 mt-6 text-lg max-w-2xl mx-auto leading-relaxed">
            Join 380+ brands already using SaaS Techify. Start your 14-day free trial — no credit card, full platform access.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <button className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white px-10 py-4 rounded-2xl font-bold text-[15px] shadow-2xl shadow-sky-500/20 hover:shadow-sky-500/40 hover:scale-[1.02] transition-all flex items-center gap-2.5">
              Start Free Trial — 14 Days
              <ArrowRight size={17} />
            </button>
            <button className="border border-white/10 text-slate-300 hover:bg-white/[0.07] hover:text-white px-10 py-4 rounded-2xl font-bold text-[15px] transition-all">
              Book a Live Demo
            </button>
          </div>
          <p className="text-slate-600 text-sm mt-6">No credit card required · Setup in 5 minutes · Cancel anytime</p>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-white/[0.05] bg-[#050810]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-16">
        <div className="grid grid-cols-2 justify-items-center md:grid-cols-4 xl:grid-cols-5 gap-10">
          {/* Brand col */}
          {/* <div className="col-span-2 md:col-span-4 xl:col-span-2"> */}
          <div className="col-span-2 md:col-span-4 xl:col-span-2 ">
            {/* <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center shadow-lg">
                <Wrench size={18} className="text-white" />
              </div>
              <div>
                <p className="text-white font-black text-[17px] leading-none">SaaS Techify</p>
                <p className="text-slate-600 text-[10px] tracking-widest uppercase leading-none mt-0.5">After-Sales CRM</p>
              </div>
            </div> */}
            <Link
              href="/"
              className="flex items-center gap-3 group"
            >
              <div className="relative">
                <Image
                  src="/logo.png"
                  alt="SaaS Techify Logo"
                  width={400}
                  height={150}
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                  priority
                />
              </div>
            </Link>

          </div>
         
          {/* Links */}
          {[
            { title: "Product", links: ["Ticket Management", "AI Automation", "Live Tracking", "Analytics", "Wallet System"] },
            { title: "Company", links: ["About Us", "Pricing", "Careers", "Blog", "Contact"] },
            { title: "Support", links: ["Documentation", "API Reference", "Status Page", "Help Center", "support@crm.com"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-white font-bold text-sm mb-5">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <span className="text-slate-500 hover:text-slate-300 text-sm cursor-pointer transition-colors">{link}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
         <div className="border-t border-white/[0.04]   pt-8 pb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm leading-relaxed  ">
              Enterprise-grade after-sales CRM platform with AI automation, real-time infrastructure, and advanced analytics.
            </p>
            </div>
            <div className="flex items-center gap-3  ">
              {["privacy", "terms", "security"].map((l) => (
                <span key={l} className="text-slate-600 hover:text-slate-400 text-xs capitalize cursor-pointer transition-colors">{l}</span>
              ))}
            </div>
          </div>
        <div className="border-t border-white/[0.04]  pt-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <p className="text-slate-600 text-sm">© 2026 SaaS Techify. All rights reserved. Made in Lucknow 🇮🇳</p>
          <p className="text-slate-700 text-xs">Next.js · TypeScript · MongoDB · AWS · Socket.IO</p>
        </div>
      </div>
    </footer>
  );
}

// ─── Root ─────────────────────────────────────────────────────────
export default function CRMLandingPage() {
  return (
    <div className="min-h-screen bg-[#030712] text-white overflow-hidden">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      <Header />
      <Hero />
      <TrustedBy />
      <Features />
      <HowItWorks />
      <Modules />
      <Roles />
      <Pricing />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}