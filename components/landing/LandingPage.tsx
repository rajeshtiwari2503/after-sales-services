// "use client";

// import Link from "next/link";
// import { useState, useEffect, useRef } from "react";
// import {
//   Menu, X, Wrench, Zap, BarChart3, Shield, Globe, ArrowRight,
//   CheckCircle, Star, Users, Clock, TrendingUp, ChevronRight,
//   Ticket, Building2, UserCheck, Cpu, Bell, Wallet,
//   MessageSquare, Upload, Settings, MapPin, Award, Play,
//   ChevronDown,
// } from "lucide-react";
// import Image from "next/image";

// // ─── Animated Counter ────────────────────────────────────────────
// function AnimatedCounter({ end, suffix = "", duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
//   const [count, setCount] = useState(0);
//   const ref = useRef<HTMLSpanElement>(null);
//   const started = useRef(false);

//   useEffect(() => {
//     const observer = new IntersectionObserver(([entry]) => {
//       if (entry.isIntersecting && !started.current) {
//         started.current = true;
//         const startTime = performance.now();
//         const animate = (now: number) => {
//           const elapsed = now - startTime;
//           const progress = Math.min(elapsed / duration, 1);
//           const eased = 1 - Math.pow(1 - progress, 3);
//           setCount(Math.floor(eased * end));
//           if (progress < 1) requestAnimationFrame(animate);
//           else setCount(end);
//         };
//         requestAnimationFrame(animate);
//       }
//     }, { threshold: 0.5 });
//     if (ref.current) observer.observe(ref.current);
//     return () => observer.disconnect();
//   }, [end, duration]);

//   return <span ref={ref}>{count.toLocaleString("en-IN")}{suffix}</span>;
// }

// // ─── Floating Badge ───────────────────────────────────────────────
// function FloatingBadge({ icon, label, value, color, delay }: {
//   icon: React.ReactNode; label: string; value: string; color: string; delay: number;
// }) {
//   return (
//     <div
//       className="absolute bg-white/[0.08] backdrop-blur-xl border border-white/[0.12] rounded-2xl px-4 py-3 flex items-center gap-3 shadow-2xl"
//       style={{ animation: `float ${3 + delay * 0.5}s ease-in-out infinite`, animationDelay: `${delay * 0.3}s` }}
//     >
//       <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
//         {icon}
//       </div>
//       <div>
//         <p className="text-white font-bold text-sm leading-none">{value}</p>
//         <p className="text-slate-400 text-xs mt-0.5">{label}</p>
//       </div>
//     </div>
//   );
// }

// // ─── Header ───────────────────────────────────────────────────────
// function Header() {
//   const [open, setOpen] = useState(false);
//   const [scrolled, setScrolled] = useState(false);

//   useEffect(() => {
//     const onScroll = () => setScrolled(window.scrollY > 20);
//     window.addEventListener("scroll", onScroll);
//     return () => window.removeEventListener("scroll", onScroll);
//   }, []);

//   const navLinks = [
//     { href: "#features", label: "Features" },
//     { href: "#modules", label: "Modules" },
//     { href: "#how-it-works", label: "How It Works" },
//     { href: "#pricing", label: "Pricing" },
//   ];

//   return (
//     // <header
//     //   className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
//     //     ? "bg-[#030712]/95 backdrop-blur-2xl border-b border-white/[0.06] shadow-[0_1px_40px_rgba(0,0,0,0.4)]"
//     //     : "bg-transparent"
//     //     }`}
//     // >
//     //   <div className="max-w-7xl mx-auto px-5 sm:px-8 h-[72px] flex items-center justify-between">
//     //     {/* Logo */}
//     //     <Link
//     //       href="/"
//     //       className="flex items-center gap-3 group"
//     //     >
//     //       <div className="relative">
//     //         <Image
//     //           src="/logo1.png"
//     //           alt="SaaS Techify Logo"
//     //           width={150}
//     //           height={150}
//     //           className="object-contain transition-transform duration-300 group-hover:scale-105"
//     //           priority
//     //         />
//     //       </div>
//     //     </Link>

//     //     {/* Desktop Nav */}
//     //     <nav className="hidden lg:flex items-center gap-1">
//     //       {navLinks.map((link) => (
//     //         <a
//     //           key={link.href}
//     //           href={link.href}
//     //           className="text-slate-400 hover:text-white px-4 py-2 rounded-lg hover:bg-white/[0.06] transition-all text-sm font-medium"
//     //         >
//     //           {link.label}
//     //         </a>
//     //       ))}
//     //     </nav>

//     //     {/* Desktop CTA */}
//     //     <div className="hidden lg:flex items-center gap-3">
//     //       <Link
//     //         href="/login"
//     //         className="text-slate-300 hover:text-white px-4 py-2 text-sm font-semibold transition-colors"
//     //       >
//     //         Sign in
//     //       </Link>
//     //       <Link
//     //         href="/register"
//     //         className="relative group bg-gradient-to-r from-[#0ea5e9] to-[#6366f1] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 hover:scale-[1.02] transition-all"
//     //       >
//     //         Start Free Trial
//     //         <span className="ml-1.5">→</span>
//     //       </Link>
//     //     </div>

//     //     {/* Mobile Button */}
//     //     <button
//     //       onClick={() => setOpen(!open)}
//     //       className="lg:hidden w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-slate-300 hover:bg-white/[0.08] transition"
//     //     >
//     //       {open ? <X size={18} /> : <Menu size={18} />}
//     //     </button>
//     //   </div>

//     //   {/* Mobile Menu */}
//     //   {open && (
//     //     <div className="lg:hidden bg-[#0a0d18]/98 backdrop-blur-2xl border-t border-white/[0.06]">
//     //       <div className="px-6 py-6 flex flex-col gap-2">
//     //         {navLinks.map((link) => (
//     //           <a
//     //             key={link.href}
//     //             href={link.href}
//     //             className="text-slate-300 font-medium py-3 border-b border-white/[0.05] flex items-center justify-between"
//     //             onClick={() => setOpen(false)}
//     //           >
//     //             {link.label}
//     //             <ChevronRight size={14} className="text-slate-600" />
//     //           </a>
//     //         ))}
//     //         <div className="flex flex-col gap-3 pt-5">
//     //           <Link href="/login" className="border border-white/10 py-3 rounded-xl text-center text-sm font-semibold text-slate-300">Sign in</Link>
//     //           <Link href="/register" className="bg-gradient-to-r from-[#0ea5e9] to-[#6366f1] py-3 rounded-xl text-center text-sm font-semibold text-white">Start Free Trial →</Link>
//     //         </div>
//     //       </div>
//     //     </div>
//     //   )}
//     // </header>
//     <header
//       className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled
//         ? "bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm"
//         : "bg-transparent"
//         }`}
//     >
//       <div className="max-w-7xl mx-auto px-5 sm:px-8 h-[72px] flex items-center justify-between">

//         {/* Logo */}
//         <Link
//           href="/"
//           className="flex items-center gap-3 group"
//         >
//           <div className="relative">
//             <Image
//               src="/logo.png"
//               alt="SaaS Techify Logo"
//               width={250}
//               height={150}
//               className="object-contain transition-transform duration-300 group-hover:scale-105"
//               priority
//             />
//           </div>
//         </Link>

//         {/* Desktop Nav */}
//         <nav className="hidden lg:flex items-center gap-1">
//           {navLinks.map((link) => (
//             <a
//               key={link.href}
//               href={link.href}
//               className={`px-4 py-2 rounded-xl transition-all text-sm font-semibold ${scrolled
//                 ? "text-slate-700 hover:text-blue-600 hover:bg-slate-100"
//                 : "text-slate-200 hover:text-white hover:bg-white/10"
//                 }`}
//             >
//               {link.label}
//             </a>
//           ))}
//         </nav>

//         {/* Desktop CTA */}
//         <div className="hidden lg:flex items-center gap-3">
//           <Link
//             href="/login"
//             className={`px-4 py-2 text-sm font-semibold transition-colors ${scrolled
//               ? "text-slate-700 hover:text-blue-600"
//               : "text-slate-200 hover:text-white"
//               }`}
//           >
//             Sign in
//           </Link>

//           <Link
//             href="/register"
//             className={`relative group px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${scrolled
//               ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
//               : "bg-white text-slate-900 hover:bg-slate-100"
//               }`}
//           >
//             Start Free Trial
//             <span className="ml-1.5">→</span>
//           </Link>
//         </div>

//         {/* Mobile Menu Button */}
//         <button
//           onClick={() => setOpen(!open)}
//           className={`lg:hidden w-10 h-10 rounded-xl border flex items-center justify-center transition ${scrolled
//             ? "border-slate-200 text-slate-700 hover:bg-slate-100"
//             : "border-white/10 text-slate-200 hover:bg-white/10"
//             }`}
//         >
//           {open ? (
//             <X size={18} />
//           ) : (
//             <Menu size={18} />
//           )}
//         </button>
//       </div>

//       {/* Mobile Menu */}
//       {open && (
//         <div
//           className={`lg:hidden border-t backdrop-blur-2xl ${scrolled
//             ? "bg-white border-slate-200"
//             : "bg-[#0a0d18]/95 border-white/10"
//             }`}
//         >
//           <div className="px-6 py-6 flex flex-col gap-2">
//             {navLinks.map((link) => (
//               <a
//                 key={link.href}
//                 href={link.href}
//                 onClick={() =>
//                   setOpen(false)
//                 }
//                 className={`font-medium py-3 flex items-center justify-between border-b transition ${scrolled
//                   ? "text-slate-700 border-slate-100 hover:text-blue-600"
//                   : "text-slate-200 border-white/5 hover:text-white"
//                   }`}
//               >
//                 {link.label}

//                 <ChevronRight
//                   size={14}
//                   className={
//                     scrolled
//                       ? "text-slate-400"
//                       : "text-slate-600"
//                   }
//                 />
//               </a>
//             ))}

//             <div className="flex flex-col gap-3 pt-5">
//               <Link
//                 href="/login"
//                 className={`py-3 rounded-xl text-center text-sm font-semibold border transition ${scrolled
//                   ? "border-slate-200 text-slate-700 hover:bg-slate-100"
//                   : "border-white/10 text-slate-200 hover:bg-white/10"
//                   }`}
//               >
//                 Sign in
//               </Link>

//               <Link
//                 href="/register"
//                 className="bg-gradient-to-r from-blue-600 to-indigo-600 py-3 rounded-xl text-center text-sm font-semibold text-white shadow-lg shadow-blue-500/20"
//               >
//                 Start Free Trial →
//               </Link>
//             </div>
//           </div>
//         </div>
//       )}
//     </header>
//   );
// }

// // ─── Hero ─────────────────────────────────────────────────────────
// function Hero() {
//   return (
//     <section className="relative min-h-[calc(100vh-72px)] flex items-center overflow-hidden">
//       {/* Background layers */}
//       <div className="absolute inset-0">
//         <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#0ea5e9]/10 rounded-full blur-[120px]" />
//         <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#6366f1]/10 rounded-full blur-[120px]" />
//         <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzYgMzRjMCAxLjEtLjkgMi0yIDJzLTItLjktMi0yIC45LTIgMi0yIDIgLjkgMiAyeiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvZz48L3N2Zz4=')] opacity-50" />
//       </div>

//       <div className="relative max-w-7xl mx-auto px-5 sm:px-8 mt-5 py-15 w-full">
//         <div className="grid lg:grid-cols-2 gap-16 items-center">
//           {/* Left */}
//           <div className="max-w-xl">
//             <div className="inline-flex items-center gap-2.5 border border-sky-500/20 bg-sky-500/5 text-sky-400 text-xs font-semibold px-4 py-2 rounded-full mb-8 backdrop-blur-xl">
//               <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
//               Enterprise After-Sales CRM Platform v3.0
//             </div>

//             <h1 className="text-5xl lg:text-[64px] font-black leading-[1.05] tracking-tight text-white">
//               Automate{" "}
//               <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400">
//                 Every Service
//               </span>{" "}
//               Operation
//             </h1>

//             <p className="text-slate-400 text-lg mt-7 leading-relaxed">
//               AI-powered end-to-end after-sales platform for brands, service centers, technicians,
//               and customers. From ticket creation to resolution — fully automated.
//             </p>

//             <div className="flex flex-wrap gap-4 mt-10">
//               <button className="bg-gradient-to-r from-[#0ea5e9] to-[#6366f1] hover:scale-[1.02] text-white px-8 py-4 rounded-2xl font-semibold text-[15px] shadow-2xl shadow-sky-500/20 hover:shadow-sky-500/40 transition-all flex items-center gap-2.5">
//                 Start Free — 14 Days
//                 <ArrowRight size={17} />
//               </button>
//               <button className="border border-white/10 text-slate-300 hover:bg-white/[0.06] hover:text-white px-8 py-4 rounded-2xl font-semibold text-[15px] transition-all flex items-center gap-2.5">
//                 <Play size={16} className="text-sky-400" />
//                 Watch Demo
//               </button>
//             </div>

//             {/* Trust row */}
//             <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-10">
//               {["No credit card", "Setup in 5 min", "SOC2 Certified", "99.9% Uptime"].map((item) => (
//                 <div key={item} className="flex items-center gap-1.5 text-slate-400 text-sm">
//                   <CheckCircle size={13} className="text-emerald-400" />
//                   {item}
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Right — Dashboard preview */}
//           <div className="relative hidden lg:block">
//             {/* Glow */}
//             <div className="absolute -inset-8 bg-gradient-to-r from-sky-500/10 to-indigo-500/10 rounded-[48px] blur-2xl" />

//             {/* Main card */}
//             <div className="relative bg-[#0d1117] border border-white/[0.08] rounded-[28px] overflow-hidden shadow-2xl">
//               {/* Top bar */}
//               <div className="bg-[#141921] border-b border-white/[0.06] px-6 py-4 flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <div className="w-3 h-3 rounded-full bg-red-500/60" />
//                   <div className="w-3 h-3 rounded-full bg-amber-500/60" />
//                   <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
//                 </div>
//                 <div className="flex items-center gap-2 bg-white/[0.05] border border-white/[0.06] rounded-lg px-3 py-1.5">
//                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
//                   <span className="text-slate-400 text-xs font-mono">dashboard.servicecrm.io</span>
//                 </div>
//                 <div className="w-16" />
//               </div>

//               <div className="p-6 space-y-4">
//                 {/* Stat row */}
//                 <div className="grid grid-cols-3 gap-4">
//                   {[
//                     { label: "Active Tickets", value: "1,284", change: "+12%", color: "text-sky-400" },
//                     { label: "SLA Compliance", value: "96.2%", change: "+3%", color: "text-emerald-400" },
//                     { label: "Avg Resolution", value: "4.2h", change: "-18%", color: "text-violet-400" },
//                   ].map((stat) => (
//                     <div key={stat.label} className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-4">
//                       <p className="text-slate-500 text-xs">{stat.label}</p>
//                       <p className={`text-2xl font-black mt-1.5 ${stat.color}`}>{stat.value}</p>
//                       <p className="text-emerald-400 text-xs mt-1 flex items-center gap-1">
//                         <TrendingUp size={10} />
//                         {stat.change}
//                       </p>
//                     </div>
//                   ))}
//                 </div>

//                 {/* Ticket list preview */}
//                 <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
//                   <div className="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between">
//                     <span className="text-slate-300 text-sm font-semibold">Recent Tickets</span>
//                     <span className="text-sky-400 text-xs cursor-pointer">View all →</span>
//                   </div>
//                   {[
//                     { id: "TKT-8821", issue: "Screen not working", status: "IN_PROGRESS", priority: "HIGH", time: "2m ago" },
//                     { id: "TKT-8820", issue: "Battery drainage", status: "ASSIGNED", priority: "MEDIUM", time: "15m ago" },
//                     { id: "TKT-8819", issue: "Charging port issue", status: "PENDING", priority: "LOW", time: "1h ago" },
//                   ].map((ticket) => (
//                     <div key={ticket.id} className="px-4 py-3 border-b border-white/[0.03] flex items-center justify-between hover:bg-white/[0.02] transition-colors">
//                       <div className="flex items-center gap-3">
//                         <span className="text-sky-500/70 text-xs font-mono">{ticket.id}</span>
//                         <span className="text-slate-300 text-sm">{ticket.issue}</span>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ticket.status === "IN_PROGRESS" ? "bg-violet-500/15 text-violet-400" :
//                           ticket.status === "ASSIGNED" ? "bg-sky-500/15 text-sky-400" :
//                             "bg-amber-500/15 text-amber-400"
//                           }`}>
//                           {ticket.status.replace("_", " ")}
//                         </span>
//                         <span className="text-slate-600 text-xs">{ticket.time}</span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 {/* Activity bar */}
//                 <div className="flex items-end gap-1.5 h-16">
//                   {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
//                     <div
//                       key={i}
//                       className="flex-1 rounded-sm bg-gradient-to-t from-sky-600/40 to-sky-400/40 transition-all"
//                       style={{ height: `${h}%` }}
//                     />
//                   ))}
//                 </div>
//               </div>
//             </div>

//             {/* Floating badges */}
//             {/* <div className="absolute -left-12 top-1/4">
//               <FloatingBadge icon={<CheckCircle size={16} className="text-white" />} label="Resolved today" value="248 Tickets" color="bg-emerald-500/80" delay={0} />
//             </div>
//             <div className="absolute -right-10 top-1/2">
//               <FloatingBadge icon={<Zap size={16} className="text-white" />} label="AI Auto-assigned" value="3 Tickets" color="bg-violet-500/80" delay={1} />
//             </div>
//             <div className="absolute -left-6 bottom-16">
//               <FloatingBadge icon={<Star size={16} className="text-white" />} label="Avg Rating" value="4.9 / 5.0" color="bg-amber-500/80" delay={2} />
//             </div> */}

//             <div className="absolute left-0 top-[12%] -translate-x-1/2 z-20 hidden xl:block">
//               <FloatingBadge
//                 icon={
//                   <CheckCircle
//                     size={16}
//                     className="text-white"
//                   />
//                 }
//                 label="Resolved Today"
//                 value="248 Tickets"
//                 color="bg-emerald-500/90"
//                 delay={0}
//               />
//             </div>

//             <div className="absolute left-50 top-1/2 translate-x-1/2 -translate-y-1/2 z-20 hidden xl:block">
//               <FloatingBadge
//                 icon={
//                   <Zap
//                     size={16}
//                     className="text-white"
//                   />
//                 }
//                 label="AI Auto Assigned"
//                 value="3 Tickets"
//                 color="bg-violet-500/90"
//                 delay={1}
//               />
//             </div>

//             <div className="absolute left-0 bottom-[12%] -translate-x-1/2 z-20 hidden xl:block">
//               <FloatingBadge
//                 icon={
//                   <Star
//                     size={16}
//                     className="text-white"
//                   />
//                 }
//                 label="Average Rating"
//                 value="4.9 / 5.0"
//                 color="bg-amber-500/90"
//                 delay={2}
//               />
//             </div>
//           </div>
//         </div>

//         {/* Stats bar */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 pt-16 border-t border-white/[0.06]">
//           {[
//             { label: "Tickets Managed", value: 50000, suffix: "+" },
//             { label: "Active Service Centers", value: 2400, suffix: "+" },
//             { label: "Brands Onboarded", value: 380, suffix: "+" },
//             { label: "Customer Satisfaction", value: 98, suffix: "%" },
//           ].map((stat) => (
//             <div key={stat.label} className="text-center">
//               <p className="text-4xl lg:text-5xl font-black text-white tabular-nums">
//                 <AnimatedCounter end={stat.value} suffix={stat.suffix} />
//               </p>
//               <p className="text-slate-500 text-sm mt-2">{stat.label}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

// // ─── Trusted By ───────────────────────────────────────────────────
// function TrustedBy() {
//   const brands = ["Samsung", "LG Electronics", "Whirlpool", "Bosch India", "Haier", "Godrej", "IFB", "Voltas"];
//   return (
//     <div className="border-y border-white/[0.05] py-10 overflow-hidden bg-white/[0.01]">
//       <p className="text-center text-slate-600 text-xs font-semibold tracking-widest uppercase mb-8">Trusted by India's leading brands</p>
//       <div className="flex gap-16 animate-[scroll_20s_linear_infinite] whitespace-nowrap">
//         {[...brands, ...brands].map((brand, i) => (
//           <span key={i} className="text-slate-600 font-bold text-sm hover:text-slate-400 transition-colors cursor-default">{brand}</span>
//         ))}
//       </div>
//     </div>
//   );
// }

// // ─── Features Grid ────────────────────────────────────────────────
// function Features() {
//   const features = [
//     {
//       icon: <Cpu size={22} />,
//       title: "AI-Powered Ticket Routing",
//       desc: "Automatically classify, prioritize, and assign tickets to the right service center and technician using machine learning based on issue type, location, and availability.",
//       color: "from-violet-500/20 to-indigo-500/20 border-violet-500/20 text-violet-400",
//     },
//     {
//       icon: <MapPin size={22} />,
//       title: "Live Technician Tracking",
//       desc: "Real-time GPS tracking of technicians on the field. Customers see live location updates and ETA. Managers monitor efficiency with heatmaps and route analytics.",
//       color: "from-sky-500/20 to-cyan-500/20 border-sky-500/20 text-sky-400",
//     },
//     {
//       icon: <BarChart3 size={22} />,
//       title: "Enterprise Analytics & BI",
//       desc: "Advanced dashboards with SLA compliance, technician productivity, brand performance, revenue insights, complaint trends, and exportable reports.",
//       color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/20 text-emerald-400",
//     },
//     {
//       icon: <MessageSquare size={22} />,
//       title: "Real-Time Communication",
//       desc: "Socket.IO powered chat between customers, technicians, service centers, and admins. Ticket-threaded conversations with file sharing and read receipts.",
//       color: "from-orange-500/20 to-amber-500/20 border-orange-500/20 text-orange-400",
//     },
//     {
//       icon: <Shield size={22} />,
//       title: "Warranty Management",
//       desc: "Auto-calculate warranty status on ticket creation. Smart warranty rule engine per brand and product model. Expired warranty billing automation.",
//       color: "from-pink-500/20 to-rose-500/20 border-pink-500/20 text-pink-400",
//     },
//     {
//       icon: <Wallet size={22} />,
//       title: "Wallet & Commission Engine",
//       desc: "Automated commission splitting between service centers and technicians per ticket. Digital wallet with transaction history and instant payout requests.",
//       color: "from-cyan-500/20 to-blue-500/20 border-cyan-500/20 text-cyan-400",
//     },
//     {
//       icon: <Bell size={22} />,
//       title: "Omnichannel Notifications",
//       desc: "Email, SMS, WhatsApp, and in-app push notifications at every ticket lifecycle stage. Customizable notification templates per role and event type.",
//       color: "from-amber-500/20 to-yellow-500/20 border-amber-500/20 text-amber-400",
//     },
//     {
//       icon: <Globe size={22} />,
//       title: "Multi-Tenant SaaS Architecture",
//       desc: "Isolated data per brand tenant. Support for unlimited brands, each with their own service centers, technicians, customers, products, and configurations.",
//       color: "from-teal-500/20 to-green-500/20 border-teal-500/20 text-teal-400",
//     },
//     {
//       icon: <Upload size={22} />,
//       title: "Media & Document Hub",
//       desc: "Attach photos, videos, and documents to tickets. Secure AWS S3 storage with pre-signed URLs. Bulk import users and products via Excel templates.",
//       color: "from-red-500/20 to-orange-500/20 border-red-500/20 text-red-400",
//     },
//   ];

//   return (
//     <section id="features" className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
//       <div className="text-center max-w-2xl mx-auto mb-16">
//         <div className="inline-flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-widest mb-5 border border-sky-500/20 bg-sky-500/5 px-4 py-2 rounded-full">
//           <Zap size={12} /> Powerful Features
//         </div>
//         <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight">
//           Everything You Need to Run{" "}
//           <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">World-Class Service</span>
//         </h2>
//         <p className="text-slate-400 mt-5 leading-relaxed">
//           A complete after-sales ecosystem — not just a ticketing tool. Every module is production-ready and interconnected.
//         </p>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
//         {features.map((feature, i) => (
//           <div
//             key={i}
//             className={`relative group border bg-gradient-to-br ${feature.color} rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300 cursor-default`}
//           >
//             <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 border`}>
//               {feature.icon}
//             </div>
//             <h3 className="text-white font-bold text-[17px] mb-3">{feature.title}</h3>
//             <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// }

// // ─── How It Works ─────────────────────────────────────────────────
// function HowItWorks() {
//   const steps = [
//     {
//       step: "01",
//       title: "Customer Raises Request",
//       desc: "Customer submits a service ticket with photos/videos, product details, and issue description. Warranty is auto-checked.",
//       icon: <Ticket size={20} />,
//     },
//     {
//       step: "02",
//       title: "AI Routes to Service Center",
//       desc: "AI engine matches the ticket to the nearest approved service center based on capability, location, and load.",
//       icon: <Cpu size={20} />,
//     },
//     {
//       step: "03",
//       title: "Technician Gets Assigned",
//       desc: "Service center assigns the best-fit technician. Technician gets notified instantly with job details and navigation.",
//       icon: <UserCheck size={20} />,
//     },
//     {
//       step: "04",
//       title: "Real-Time Job Execution",
//       desc: "Technician updates status live: Start → In Progress → Parts Ordered → Completed. Customer sees every step.",
//       icon: <Clock size={20} />,
//     },
//     {
//       step: "05",
//       title: "Customer Rates & Closes",
//       desc: "Post-service, customer rates quality, timeliness, and communication. Commission auto-splits to wallet.",
//       icon: <Star size={20} />,
//     },
//   ];

//   return (
//     <section id="how-it-works" className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
//       <div className="text-center max-w-2xl mx-auto mb-16">
//         <div className="inline-flex items-center gap-2 text-violet-400 text-xs font-bold uppercase tracking-widest mb-5 border border-violet-500/20 bg-violet-500/5 px-4 py-2 rounded-full">
//           <Settings size={12} /> How It Works
//         </div>
//         <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight">
//           From Request to{" "}
//           <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">Resolution</span>
//           {" "}in Minutes
//         </h2>
//       </div>

//       <div className="relative">
//         {/* Connector line */}
//         <div className="hidden lg:block absolute top-11 left-[60px] right-[60px] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

//         <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
//           {steps.map((step, i) => (
//             <div key={i} className="relative flex flex-col items-center lg:items-start text-center lg:text-left">
//               <div className="relative z-10 w-[88px] h-[88px] rounded-2xl bg-[#0d1117] border border-white/[0.08] flex flex-col items-center justify-center mb-5 shadow-xl group hover:border-sky-500/30 transition-all">
//                 <span className="text-sky-400/50 text-[10px] font-black tracking-wider mb-0.5">{step.step}</span>
//                 <div className="text-sky-400">{step.icon}</div>
//               </div>
//               <h4 className="text-white font-bold text-[15px] mb-2">{step.title}</h4>
//               <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

// // ─── Modules ──────────────────────────────────────────────────────
// function Modules() {
//   const [active, setActive] = useState(0);

//   const modules = [
//     {
//       icon: <Ticket size={18} />,
//       title: "Ticket Management",
//       highlights: ["Full lifecycle: PENDING → CLOSED", "SLA tracking & breach alerts", "Multi-priority queue", "Bulk operations", "Ticket cloning & templates"],
//       preview: (
//         <div className="space-y-3">
//           {[
//             { id: "TKT-9012", title: "Display issue – Samsung TV", priority: "CRITICAL", sla: "2h left", status: "IN_PROGRESS" },
//             { id: "TKT-9011", title: "Compressor noise – Whirlpool", priority: "HIGH", sla: "5h left", status: "ASSIGNED" },
//             { id: "TKT-9010", title: "Remote unresponsive – LG", priority: "MEDIUM", sla: "12h left", status: "PENDING" },
//             { id: "TKT-9009", title: "Water leakage – Bosch WM", priority: "HIGH", sla: "Done", status: "COMPLETED" },
//           ].map((t) => (
//             <div key={t.id} className="flex items-center justify-between bg-white/[0.03] border border-white/[0.05] rounded-xl px-4 py-3">
//               <div>
//                 <span className="text-sky-400/60 text-[11px] font-mono block">{t.id}</span>
//                 <span className="text-slate-200 text-sm font-medium">{t.title}</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.priority === "CRITICAL" ? "bg-red-500/15 text-red-400" :
//                   t.priority === "HIGH" ? "bg-orange-500/15 text-orange-400" :
//                     "bg-amber-500/15 text-amber-400"
//                   }`}>{t.priority}</span>
//                 <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.status === "IN_PROGRESS" ? "bg-violet-500/15 text-violet-400" :
//                   t.status === "COMPLETED" ? "bg-emerald-500/15 text-emerald-400" :
//                     t.status === "ASSIGNED" ? "bg-sky-500/15 text-sky-400" :
//                       "bg-amber-500/15 text-amber-400"
//                   }`}>{t.status.replace("_", " ")}</span>
//               </div>
//             </div>
//           ))}
//         </div>
//       ),
//     },
//     {
//       icon: <Building2 size={18} />,
//       title: "Service Centers",
//       highlights: ["Approval & onboarding workflow", "Capability & coverage mapping", "Performance scorecards", "Geo-based auto-assignment", "Multi-branch management"],
//       preview: (
//         <div className="space-y-3">
//           {[
//             { name: "TechFix Lucknow", area: "Gomtinagar, LKO", rating: 4.8, tickets: 142, status: "APPROVED" },
//             { name: "QuickServ Delhi", area: "Connaught Place, DL", rating: 4.6, tickets: 98, status: "APPROVED" },
//             { name: "RepairPro Mumbai", area: "Andheri West, MH", rating: 4.9, tickets: 217, status: "APPROVED" },
//           ].map((sc) => (
//             <div key={sc.name} className="bg-white/[0.03] border border-white/[0.05] rounded-xl px-4 py-3 flex items-center justify-between">
//               <div>
//                 <p className="text-slate-200 text-sm font-semibold">{sc.name}</p>
//                 <p className="text-slate-500 text-xs flex items-center gap-1 mt-0.5"><MapPin size={10} />{sc.area}</p>
//               </div>
//               <div className="flex items-center gap-3">
//                 <div className="text-right">
//                   <p className="text-amber-400 text-sm font-bold flex items-center gap-1"><Star size={10} />{sc.rating}</p>
//                   <p className="text-slate-500 text-xs">{sc.tickets} tickets</p>
//                 </div>
//                 <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">{sc.status}</span>
//               </div>
//             </div>
//           ))}
//         </div>
//       ),
//     },
//     {
//       icon: <Users size={18} />,
//       title: "User Management",
//       highlights: ["5 role-based access levels", "Bulk import via Excel", "Status control & audit log", "Profile & permission mgmt", "RBAC middleware"],
//       preview: (
//         <div className="space-y-3">
//           {[
//             { name: "Rahul Verma", role: "TECHNICIAN", email: "rahul@fix.com", status: "Active", tickets: 34 },
//             { name: "Priya Sharma", role: "SERVICE_CENTER", email: "priya@sc.com", status: "Active", tickets: 128 },
//             { name: "Amit Singh", role: "CUSTOMER", email: "amit@gmail.com", status: "Active", tickets: 6 },
//             { name: "Neha Gupta", role: "BRAND", email: "neha@samsung.in", status: "Inactive", tickets: 0 },
//           ].map((u) => (
//             <div key={u.name} className="bg-white/[0.03] border border-white/[0.05] rounded-xl px-4 py-3 flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border border-white/[0.08] flex items-center justify-center text-sky-400 text-xs font-bold">{u.name[0]}</div>
//                 <div>
//                   <p className="text-slate-200 text-sm font-medium">{u.name}</p>
//                   <p className="text-slate-600 text-[11px]">{u.email}</p>
//                 </div>
//               </div>
//               <div className="flex items-center gap-2">
//                 <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">{u.role.replace("_", " ")}</span>
//                 <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.status === "Active" ? "bg-emerald-500/15 text-emerald-400" : "bg-slate-500/15 text-slate-500"}`}>{u.status}</span>
//               </div>
//             </div>
//           ))}
//         </div>
//       ),
//     },
//     {
//       icon: <BarChart3 size={18} />,
//       title: "Analytics & Reports",
//       highlights: ["SLA compliance tracking", "Brand performance KPIs", "Technician productivity", "Revenue insights", "Custom date/location filters"],
//       preview: (
//         <div className="space-y-4">
//           <div className="grid grid-cols-2 gap-3">
//             {[
//               { label: "Tickets This Month", value: "3,841", trend: "+14%" },
//               { label: "Revenue", value: "₹8.4L", trend: "+22%" },
//               { label: "Avg Resolution", value: "4.2h", trend: "-18%" },
//               { label: "SLA Compliance", value: "96.4%", trend: "+3%" },
//             ].map((s) => (
//               <div key={s.label} className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-3">
//                 <p className="text-slate-500 text-[11px]">{s.label}</p>
//                 <p className="text-white text-xl font-black mt-1">{s.value}</p>
//                 <p className="text-emerald-400 text-xs flex items-center gap-1 mt-0.5"><TrendingUp size={9} />{s.trend}</p>
//               </div>
//             ))}
//           </div>
//           <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-3">
//             <p className="text-slate-500 text-xs mb-3">Weekly Ticket Trend</p>
//             <div className="flex items-end gap-2 h-14">
//               {[55, 72, 48, 88, 65, 92, 78].map((h, i) => (
//                 <div key={i} className="flex-1 rounded-sm bg-gradient-to-t from-sky-600/50 to-sky-400/30" style={{ height: `${h}%` }} />
//               ))}
//             </div>
//           </div>
//         </div>
//       ),
//     },
//     {
//       icon: <Award size={18} />,
//       title: "Feedback & Rating",
//       highlights: ["5-point category ratings", "Post-service auto-trigger", "Brand feedback analytics", "Technician leaderboard", "Review moderation"],
//       preview: (
//         <div className="space-y-3">
//           {[
//             { customer: "Amit K.", rating: 5, comment: "Technician was on time and fixed the issue perfectly!", tech: "Ravi Technician" },
//             { customer: "Sneha M.", rating: 4, comment: "Good service but slight delay in arrival.", tech: "Rohan Verma" },
//             { customer: "Deepak S.", rating: 5, comment: "Excellent communication throughout. Highly recommend.", tech: "Priya Singh" },
//           ].map((f, i) => (
//             <div key={i} className="bg-white/[0.03] border border-white/[0.05] rounded-xl px-4 py-3">
//               <div className="flex items-center justify-between mb-2">
//                 <span className="text-slate-300 text-sm font-medium">{f.customer}</span>
//                 <div className="flex items-center gap-0.5">
//                   {Array.from({ length: 5 }).map((_, j) => (
//                     <Star key={j} size={11} className={j < f.rating ? "text-amber-400 fill-amber-400" : "text-slate-700"} />
//                   ))}
//                 </div>
//               </div>
//               <p className="text-slate-500 text-xs italic">"{f.comment}"</p>
//               <p className="text-sky-400/60 text-[10px] mt-1.5">via {f.tech}</p>
//             </div>
//           ))}
//         </div>
//       ),
//     },
//   ];

//   return (
//     <section id="modules" className="bg-[#080b12] border-y border-white/[0.05] py-12">
//       <div className="max-w-7xl mx-auto px-5 sm:px-8">
//         <div className="text-center max-w-2xl mx-auto mb-16">
//           <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-5 border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 rounded-full">
//             <Cpu size={12} /> Core Modules
//           </div>
//           <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight">
//             Complete CRM Ecosystem,{" "}
//             <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Zero Gaps</span>
//           </h2>
//         </div>

//         <div className="grid lg:grid-cols-[300px_1fr] gap-8">
//           {/* Tab list */}
//           <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
//             {modules.map((mod, i) => (
//               <button
//                 key={i}
//                 onClick={() => setActive(i)}
//                 className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-left whitespace-nowrap lg:whitespace-normal transition-all shrink-0 lg:shrink ${active === i
//                   ? "bg-white/[0.07] border border-white/[0.1] text-white"
//                   : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]"
//                   }`}
//               >
//                 <span className={active === i ? "text-sky-400" : "text-slate-600"}>{mod.icon}</span>
//                 <span className="font-semibold text-sm">{mod.title}</span>
//                 {active === i && <ChevronRight size={14} className="ml-auto text-sky-400 hidden lg:block" />}
//               </button>
//             ))}
//           </div>

//           {/* Content */}
//           <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-6">
//             <div className="grid md:grid-cols-2 gap-8">
//               <div>
//                 <h3 className="text-white font-black text-2xl mb-5">{modules[active].title}</h3>
//                 <ul className="space-y-3">
//                   {modules[active].highlights.map((h, i) => (
//                     <li key={i} className="flex items-start gap-3 text-slate-400 text-sm">
//                       <CheckCircle size={15} className="text-emerald-400 mt-0.5 shrink-0" />
//                       {h}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//               <div>
//                 <p className="text-slate-600 text-xs uppercase tracking-widest mb-4 font-semibold">Live Preview</p>
//                 {modules[active].preview}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

// // ─── Roles ────────────────────────────────────────────────────────
// function Roles() {
//   const roles = [
//     {
//       title: "Super Admin",
//       color: "from-red-500/10 to-orange-500/10 border-red-500/15 text-red-400",
//       icon: <Shield size={20} />,
//       perms: ["Full platform control", "Manage all brands & SCs", "System configuration", "Analytics & audit logs", "Role & permission management"],
//     },
//     {
//       title: "Brand Manager",
//       color: "from-violet-500/10 to-purple-500/10 border-violet-500/15 text-violet-400",
//       icon: <Award size={20} />,
//       perms: ["Brand dashboard", "Product & model management", "Warranty configuration", "Assign service centers", "Brand-level analytics"],
//     },
//     {
//       title: "Service Center",
//       color: "from-sky-500/10 to-blue-500/10 border-sky-500/15 text-sky-400",
//       icon: <Building2 size={20} />,
//       perms: ["Incoming ticket management", "Technician assignment", "Inventory & parts tracking", "Commission & wallet view", "SLA monitoring"],
//     },
//     {
//       title: "Technician",
//       color: "from-cyan-500/10 to-teal-500/10 border-cyan-500/15 text-cyan-400",
//       icon: <Wrench size={20} />,
//       perms: ["Assigned job list", "Start / Pause / Complete", "Upload job photos", "Chat with customer", "Daily task summary"],
//     },
//     {
//       title: "Customer",
//       color: "from-emerald-500/10 to-green-500/10 border-emerald-500/15 text-emerald-400",
//       icon: <Users size={20} />,
//       perms: ["Raise service request", "Track ticket live", "Chat with technician", "Rate & review service", "Service history"],
//     },
//   ];

//   return (
//     <section className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
//       <div className="text-center max-w-2xl mx-auto mb-16">
//         <div className="inline-flex items-center gap-2 text-pink-400 text-xs font-bold uppercase tracking-widest mb-5 border border-pink-500/20 bg-pink-500/5 px-4 py-2 rounded-full">
//           <Users size={12} /> Role-Based Access
//         </div>
//         <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight">
//           5 Roles,{" "}
//           <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400">One Unified Platform</span>
//         </h2>
//         <p className="text-slate-400 mt-5">Every stakeholder gets a tailored experience with exactly the right permissions.</p>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
//         {roles.map((role, i) => (
//           <div key={i} className={`bg-gradient-to-br ${role.color} border rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300`}>
//             <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${role.color} border flex items-center justify-center mb-4`}>
//               {role.icon}
//             </div>
//             <h4 className="text-white font-bold text-[16px] mb-4">{role.title}</h4>
//             <ul className="space-y-2">
//               {role.perms.map((p, j) => (
//                 <li key={j} className="text-slate-400 text-xs flex items-start gap-2">
//                   <CheckCircle size={11} className="text-emerald-400 mt-0.5 shrink-0" />
//                   {p}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// }

// // ─── Pricing ─────────────────────────────────────────────────────
// function Pricing() {
//   const [annual, setAnnual] = useState(false);

//   const plans = [
//     {
//       name: "Starter",
//       monthly: 4999,
//       annual: 3999,
//       users: "20",
//       storage: "10GB",
//       scs: "3 Service Centers",
//       highlight: false,
//       features: ["Ticket Management", "Email Notifications", "Basic Analytics", "Customer Portal", "Email Support"],
//     },
//     {
//       name: "Professional",
//       monthly: 14999,
//       annual: 11999,
//       users: "100",
//       storage: "100GB",
//       scs: "25 Service Centers",
//       highlight: true,
//       features: ["Everything in Starter", "AI Auto-Assignment", "Live Tracking", "Wallet & Commission", "WhatsApp Alerts", "Priority Support"],
//     },
//     {
//       name: "Enterprise",
//       monthly: null,
//       annual: null,
//       users: "Unlimited",
//       storage: "Unlimited",
//       scs: "Unlimited SCs",
//       highlight: false,
//       features: ["Everything in Pro", "IoT Integration", "Custom AI Models", "Multi-Tenant Setup", "SLA Customization", "Dedicated CSM"],
//     },
//   ];

//   return (
//     <section id="pricing" className="bg-[#080b12] border-y border-white/[0.05] py-12">
//       <div className="max-w-7xl mx-auto px-5 sm:px-8">
//         <div className="text-center max-w-2xl mx-auto mb-14">
//           <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest mb-5 border border-amber-500/20 bg-amber-500/5 px-4 py-2 rounded-full">
//             <Wallet size={12} /> Transparent Pricing
//           </div>
//           <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight">
//             Plans That Scale{" "}
//             <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">With Your Business</span>
//           </h2>

//           {/* Toggle */}
//           <div className="flex items-center justify-center gap-4 mt-8">
//             <span className={`text-sm font-medium ${!annual ? "text-white" : "text-slate-500"}`}>Monthly</span>
//             <button
//               onClick={() => setAnnual(!annual)}
//               className={`relative w-12 h-6 rounded-full transition-colors ${annual ? "bg-sky-500" : "bg-white/10"}`}
//             >
//               <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${annual ? "translate-x-7" : "translate-x-1"}`} />
//             </button>
//             <span className={`text-sm font-medium ${annual ? "text-white" : "text-slate-500"}`}>
//               Annual
//               <span className="ml-2 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">Save 20%</span>
//             </span>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           {plans.map((plan, i) => (
//             <div
//               key={i}
//               className={`relative rounded-2xl p-8 border transition-all hover:-translate-y-1 ${plan.highlight
//                 ? "bg-gradient-to-b from-sky-500/10 to-indigo-500/10 border-sky-500/30 shadow-2xl shadow-sky-500/10"
//                 : "bg-[#0d1117] border-white/[0.07]"
//                 }`}
//             >
//               {plan.highlight && (
//                 <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-sky-500 to-indigo-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
//                   Most Popular
//                 </div>
//               )}

//               <h3 className="text-white font-black text-2xl">{plan.name}</h3>
//               <div className="mt-5 mb-6">
//                 {plan.monthly ? (
//                   <div className="flex items-baseline gap-2">
//                     <span className="text-5xl font-black text-white">
//                       ₹{(annual ? plan.annual! : plan.monthly!).toLocaleString("en-IN")}
//                     </span>
//                     <span className="text-slate-500 text-sm">/month</span>
//                   </div>
//                 ) : (
//                   <span className="text-5xl font-black text-white">Custom</span>
//                 )}
//               </div>

//               <div className="space-y-2 mb-8 pb-8 border-b border-white/[0.07]">
//                 {[plan.users + " Users", plan.storage + " Storage", plan.scs].map((meta) => (
//                   <p key={meta} className="text-slate-400 text-sm flex items-center gap-2">
//                     <span className="w-1.5 h-1.5 rounded-full bg-sky-400/50" />
//                     {meta}
//                   </p>
//                 ))}
//               </div>

//               <ul className="space-y-3 mb-8">
//                 {plan.features.map((f) => (
//                   <li key={f} className="text-slate-300 text-sm flex items-center gap-2.5">
//                     <CheckCircle size={14} className="text-emerald-400 shrink-0" />
//                     {f}
//                   </li>
//                 ))}
//               </ul>

//               <button
//                 className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${plan.highlight
//                   ? "bg-gradient-to-r from-sky-500 to-indigo-500 text-white hover:shadow-lg hover:shadow-sky-500/30 hover:scale-[1.02]"
//                   : "border border-white/10 text-slate-300 hover:bg-white/[0.07] hover:text-white"
//                   }`}
//               >
//                 {plan.monthly ? "Start Free Trial" : "Contact Sales"}
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

// // ─── Testimonials ────────────────────────────────────────────────
// function Testimonials() {
//   const testimonials = [
//     {
//       name: "Vikram Mehta",
//       title: "Head of After-Sales, Samsung India",
//       text: "ServiceCRM transformed our after-sales operation. Ticket resolution time dropped by 40% in the first month. The AI auto-assignment alone saved us 3 FTEs.",
//       rating: 5,
//     },
//     {
//       name: "Ananya Desai",
//       title: "Operations Director, QuickFix Centers",
//       text: "Managing 200+ technicians across 15 cities used to be chaos. Now everything is tracked in one place. The wallet & commission module is a game changer.",
//       rating: 5,
//     },
//     {
//       name: "Rajesh Kumar",
//       title: "CEO, TechCare Network",
//       text: "We evaluated 6 CRM platforms. SaaS Techify was the only one with true multi-tenant architecture and real-time tracking out of the box. Worth every rupee.",
//       rating: 5,
//     },
//   ];

//   return (
//     <section className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
//       <div className="text-center mb-16">
//         <h2 className="text-4xl font-black text-white">Loved by Service Leaders</h2>
//         <p className="text-slate-500 mt-3">Real results from real customers across India</p>
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {testimonials.map((t, i) => (
//           <div key={i} className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-7 hover:-translate-y-1 transition-all">
//             <div className="flex items-center gap-0.5 mb-5">
//               {Array.from({ length: t.rating }).map((_, j) => (
//                 <Star key={j} size={13} className="text-amber-400 fill-amber-400" />
//               ))}
//             </div>
//             <p className="text-slate-300 text-sm leading-relaxed mb-6">"{t.text}"</p>
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border border-white/[0.08] flex items-center justify-center text-sky-400 font-bold text-sm">
//                 {t.name[0]}
//               </div>
//               <div>
//                 <p className="text-white text-sm font-bold">{t.name}</p>
//                 <p className="text-slate-600 text-xs">{t.title}</p>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// }

// // ─── CTA ──────────────────────────────────────────────────────────
// function CTA() {
//   return (
//     <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20 pb-32">
//       <div className="relative rounded-[32px] overflow-hidden">
//         <div className="absolute inset-0 bg-gradient-to-br from-[#0ea5e9]/20 via-[#6366f1]/20 to-[#ec4899]/10" />
//         <div className="absolute inset-0 border border-white/[0.08] rounded-[32px]" />
//         <div className="absolute top-0 left-1/3 w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-[80px]" />
//         <div className="relative px-10 py-20 text-center">
//           <p className="text-sky-400 text-xs font-bold uppercase tracking-widest mb-5">Get Started Today</p>
//           <h2 className="text-4xl lg:text-6xl font-black text-white leading-tight max-w-3xl mx-auto">
//             Ready to Transform Your{" "}
//             <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">After-Sales Business?</span>
//           </h2>
//           <p className="text-slate-400 mt-6 text-lg max-w-2xl mx-auto leading-relaxed">
//             Join 380+ brands already using SaaS Techify. Start your 14-day free trial — no credit card, full platform access.
//           </p>
//           <div className="flex flex-wrap justify-center gap-4 mt-10">
//             <button className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white px-10 py-4 rounded-2xl font-bold text-[15px] shadow-2xl shadow-sky-500/20 hover:shadow-sky-500/40 hover:scale-[1.02] transition-all flex items-center gap-2.5">
//               Start Free Trial — 14 Days
//               <ArrowRight size={17} />
//             </button>
//             <button className="border border-white/10 text-slate-300 hover:bg-white/[0.07] hover:text-white px-10 py-4 rounded-2xl font-bold text-[15px] transition-all">
//               Book a Live Demo
//             </button>
//           </div>
//           <p className="text-slate-600 text-sm mt-6">No credit card required · Setup in 5 minutes · Cancel anytime</p>
//         </div>
//       </div>
//     </section>
//   );
// }

// // ─── Footer ───────────────────────────────────────────────────────
// function Footer() {
//   return (
//     <footer className="border-t border-white/[0.05] bg-[#050810]">
//       <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-16">
//         <div className="grid grid-cols-2 justify-items-center md:grid-cols-4 xl:grid-cols-5 gap-10">
//           {/* Brand col */}
//           {/* <div className="col-span-2 md:col-span-4 xl:col-span-2"> */}
//           <div className="col-span-2 md:col-span-4 xl:col-span-2 ">
//             {/* <div className="flex items-center gap-3 mb-5">
//               <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center shadow-lg">
//                 <Wrench size={18} className="text-white" />
//               </div>
//               <div>
//                 <p className="text-white font-black text-[17px] leading-none">SaaS Techify</p>
//                 <p className="text-slate-600 text-[10px] tracking-widest uppercase leading-none mt-0.5">After-Sales CRM</p>
//               </div>
//             </div> */}
//             <Link
//               href="/"
//               className="flex items-center gap-3 group"
//             >
//               <div className="relative">
//                 <Image
//                   src="/logo.png"
//                   alt="SaaS Techify Logo"
//                   width={400}
//                   height={150}
//                   className="object-contain transition-transform duration-300 group-hover:scale-105"
//                   priority
//                 />
//               </div>
//             </Link>

//           </div>

//           {/* Links */}
//           {[
//             { title: "Product", links: ["Ticket Management", "AI Automation", "Live Tracking", "Analytics", "Wallet System"] },
//             { title: "Company", links: ["About Us", "Pricing", "Careers", "Blog", "Contact"] },
//             { title: "Support", links: ["Documentation", "API Reference", "Status Page", "Help Center", "support@crm.com"] },
//           ].map((col) => (
//             <div key={col.title}>
//               <h4 className="text-white font-bold text-sm mb-5">{col.title}</h4>
//               <ul className="space-y-3">
//                 {col.links.map((link) => (
//                   <li key={link}>
//                     <span className="text-slate-500 hover:text-slate-300 text-sm cursor-pointer transition-colors">{link}</span>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           ))}
//         </div>
//          <div className="border-t border-white/[0.04]   pt-8 pb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
//             <div>
//               <p className="text-slate-500 text-sm leading-relaxed  ">
//               Enterprise-grade after-sales CRM platform with AI automation, real-time infrastructure, and advanced analytics.
//             </p>
//             </div>
//             <div className="flex items-center gap-3  ">
//               {["privacy", "terms", "security"].map((l) => (
//                 <span key={l} className="text-slate-600 hover:text-slate-400 text-xs capitalize cursor-pointer transition-colors">{l}</span>
//               ))}
//             </div>
//           </div>
//         <div className="border-t border-white/[0.04]  pt-8 flex flex-col md:flex-row gap-4 items-center justify-between">
//           <p className="text-slate-600 text-sm">© 2026 SaaS Techify. All rights reserved. Made in Lucknow 🇮🇳</p>
//           <p className="text-slate-700 text-xs">Next.js · TypeScript · MongoDB · AWS · Socket.IO</p>
//         </div>
//       </div>
//     </footer>
//   );
// }

// // ─── Root ─────────────────────────────────────────────────────────
// export default function CRMLandingPage() {
//   return (
//     <div className="min-h-screen bg-[#030712] text-white overflow-hidden">
//       <style>{`
//         @keyframes float {
//           0%, 100% { transform: translateY(0px); }
//           50% { transform: translateY(-8px); }
//         }
//         @keyframes scroll {
//           0% { transform: translateX(0); }
//           100% { transform: translateX(-50%); }
//         }
//       `}</style>

//       <Header />
//       <Hero />
//       <TrustedBy />
//       <Features />
//       <HowItWorks />
//       <Modules />
//       <Roles />
//       <Pricing />
//       <Testimonials />
//       <CTA />
//       <Footer />
//     </div>
//   );
// }


"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Menu, X, ArrowRight, CheckCircle, Star, Users, Clock,
  TrendingUp, Ticket, Building2, Wrench, Bell, Wallet,
  MessageSquare, Shield, Zap, BarChart3, ChevronDown,
  Mail, Phone, MapPin, Send, CheckCheck, Globe, Cpu,
  Award, Play, ChevronRight, Package, Tag, RefreshCw,
  Plus,
  Minus,
  User,
} from "lucide-react";
import Image from "next/image";
import FloatingContact from "@/components/landing/FloatingContact";
import CustomerLandingPage from "./CustomerSection";

/* ─── Animated counter ──────────────────────────────────────────────────── */
function Counter({ end, suffix = "", prefix = "", duration = 2000 }: {
  end: number; suffix?: string; prefix?: string; duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const step = end / (duration / 16);
        const timer = setInterval(() => {
          start = Math.min(start + step, end);
          setCount(Math.round(start));
          if (start >= end) clearInterval(timer);
        }, 16);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

/* ─── Reveal on scroll ───────────────────────────────────────────────────── */
function Reveal({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── FAQ item ───────────────────────────────────────────────────────────── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border rounded-2xl overflow-hidden transition-colors ${open ? "border-indigo-500/40 bg-indigo-500/5" : "border-white/8 bg-white/3"}`}>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left cursor-pointer gap-4">
        <span className="text-[15px] font-medium text-white/90">{q}</span>
        <span className={`w-7 h-7 rounded-full border border-white/15 flex items-center justify-center text-white/60 shrink-0 transition-transform duration-300 ${open ? "rotate-45 border-indigo-400 text-indigo-400" : ""}`}>
          +
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-48 pb-5" : "max-h-0"}`}>
        <p className="px-6 text-sm text-white/50 leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

/* ─── Role tab ───────────────────────────────────────────────────────────── */
const ROLES = [
  // {
  //   key: "admin",
  //   label: "Super Admin",
  //   emoji: "👑",
  //   color: "from-violet-500 to-indigo-600",
  //   perks: [
  //     { icon: "🌐", title: "Cross-brand visibility", desc: "Monitor every brand, SC, technician, and ticket across all tenants in one view." },
  //     { icon: "🏷️", title: "Tenant management", desc: "Create brands, set manager accounts, configure per-ticket earning rates instantly." },
  //     { icon: "💸", title: "Wallet control", desc: "Approve/reject withdrawals, credit/debit wallets, set custom ticket rates per SC." },
  //     { icon: "📊", title: "Platform analytics", desc: "Full platform-wide reports — tickets, revenue, SLA, technician performance across all brands." },
  //   ],
  // },
  {
    key: "manager",
    label: "Brand Manager",
    emoji: "🏢",
    color: "from-blue-500 to-cyan-500",
    perks: [
      { icon: "🏗️", title: "Build your service network", desc: "Add service centers city-wise, assign SC operators, onboard technicians — all from your dashboard." },
      { icon: "🎯", title: "Smart ticket routing", desc: "Assign to an SC or directly to a technician. See real-time status across your entire brand." },
      { icon: "🛍️", title: "Products & categories", desc: "Define product catalog, fault types per category, warranty periods — tickets auto-link." },
      { icon: "📈", title: "Brand analytics", desc: "Weekly/monthly/yearly reports on resolution rates, SLA, technician rankings, earnings." },
    ],
  },
  {
    key: "sc",
    label: "SC Operator",
    emoji: "🏪",
    color: "from-teal-500 to-emerald-500",
    perks: [
      { icon: "🔧", title: "Manage your team", desc: "Add and track technicians in your SC. See availability, ratings, and job counts at a glance." },
      { icon: "🎫", title: "SC-scoped tickets", desc: "Only see tickets assigned to your service center. Assign to your team in one click." },
      { icon: "💰", title: "Wallet & payouts", desc: "Auto-credited per resolved ticket. Request bank or UPI withdrawals directly from the app." },
      { icon: "📋", title: "Performance report", desc: "See your SC's resolution rate, SLA compliance, and top faults for the period." },
    ],
  },
  {
    key: "tech",
    label: "Technician",
    emoji: "🔨",
    color: "from-amber-500 to-orange-500",
    perks: [
      { icon: "📋", title: "My jobs queue", desc: "All assigned tickets with customer info, product details, fault type, and priority — crystal clear." },
      { icon: "💬", title: "Customer chat", desc: "Real-time chat on each ticket. Read receipts, emoji reactions, photo sharing built in." },
      { icon: "📸", title: "Photo uploads", desc: "Upload before/after photos directly on the ticket. Evidence stays linked forever." },
      { icon: "📊", title: "My performance", desc: "Track your own resolution rate, avg time, ratings, and earnings in the summary page." },
    ],
  },
  {
    key: "customer",
    label: "Customer",
    emoji: "😊",
    color: "from-pink-500 to-rose-500",
    perks: [
      { icon: "🎫", title: "Track your request", desc: "Real-time status of your service request — from open to in-progress to resolved." },
      { icon: "💬", title: "Chat with technician", desc: "Direct message your assigned technician — no need to call or wait for updates." },
      { icon: "⭐", title: "Rate & review", desc: "Submit feedback after resolution. Your ratings help brands improve service continuously." },
      { icon: "🔔", title: "Live notifications", desc: "Get notified when your ticket is assigned, updated, or resolved — in real time." },
    ],
  },
];


const socials = [
  {
    icon: <MessageSquare size={18} />,
    href: "#",
  },
  {
    icon: <User size={18} />,
    href: "#",
  },
  {
    icon: <Play size={18} />,
    href: "#",
  },
  {
    icon: <Mail size={18} />,
    href: "#",
  },
];
/* ─── Main page ──────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeRole, setActiveRole] = useState("manager");
  const [formState, setFormState] = useState({
    name: "", email: "", phone: "", company: "",
    teamSize: "", inquiryType: "", message: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState("");
  const [formError, setFormError] = useState("");

  /* nav scroll */
  useEffect(() => {
    const h = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  /* lock scroll when mobile nav open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  /* form submit */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!formState.name || !formState.email || !formState.company || !formState.message) {
      setFormError("Please fill in all required fields.");
      return;
    }
    setFormLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed");
      setFormSuccess(data.data?.referenceId ?? "TCH-" + Date.now().toString(36).toUpperCase());
      setFormState({ name: "", email: "", phone: "", company: "", teamSize: "", inquiryType: "", message: "" });
    } catch (err: any) {
      setFormError(err.message || "Something went wrong. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const role = ROLES.find(r => r.key === activeRole)!;

  // const inputCls = "w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition";

  const inputCls =
    "w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";
  return (
    // <div className="bg-[#050A14] text-white min-h-screen overflow-x-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
    <div
      // className="min-h-screen overflow-x-hidden text-slate-800 bg-gradient-to-br from-[#f8fbff] via-[#eef5ff] to-[#f6f9ff]"
      className="min-h-screen overflow-x-hidden text-slate-800 bg-gradient-to-br from-[#f8fbff] via-[#eef5ff] to-[#f6f9ff]"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Global Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Soft blobs */}
        <div className="absolute top-[-120px] left-[10%] w-[520px] h-[520px] bg-blue-400/12 rounded-full blur-[120px]" />
        <div className="absolute top-[35%] right-[-100px] w-[460px] h-[460px] bg-indigo-300/12 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-120px] left-[30%] w-[500px] h-[500px] bg-cyan-300/10 rounded-full blur-[120px]" />

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>
      {/* ══ NAV ══════════════════════════════════════════════════════ */}




      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${navScrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-slate-200/70 shadow-sm"
          : "bg-white/60 backdrop-blur-lg"
          }`}
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-[72px] flex items-center justify-between gap-2">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center shrink-0 min-w-0 max-w-[60%] sm:max-w-none"
          >
            <Image
              src="/logo13.png"
              alt="SaaS Techify — after-sales service management software"
              width={220}
              height={80}
              priority
              className="h-9 sm:h-11 md:h-[58px] lg:h-[68px] w-auto max-w-full object-contain drop-shadow-[0_8px_25px_rgba(59,130,246,0.35)] hover:drop-shadow-[0_10px_35px_rgba(168,85,247,0.45)] hover:scale-[1.02] transition-all duration-300"
            />
          </Link>



          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {[
              ["#features", "Features"],
              ["#how", "How it works"],
              ["#roles", "For Teams"],
              ["#pricing", "Pricing"],
              ["#faq", "FAQ"],
              ["#contact", "Contact"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition"
              >
                {label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-700 hover:text-indigo-600 px-4 py-2 rounded-xl hover:bg-slate-100 transition"
            >
              Sign in
            </Link>
            <Link
              href="/login"
              className="text-sm font-semibold text-white px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-fuchsia-600 hover:scale-[1.02] transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.35)]"
            >
              Start free trial
            </Link>
          </div>

          {/* Mobile menu */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white/80 backdrop-blur text-slate-700 shadow-sm shrink-0"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-200/70 bg-white/95 backdrop-blur-2xl shadow-xl max-h-[calc(100dvh-4rem)] overflow-y-auto">
            <div className="px-4 sm:px-6 py-5 flex flex-col gap-1">

              {[
                ["#features", "Features"],
                ["#how", "How it works"],
                ["#roles", "For Teams"],
                ["#pricing", "Pricing"],
                ["#faq", "FAQ"],
                ["#contact", "Contact"],
              ].map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition"
                >
                  {label}
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </a>
              ))}

              <div className="border-t border-slate-200 my-2" />

              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center py-3 rounded-xl text-sm font-semibold text-slate-700 border border-slate-200 bg-white hover:bg-slate-50 transition"
              >
                Sign in
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-fuchsia-600 shadow-[0_0_20px_rgba(168,85,247,0.35)] transition"
              >
                Start free trial
              </Link>
            </div>
          </div>
        )}

      </nav>

      <main id="main-content">
        {/* ══ HERO ═════════════════════════════════════════════════════ */}

        <section className="relative pt-24 sm:pt-28 md:pt-32 pb-10 sm:pb-12 overflow-hidden" aria-label="Introduction">
          {/* Background */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-[-120px] left-[10%] w-[520px] h-[520px] bg-blue-400/10 rounded-full blur-[120px]" />
            <div className="absolute top-[40%] right-[-120px] w-[480px] h-[480px] bg-indigo-300/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-120px] left-[30%] w-[500px] h-[500px] bg-cyan-300/10 rounded-full blur-[120px]" />

            {/* Grid */}
            <div
              className="absolute inset-0 opacity-[0.35]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)",
                backgroundSize: "64px 64px",
              }}
            />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="relative rounded-2xl sm:rounded-3xl lg:rounded-[36px] border border-white/70 bg-white/95 backdrop-blur-2xl shadow-[0_20px_80px_rgba(15,23,42,0.08)] overflow-hidden">

              {/* Top glow */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />

              <div className="relative z-10 px-4 sm:px-10 lg:px-16 py-8 sm:py-12">

                {/* Badge */}
                <Reveal>
                  <div className="flex justify-center px-1">
                    <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-3 sm:px-4 py-2 rounded-full text-[10px] sm:text-xs font-semibold tracking-wide shadow-sm text-center max-w-full">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shrink-0" />
                      <span className="leading-snug">Now serving 500+ service brands across India</span>
                    </div>
                  </div>
                </Reveal>

                {/* Heading */}
                <Reveal delay={100}>
                  <div className="text-center mt-6 sm:mt-8">
                    <h1 className="text-[2rem] leading-[1.08] sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-slate-900">
                      After-Sales Service,
                      <br />
                      <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                        Built for Scale
                      </span>
                    </h1>
                  </div>
                </Reveal>

                {/* Description */}
                <Reveal delay={200}>
                  <p className="text-lg sm:text-xl text-slate-500 max-w-3xl mx-auto mt-8 text-center leading-relaxed font-light">
                    After-sales service management software for brands, service centers, and technicians —
                    ticket routing by pincode, warranty, spare parts inventory, SLA tracking, and customer portal.
                  </p>
                </Reveal>

                {/* Buttons */}
                <Reveal delay={300}>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
                    <Link
                      href="/login"
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-semibold text-base shadow-xl shadow-blue-500/20 hover:scale-[1.02] transition-all"
                    >
                      Start free 14-day trial
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <a
                      href="#contact"
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-slate-200 bg-white/80 hover:bg-white text-slate-700 font-semibold text-base transition-all shadow-sm"
                    >
                      <Play className="w-4 h-4" />
                      Request a demo
                    </a>
                  </div>

                  <p className="text-xs text-slate-400 mt-4 text-center">
                    No credit card required · Setup in 30 minutes
                  </p>
                </Reveal>

                {/* Stats */}
                <Reveal delay={400}>
                  <div className="mt-10 sm:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5">
                    {[
                      { end: 5000, suffix: "+", label: "Tickets resolved" },
                      { end: 600, suffix: "+", label: "Service centers" },
                      { end: 1200, suffix: "+", label: "Technicians" },
                      { end: 99, suffix: ".9%", label: "Uptime SLA" },
                    ].map(({ end, suffix, label }) => (
                      <div
                        key={label}
                        className="rounded-xl sm:rounded-2xl border border-slate-200/70 bg-white/80 backdrop-blur-xl p-4 sm:p-6 text-center shadow-[0_10px_40px_rgba(15,23,42,0.04)]"
                      >
                        <div className="text-xl sm:text-3xl font-black tracking-tight text-slate-900 mb-1">
                          <Counter end={end} suffix={suffix} />
                        </div>

                        <p className="text-[11px] sm:text-sm text-slate-500 leading-snug">{label}</p>
                      </div>
                    ))}
                  </div>
                </Reveal>

                {/* Dashboard Preview */}
                <Reveal delay={500}>
                  <div className="mt-16 rounded-[28px] overflow-hidden border border-slate-200 bg-[#f8fbff] shadow-[0_30px_100px_rgba(37,99,235,0.12)] max-w-5xl mx-auto">

                    {/* Topbar */}
                    <div className="bg-white border-b border-slate-200 px-5 py-3 flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-amber-400" />
                        <div className="w-3 h-3 rounded-full bg-emerald-400" />
                      </div>

                      <div className="flex-1 text-center text-xs text-slate-400 font-mono">
                        https://www.saastechify.com/dashboard
                      </div>

                      <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                        <span className="text-[10px] text-emerald-700 font-semibold">
                          Live
                        </span>
                      </div>
                    </div>

                    {/* Dashboard Body */}
                    <div className="p-6 bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/40">

                      {/* Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[
                          {
                            n: "247",
                            label: "Active Tickets",
                            pill: "↑ 12%",
                            pillCls: "bg-blue-100 text-blue-700",
                            icon: "🎫",
                          },
                          {
                            n: "94%",
                            label: "Resolution Rate",
                            pill: "↑ 3%",
                            pillCls: "bg-emerald-100 text-emerald-700",
                            icon: "✅",
                          },
                          {
                            n: "18",
                            label: "Technicians",
                            pill: "Online",
                            pillCls: "bg-cyan-100 text-cyan-700",
                            icon: "🔧",
                          },
                          {
                            n: "4.8★",
                            label: "Avg Rating",
                            pill: "Great",
                            pillCls: "bg-amber-100 text-amber-700",
                            icon: "⭐",
                          },
                        ].map((c) => (
                          <div
                            key={c.label}
                            className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm"
                          >
                            <div className="text-xl mb-2">{c.icon}</div>

                            <div className="text-2xl font-black text-slate-900">
                              {c.n}
                            </div>

                            <div className="text-xs text-slate-500 mt-1">
                              {c.label}
                            </div>

                            <span
                              className={`text-[10px] font-bold px-2 py-1 rounded-full mt-3 inline-block ${c.pillCls}`}
                            >
                              {c.pill}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Chart */}
                      <div className="mt-5 rounded-2xl border border-slate-200 bg-white/90 p-4 sm:p-5 shadow-sm overflow-x-auto">
                        <p className="text-xs text-slate-500 mb-4">
                          Ticket volume — last 12 months
                        </p>

                        <div className="flex items-end gap-1.5 sm:gap-2 h-28 min-w-[260px]">
                          {[40, 65, 50, 80, 55, 90, 70, 85, 60, 95, 75, 88].map(
                            (h, i) => (
                              <div
                                key={i}
                                className="flex-1 rounded-t-xl transition-all duration-500"
                                style={{
                                  height: `${h}%`,
                                  background:
                                    "linear-gradient(180deg, #2563eb 0%, rgba(37,99,235,0.18) 100%)",
                                }}
                              />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* ══ TRUSTED BY ═══════════════════════════════════════════════ */}
        <section className="py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="relative overflow-hidden rounded-2xl sm:rounded-[30px] border border-white/70 bg-white/70 backdrop-blur-2xl shadow-[0_10px_60px_rgba(15,23,42,0.05)] px-4 sm:px-8 py-8 sm:py-10">

              {/* Soft background glow */}
              <div className="absolute inset-0 -z-10">
                <div className="absolute top-[-80px] left-[10%] w-[260px] h-[260px] bg-blue-300/10 rounded-full blur-[80px]" />
                <div className="absolute bottom-[-80px] right-[10%] w-[240px] h-[240px] bg-cyan-300/10 rounded-full blur-[80px]" />
              </div>

              {/* Heading */}
              <div className="text-center mb-10">
                <p className="text-xs font-bold tracking-[0.25em] uppercase text-slate-400">
                  Trusted by leading service brands
                </p>

                <h3 className="mt-3 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                  Powering modern after-sales operations
                </h3>

                <p className="mt-3 text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">
                  Hundreds of appliance, electronics, HVAC, and home service brands
                  manage tickets, technicians, and service centers with Techify.
                </p>
              </div>

              {/* Brands */}
              {/* <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-5">
                {[
                  "Samsung",
                  "LG",
                  "Daikin",
                  "Voltas",
                  "Havells",
                  "Whirlpool",
                  "Bosch",
                ].map((brand) => (
                  <div
                    key={brand}
                    className="group px-6 py-3 rounded-2xl border border-slate-200/70 bg-white/80 hover:bg-white transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-blue-500/10"
                  >
                    <span className="text-base sm:text-lg font-black tracking-tight text-slate-400 group-hover:text-blue-600 transition-colors">
                      {brand}
                    </span>
                  </div>
                ))}
              </div> */}

              {/* Bottom stats */}
              <div className="mt-10 pt-8 border-t border-slate-200/70 grid grid-cols-2 sm:grid-cols-4 gap-6">
                {[
                  { value: "10+", label: "Brands onboarded" },
                  { value: "600+", label: "Service centers" },
                  { value: "1200+", label: "Technicians" },
                  { value: "99.9%", label: "Platform uptime" },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <div className="text-2xl sm:text-3xl font-black text-slate-900">
                      {item.value}
                    </div>

                    <p className="mt-1 text-xs sm:text-sm text-slate-500">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══ FEATURES ═════════════════════════════════════════════════ */}
        <section className="relative py-12 overflow-hidden" id="features">

          {/* Background Glow */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-20 left-[8%] w-[420px] h-[420px] bg-blue-300/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-[10%] w-[420px] h-[420px] bg-cyan-300/10 rounded-full blur-[120px]" />

            <div
              className="absolute inset-0 opacity-[0.35]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px)",
                backgroundSize: "72px 72px",
              }}
            />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6">

            {/* Heading */}
            <Reveal>
              <div className="text-center mb-20">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold tracking-[0.2em] uppercase shadow-sm">
                  Complete platform
                </span>

                <h2 className="mt-7 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.05]">
                  Everything your service
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                    operation needs
                  </span>
                </h2>

                <p className="mt-6 text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed font-light">
                  From first ticket to final payment — every workflow covered,
                  every role connected, every assignment tracked in real time.
                </p>
              </div>
            </Reveal>

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

              {[
                {
                  icon: <Ticket className="w-5 h-5" />,
                  color: "text-blue-600",
                  bg: "bg-blue-100",
                  title: "Smart Ticket Management",
                  desc: "Category → Product → Fault → Priority. Auto-route every ticket to the correct service center with full activity timeline.",
                },
                {
                  icon: <Shield className="w-5 h-5" />,
                  color: "text-emerald-600",
                  bg: "bg-emerald-100",
                  title: "Multi-Brand Isolation",
                  desc: "Every brand operates in a completely isolated tenant. No cross-brand access to tickets, service centers, or technicians.",
                },
                {
                  icon: <Zap className="w-5 h-5" />,
                  color: "text-amber-600",
                  bg: "bg-amber-100",
                  title: "Real-Time RBAC Assignment",
                  desc: "Role-based assignment system for admins, brands, service centers, and technicians with secure API-level access control.",
                },
                {
                  icon: <MessageSquare className="w-5 h-5" />,
                  color: "text-cyan-600",
                  bg: "bg-cyan-100",
                  title: "Built-in Ticket Chat",
                  desc: "Real-time customer and technician communication with read receipts, reactions, attachments, and live updates.",
                },
                {
                  icon: <Wallet className="w-5 h-5" />,
                  color: "text-violet-600",
                  bg: "bg-violet-100",
                  title: "Auto Wallet & Payouts",
                  desc: "Automatically credit service center wallets after resolution with approval-based withdrawal workflows.",
                },
                {
                  icon: <BarChart3 className="w-5 h-5" />,
                  color: "text-pink-600",
                  bg: "bg-pink-100",
                  title: "Deep Analytics & Reports",
                  desc: "Track SLA performance, technician productivity, top faults, ticket volume, and export reports instantly.",
                },
                {
                  icon: <Bell className="w-5 h-5" />,
                  color: "text-orange-600",
                  bg: "bg-orange-100",
                  title: "Real-Time Notifications",
                  desc: "Instant alerts for assignments, ticket updates, status changes, payouts, and escalations.",
                },
                {
                  icon: <Tag className="w-5 h-5" />,
                  color: "text-indigo-600",
                  bg: "bg-indigo-100",
                  title: "Products & Fault Catalog",
                  desc: "Manage categories, products, models, and fault types with intelligent ticket linking and filtering.",
                },
                {
                  icon: <Globe className="w-5 h-5" />,
                  color: "text-teal-600",
                  bg: "bg-teal-100",
                  title: "Fully Responsive",
                  desc: "Optimized for desktop, tablet, and mobile so technicians can manage tickets directly from their phones.",
                },
              ].map((f, i) => (
                <Reveal key={f.title} delay={i * 60}>
                  <div className="group relative overflow-hidden rounded-[28px] border border-white/70 bg-white/75 backdrop-blur-2xl p-7 shadow-[0_10px_50px_rgba(15,23,42,0.05)] hover:shadow-[0_20px_70px_rgba(37,99,235,0.12)] hover:-translate-y-1 transition-all duration-300 h-full">

                    {/* Top Glow */}
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />

                    {/* Hover Glow */}
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-200/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Icon */}
                    <div
                      className={`relative w-14 h-14 ${f.bg} rounded-2xl flex items-center justify-center ${f.color} mb-6 shadow-sm`}
                    >
                      {f.icon}
                    </div>

                    {/* Content */}
                    <h3 className="relative text-xl font-black text-slate-900 mb-3 tracking-tight">
                      {f.title}
                    </h3>

                    <p className="relative text-sm text-slate-500 leading-relaxed">
                      {f.desc}
                    </p>

                    {/* Bottom Line */}
                    <div className="relative mt-6 flex items-center gap-2 text-sm font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Learn more
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══ HOW IT WORKS ═════════════════════════════════════════════ */}
        <section
          className="relative py-12 bg-gradient-to-b from-[#F8FBFF] via-white to-[#F4F8FF]"
          id="how"
        >
          {/* Background glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-1/4 w-[420px] h-[420px] bg-blue-200/30 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-[380px] h-[380px] bg-indigo-200/25 rounded-full blur-[120px]" />
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
            <Reveal>
              <div className="text-center mb-16">
                <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.25em] uppercase text-indigo-600 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-full mb-5">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                  Simple process
                </span>

                <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 mb-5 leading-tight">
                  Up and running
                  <br />
                  <span className="bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                    in 4 simple steps
                  </span>
                </h2>

                <p className="text-slate-500 max-w-xl mx-auto text-base sm:text-lg leading-relaxed">
                  Your complete service operation setup in a few hours —
                  from onboarding brands to managing live tickets.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  n: "01",
                  icon: "🏢",
                  color: "from-indigo-500 to-violet-500",
                  title: "Create brand",
                  desc: "Set up your company workspace, assign managers, configure ticket rules and secure tenant isolation.",
                },
                {
                  n: "02",
                  icon: "🏪",
                  color: "from-blue-500 to-cyan-500",
                  title: "Add service centers",
                  desc: "Onboard service centers city-wise, assign operators and technicians with role-based access.",
                },
                {
                  n: "03",
                  icon: "🛍️",
                  color: "from-emerald-500 to-teal-500",
                  title: "Define catalog",
                  desc: "Create product categories, models and fault types for smooth ticket automation.",
                },
                {
                  n: "04",
                  icon: "🎫",
                  color: "from-orange-500 to-amber-500",
                  title: "Manage tickets",
                  desc: "Tickets auto-route to technicians with real-time tracking, updates and wallet payouts.",
                },
              ].map((s, i) => (
                <Reveal key={s.n} delay={i * 100}>
                  <div className="group relative bg-white/80 backdrop-blur-2xl border border-slate-200/70 rounded-3xl p-7 hover:-translate-y-1.5 hover:border-blue-200 transition-all duration-300 shadow-[0_10px_40px_rgba(15,23,42,0.05)] h-full overflow-hidden">

                    {/* top glow */}
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-blue-400/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Step number */}
                    <div className="flex items-center justify-between mb-6">
                      <div
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-2xl shadow-lg shadow-blue-200/40`}
                      >
                        {s.icon}
                      </div>

                      <span className="text-[11px] font-black tracking-[0.25em] text-slate-300">
                        STEP {s.n}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-3">
                      {s.title}
                    </h3>

                    <p className="text-sm leading-relaxed text-slate-500">
                      {s.desc}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
        {/* ══ ROLES ════════════════════════════════════════════════════ */}
        <section
          className="relative py-12 bg-gradient-to-b from-white via-[#F8FBFF] to-[#F3F7FF]"
          id="roles"
        >
          {/* Background glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-1/4 w-[420px] h-[420px] bg-blue-200/25 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-[360px] h-[360px] bg-indigo-200/25 rounded-full blur-[120px]" />
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">

            {/* Heading */}
            <Reveal>
              <div className="text-center mb-14">
                <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.25em] uppercase text-indigo-600 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-full mb-5">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                  Role-based access
                </span>

                <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight mb-4">
                  The right view for
                  <br />
                  <span className="bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                    every team member
                  </span>
                </h2>

                <p className="text-slate-500 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
                  Every role gets a clean, focused dashboard with permissions
                  tailored to their responsibilities.
                </p>
              </div>
            </Reveal>

            {/* Tabs */}
            <Reveal>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10 sm:mb-14 px-1">
                {ROLES.map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setActiveRole(r.key)}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer border ${activeRole === r.key
                      ? "bg-gradient-to-r from-indigo-600 to-blue-500 text-white border-transparent shadow-lg shadow-indigo-200"
                      : "bg-white/80 backdrop-blur-xl border-slate-200 text-slate-600 hover:border-blue-200 hover:text-slate-900 hover:bg-white"
                      }`}
                  >
                    <span className="text-base">{r.emoji}</span>
                    {r.label}
                  </button>
                ))}
              </div>
            </Reveal>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

              {/* Left perks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {role.perks.map((p, i) => (
                  <Reveal key={p.title} delay={i * 80}>
                    <div className="group bg-white/80 backdrop-blur-2xl border border-slate-200/70 rounded-3xl p-6 hover:-translate-y-1 hover:border-blue-200 transition-all duration-300 shadow-[0_10px_40px_rgba(15,23,42,0.05)] h-full">

                      <div className="text-3xl mb-4">{p.icon}</div>

                      <h4 className="text-base font-bold text-slate-900 mb-2">
                        {p.title}
                      </h4>

                      <p className="text-sm text-slate-500 leading-relaxed">
                        {p.desc}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>

              {/* Right preview */}
              <Reveal delay={200}>
                <div
                  className={`rounded-[32px] bg-gradient-to-br ${role.color} p-[1px] shadow-[0_20px_80px_rgba(59,130,246,0.18)]`}
                >
                  <div className="relative overflow-hidden rounded-[31px] bg-white/90 backdrop-blur-2xl border border-white/60 p-6 sm:p-10 lg:p-12 flex flex-col items-center justify-center min-h-[260px] sm:min-h-[360px] text-center">

                    {/* Glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[260px] h-[120px] bg-blue-200/30 rounded-full blur-[80px]" />

                    <div className="relative z-10">
                      <div className="text-6xl sm:text-8xl mb-4 sm:mb-6 drop-shadow-sm">
                        {role.emoji}
                      </div>

                      <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">
                        {role.label}
                      </h3>

                      <p className="text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
                        {role.perks.length} powerful capabilities with secure,
                        precisely scoped permissions for your workflow.
                      </p>

                      <Link
                        href="/login"
                        className="mt-8 inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-500 hover:to-blue-400 text-white text-sm font-semibold transition-all duration-300 shadow-lg shadow-indigo-200"
                      >
                        Get {role.label} access →
                      </Link>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ══ METRICS ══════════════════════════════════════════════════ */}
        <section className="relative py-12 bg-gradient-to-b from-[#F4F8FF] via-white to-[#F8FBFF] overflow-hidden">

          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-1/4 w-[420px] h-[420px] bg-blue-200/25 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-[360px] h-[360px] bg-indigo-200/25 rounded-full blur-[120px]" />
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">

            {/* Heading */}
            <Reveal>
              <div className="text-center mb-14">
                <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.25em] uppercase text-indigo-600 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-full mb-5">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                  Platform metrics
                </span>

                <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight mb-4">
                  Trusted by growing
                  <br />
                  <span className="bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                    service operations
                  </span>
                </h2>

                <p className="text-slate-500 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
                  Real numbers from brands, service centers and technicians
                  actively managing after-sales operations on Techify.
                </p>
              </div>
            </Reveal>

            {/* Metrics cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  end: 500,
                  suffix: "+",
                  label: "Active brands",
                  icon: "🏢",
                },
                {
                  end: 2400,
                  suffix: "+",
                  label: "Service centers",
                  icon: "🏪",
                },
                {
                  end: 18000,
                  suffix: "+",
                  label: "Daily technicians",
                  icon: "🔧",
                },
                {
                  end: 98,
                  suffix: ".2%",
                  label: "Satisfaction score",
                  icon: "⭐",
                },
              ].map(({ end, suffix, label, icon }, i) => (
                <Reveal key={label} delay={i * 80}>
                  <div className="group relative bg-white/80 backdrop-blur-2xl border border-slate-200/70 rounded-3xl p-8 text-center hover:-translate-y-1 hover:border-blue-200 transition-all duration-300 shadow-[0_10px_40px_rgba(15,23,42,0.05)] overflow-hidden">

                    {/* Hover glow */}
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-blue-400/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Icon */}
                    <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-2xl shadow-lg shadow-blue-200/40">
                      {icon}
                    </div>

                    {/* Number */}
                    <div className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 mb-3">
                      <Counter end={end} suffix={suffix} />
                    </div>

                    {/* Label */}
                    <p className="text-sm font-medium text-slate-500">
                      {label}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>


        <CustomerLandingPage />
        {/* ══ TESTIMONIALS ═════════════════════════════════════════════ */}
        <section className="relative py-12 bg-gradient-to-b from-white via-[#F8FBFF] to-[#F3F7FF] overflow-hidden">

          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-10 left-1/4 w-[420px] h-[420px] bg-blue-200/25 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-[360px] h-[360px] bg-indigo-200/25 rounded-full blur-[120px]" />
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">

            {/* Heading */}
            <Reveal>
              <div className="text-center mb-16">
                <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.25em] uppercase text-indigo-600 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-full mb-5">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                  Customer stories
                </span>

                <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight mb-5">
                  Loved by service teams
                  <br />
                  <span className="bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                    across the country
                  </span>
                </h2>

                <p className="text-slate-500 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
                  Real feedback from brands, service centers and technicians
                  using Techify every day to manage operations at scale.
                </p>
              </div>
            </Reveal>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: "Rajesh Kumar",
                  role: "Head of Service, CoolBreeze AC",
                  avatar: "RK",
                  color: "from-indigo-500 to-blue-500",
                  stars: 5,
                  text:
                    "We manage 14 service centers across 3 states. Techify gave us one clean view of tickets, technicians and earnings. We onboarded our entire team in just 2 days.",
                },
                {
                  name: "Priya Sharma",
                  role: "Brand Manager, FreshHome Appliances",
                  avatar: "PS",
                  color: "from-emerald-500 to-teal-500",
                  stars: 5,
                  text:
                    "The wallet system completely changed our payout workflow. Service centers now track earnings in real time and request withdrawals instantly.",
                },
                {
                  name: "Arjun Mehta",
                  role: "SC Owner, Delhi North",
                  avatar: "AM",
                  color: "from-orange-500 to-amber-500",
                  stars: 5,
                  text:
                    "Our technicians previously worked on WhatsApp. Now they manage jobs, chats, photos and updates in one platform. Resolution time improved massively.",
                },
              ].map((t, i) => (
                <Reveal key={t.name} delay={i * 100}>
                  <div className="group relative bg-white/80 backdrop-blur-2xl border border-slate-200/70 rounded-3xl p-7 hover:-translate-y-1.5 hover:border-blue-200 transition-all duration-300 shadow-[0_10px_40px_rgba(15,23,42,0.05)] flex flex-col h-full overflow-hidden">

                    {/* Top glow */}
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-blue-400/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Stars */}
                    <div className="flex gap-1 mb-5">
                      {Array(t.stars)
                        .fill(0)
                        .map((_, j) => (
                          <Star
                            key={j}
                            className="w-4 h-4 fill-amber-400 text-amber-400"
                          />
                        ))}
                    </div>

                    {/* Quote */}
                    <p className="text-[15px] text-slate-600 leading-relaxed italic flex-1">
                      “{t.text}”
                    </p>

                    {/* User */}
                    <div className="flex items-center gap-4 mt-7 pt-6 border-t border-slate-200/70">
                      <div
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${t.color} flex items-center justify-center text-sm font-bold text-white shadow-lg`}
                      >
                        {t.avatar}
                      </div>

                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {t.name}
                        </p>

                        <p className="text-xs text-slate-500 mt-0.5">
                          {t.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
        {/* ══ PRICING ══════════════════════════════════════════════════ */}
        <section
          className="relative py-12 overflow-hidden bg-gradient-to-b from-[#f8fafc] via-white to-[#f8fafc]"
          id="pricing"
        >
          {/* Background */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/3 w-[420px] h-[420px] bg-indigo-100/50 blur-3xl rounded-full" />
            <div className="absolute bottom-0 right-1/4 w-[320px] h-[320px] bg-violet-100/40 blur-3xl rounded-full" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
            <Reveal>
              <div className="text-center mb-20">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-bold tracking-[0.2em] uppercase mb-5">
                  Transparent Pricing
                </span>

                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight mb-5">
                  Simple plans,
                  <br />
                  <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 bg-clip-text text-transparent">
                    built for growth
                  </span>
                </h2>

                <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed">
                  Start free for 14 days. Scale from a single service center
                  to a nationwide multi-brand support operation.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
              {[
                {
                  name: "Starter",
                  price: "₹2,999",
                  period: "/month",
                  popular: false,
                  desc: "Perfect for startups and growing local service operations.",
                  features: [
                    "1 Brand / Tenant",
                    "Up to 5 Service Centers",
                    "25 Technicians Included",
                    "Unlimited Tickets",
                    "Basic Analytics Dashboard",
                    "Wallet & Payout Support",
                  ],
                  missing: [
                    "Multi-brand management",
                    "Advanced SLA reports",
                    "Dedicated account manager",
                  ],
                },
                {
                  name: "Growth",
                  price: "₹7,999",
                  period: "/month",
                  popular: true,
                  desc: "Designed for brands scaling across multiple cities.",
                  features: [
                    "Up to 5 Brands",
                    "Unlimited Service Centers",
                    "Unlimited Technicians",
                    "Advanced Analytics + CSV Export",
                    "Wallet + Automated Payouts",
                    "Custom Ticket Rates",
                    "Priority Support",
                  ],
                  missing: ["Dedicated account manager"],
                },
                {
                  name: "Enterprise",
                  price: "Custom",
                  period: "/volume",
                  popular: false,
                  desc: "Tailored infrastructure and workflows for large enterprises.",
                  features: [
                    "Unlimited Brands",
                    "Unlimited Everything",
                    "White-label Platform",
                    "Custom Integrations",
                    "Enterprise SLA Management",
                    "Audit Logs & Compliance",
                    "Dedicated Success Manager",
                  ],
                  missing: [],
                },
              ].map((p, i) => (
                <Reveal key={p.name} delay={i * 100}>
                  <div
                    className={`relative h-full rounded-[32px] p-[1px] transition-all duration-500 hover:-translate-y-2 ${p.popular
                      ? "bg-gradient-to-b from-indigo-500 via-violet-500 to-cyan-500 shadow-[0_25px_80px_rgba(99,102,241,0.28)]"
                      : "bg-slate-200 hover:bg-indigo-200"
                      }`}
                  >
                    <div
                      className={`h-full rounded-[31px] backdrop-blur-xl p-6 sm:p-8 lg:p-9 flex flex-col ${p.popular
                        ? "bg-gradient-to-b from-[#111827] to-[#0f172a] pt-8 sm:pt-10"
                        : "bg-white/95"
                        }`}
                    >
                      {/* Popular Badge */}
                      {p.popular && (
                        <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 z-10">
                          <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[11px] font-bold tracking-wider uppercase shadow-xl">
                            Most Popular
                          </div>
                        </div>
                      )}

                      {/* Plan */}
                      <div className="mb-7">
                        <h3
                          className={`text-2xl font-black mb-2 ${p.popular ? "text-white" : "text-slate-900"
                            }`}
                        >
                          {p.name}
                        </h3>

                        <p
                          className={`text-sm leading-relaxed ${p.popular ? "text-slate-400" : "text-slate-500"
                            }`}
                        >
                          {p.desc}
                        </p>
                      </div>

                      {/* Price */}
                      <div
                        className={`pb-7 mb-7 border-b ${p.popular
                          ? "border-white/10"
                          : "border-slate-200"
                          }`}
                      >
                        <div className="flex items-end gap-2">
                          <span
                            className={`text-5xl font-black tracking-tight ${p.popular ? "text-white" : "text-slate-900"
                              }`}
                          >
                            {p.price}
                          </span>

                          <span
                            className={`text-sm mb-1 ${p.popular ? "text-slate-400" : "text-slate-500"
                              }`}
                          >
                            {p.period}
                          </span>
                        </div>
                      </div>

                      {/* Features */}
                      <ul className="space-y-4 flex-1 mb-8">
                        {p.features.map((f) => (
                          <li
                            key={f}
                            className={`flex items-start gap-3 text-sm ${p.popular ? "text-slate-200" : "text-slate-700"
                              }`}
                          >
                            <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0 mt-0.5">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                            </div>
                            <span>{f}</span>
                          </li>
                        ))}

                        {p.missing.map((f) => (
                          <li
                            key={f}
                            className={`flex items-start gap-3 text-sm ${p.popular ? "text-slate-500" : "text-slate-400"
                              }`}
                          >
                            <div className="w-5 h-5 rounded-full bg-slate-200/70 flex items-center justify-center shrink-0 mt-0.5">
                              <X className="w-3.5 h-3.5" />
                            </div>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA */}
                      <Link
                        href={p.name === "Enterprise" ? "#contact" : "/login"}
                        className={`group relative overflow-hidden text-center py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 ${p.popular
                          ? "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-xl shadow-indigo-500/20"
                          : "bg-slate-100 hover:bg-slate-900 text-slate-900 hover:text-white border border-slate-200"
                          }`}
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {p.name === "Enterprise"
                            ? "Contact Sales"
                            : "Get Started"}
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </span>
                      </Link>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══ FAQ ══════════════════════════════════════════════════════ */}
        <section
          className="relative py-12 overflow-hidden bg-gradient-to-b from-white via-slate-50 to-white"
          id="faq"
        >
          {/* Background Blur */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/3 w-[420px] h-[420px] bg-indigo-100/40 blur-3xl rounded-full" />
            <div className="absolute bottom-0 right-1/4 w-[320px] h-[320px] bg-cyan-100/40 blur-3xl rounded-full" />
          </div>

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
            <Reveal>
              <div className="text-center mb-16">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-bold tracking-[0.2em] uppercase mb-5">
                  FAQ
                </span>

                <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight mb-5">
                  Frequently asked
                  <br />
                  <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 bg-clip-text text-transparent">
                    questions
                  </span>
                </h2>

                <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed">
                  Everything you need to know about Techify, onboarding,
                  security, pricing, and operations.
                </p>
              </div>
            </Reveal>

            <Reveal>
              <div className="space-y-5">
                {[
                  {
                    q: "Can one admin manage multiple brands?",
                    a: "Yes. Super Admins can manage multiple brands, service centers, technicians, and reports from a single dashboard while maintaining complete tenant isolation between brands.",
                  },
                  {
                    q: "How does the auto-wallet crediting work?",
                    a: "Whenever a ticket is marked as resolved, the configured payout amount is automatically credited to the service center wallet. Operators can monitor balances and request bank or UPI withdrawals instantly.",
                  },
                  {
                    q: "Is data isolated between brands?",
                    a: "Absolutely. Every brand runs in a fully isolated tenant architecture with secure database-level filtering to ensure complete separation of tickets, technicians, and analytics.",
                  },
                  {
                    q: "Can we migrate our existing ticket data?",
                    a: "Yes. We support CSV imports and custom migration APIs. Our onboarding team can help migrate your legacy data from spreadsheets or existing software systems.",
                  },
                  {
                    q: "Is there a mobile app for technicians?",
                    a: "Techify is fully responsive and optimized for mobile browsers. Technicians can manage tickets, upload photos, chat, and update statuses directly from their phones without installing an app.",
                  },
                  {
                    q: "What happens if we exceed our plan limits?",
                    a: "We notify you before you reach your limits. Your service continues uninterrupted while you upgrade your subscription with prorated billing support.",
                  },
                ].map((faq, i) => (
                  <Reveal key={faq.q} delay={i * 70}>
                    <div className="group rounded-3xl border border-slate-200 bg-white/90 backdrop-blur-xl shadow-[0_10px_40px_rgba(15,23,42,0.05)] hover:shadow-[0_20px_60px_rgba(99,102,241,0.08)] hover:border-indigo-200 transition-all duration-300 overflow-hidden">

                      <details className="group">
                        <summary className="list-none cursor-pointer px-4 sm:px-7 py-5 sm:py-6 flex items-center justify-between gap-3">
                          <div className="pr-2 sm:pr-6 flex-1 min-w-0 text-left">
                            <h3 className="text-sm sm:text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {faq.q}
                            </h3>
                          </div>

                          <div className="w-10 h-10 rounded-2xl bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center shrink-0 transition-all duration-300">
                            <Plus className="w-5 h-5 text-slate-500 group-open:hidden" />
                            <Minus className="w-5 h-5 text-indigo-600 hidden group-open:block" />
                          </div>
                        </summary>

                        <div className="px-7 pb-7">
                          <div className="h-px bg-gradient-to-r from-slate-200 via-indigo-100 to-transparent mb-5" />

                          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                            {faq.a}
                          </p>
                        </div>
                      </details>
                    </div>
                  </Reveal>
                ))}
              </div>
            </Reveal>

            {/* Bottom CTA */}
            <Reveal delay={500}>
              <div className="mt-16 text-center rounded-[32px] border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-10 shadow-[0_20px_60px_rgba(99,102,241,0.08)]">
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">
                  Still have questions?
                </h3>

                <p className="text-slate-600 max-w-xl mx-auto leading-relaxed mb-7">
                  Our onboarding and support team is here to help you set up
                  your entire after-sales workflow smoothly.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/login"
                    className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold shadow-xl shadow-indigo-500/20 transition-all duration-300"
                  >
                    Start Free Trial
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>

                  <a
                    href="#contact"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all duration-300"
                  >
                    Contact Support
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ══ CONTACT ══════════════════════════════════════════════════ */}
        <section
          className="relative py-12 sm:py-12 overflow-hidden"
          id="contact"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#f8fbff] via-white to-[#eef4ff]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-indigo-500/10 blur-3xl rounded-full" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cyan-400/10 blur-3xl rounded-full" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-start">

              {/* Left */}
              <Reveal>
                <div>
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold tracking-[0.18em] uppercase mb-6">
                    Get in touch
                  </span>

                  <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] text-slate-900 mb-6">
                    Let’s scale your
                    <br />
                    <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 bg-clip-text text-transparent">
                      service network
                    </span>
                  </h2>

                  <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mb-10">
                    Tell us about your team size, number of brands, and service centers.
                    We’ll schedule a personalized demo within 24 hours.
                  </p>

                  {/* Contact cards */}
                  <div className="space-y-4">
                    {[
                      {
                        icon: <Mail className="w-5 h-5 text-indigo-600" />,
                        label: "Email us",
                        value: "help.saastechify@gmail.com",
                      },
                      {
                        icon: <Phone className="w-5 h-5 text-indigo-600" />,
                        label: "Call us",
                        value: "+91 9565892772",
                      },
                      {
                        icon: <MapPin className="w-5 h-5 text-indigo-600" />,
                        label: "Office",
                        value: "FF-29, Gali No. 16 Mangal Bazar, Laxmi Nagar, East Delhi, 110092",
                      },
                      {
                        icon: <Clock className="w-5 h-5 text-indigo-600" />,
                        label: "Support hours",
                        value: "Mon – Sat · 9am – 7pm IST",
                      },
                    ].map(({ icon, label, value }) => (
                      <div
                        key={label}
                        className="group flex items-start gap-4 bg-white/80 backdrop-blur-xl border border-slate-200/70 rounded-2xl p-5 hover:border-indigo-200 hover:-translate-y-0.5 transition-all duration-300 shadow-[0_10px_35px_rgba(15,23,42,0.04)]"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                          {icon}
                        </div>

                        <div>
                          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 font-semibold mb-1">
                            {label}
                          </p>
                          <p className="text-sm sm:text-base font-semibold text-slate-800">
                            {value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>

              {/* Right — Contact Form */}
              <Reveal delay={150}>
                <div className="relative rounded-[32px] border border-white/70 bg-white/80 backdrop-blur-2xl shadow-[0_20px_80px_rgba(15,23,42,0.08)] p-7 sm:p-9">

                  {/* Glow */}
                  <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-cyan-500/[0.05] pointer-events-none" />

                  {formSuccess ? (
                    <div className="relative text-center py-8">
                      <div className="w-20 h-20 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
                        <CheckCheck className="w-10 h-10 text-emerald-500" />
                      </div>

                      <h3 className="text-2xl font-black text-slate-900 mb-2">
                        Message received!
                      </h3>

                      <p className="text-sm text-slate-500 mb-6">
                        Our team will get back to you within 24 hours.
                      </p>

                      <div className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm inline-flex items-center gap-2">
                        <span className="text-slate-500">Reference ID:</span>
                        <span className="font-mono font-bold text-indigo-600">
                          {formSuccess}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setFormSuccess("")}
                        className="mt-6 text-sm font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                      >
                        Send another message
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="relative space-y-5">

                      <div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">
                          Send us a message
                        </h3>

                        <p className="text-sm text-slate-500">
                          Fill out the form and we’ll contact you shortly.
                        </p>
                      </div>

                      {/* Name + Email */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-2">
                            Full name *
                          </label>

                          <input
                            className={inputCls}
                            placeholder="Rajesh Kumar"
                            value={formState.name}
                            onChange={(e) =>
                              setFormState((p) => ({
                                ...p,
                                name: e.target.value,
                              }))
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-2">
                            Email *
                          </label>

                          <input
                            type="email"
                            className={inputCls}
                            placeholder="rajesh@brand.com"
                            value={formState.email}
                            onChange={(e) =>
                              setFormState((p) => ({
                                ...p,
                                email: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>

                      {/* Phone + Company */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-2">
                            Phone
                          </label>

                          <input
                            className={inputCls}
                            placeholder="+91 98765 43210"
                            value={formState.phone}
                            onChange={(e) =>
                              setFormState((p) => ({
                                ...p,
                                phone: e.target.value,
                              }))
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-2">
                            Company *
                          </label>

                          <input
                            className={inputCls}
                            placeholder="CoolBreeze AC"
                            value={formState.company}
                            onChange={(e) =>
                              setFormState((p) => ({
                                ...p,
                                company: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>

                      {/* Team + Inquiry */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-2">
                            Team size
                          </label>

                          <select
                            className={inputCls}
                            value={formState.teamSize}
                            onChange={(e) =>
                              setFormState((p) => ({
                                ...p,
                                teamSize: e.target.value,
                              }))
                            }
                          >
                            <option value="">Select size</option>
                            <option>1–10 technicians</option>
                            <option>11–50 technicians</option>
                            <option>51–200 technicians</option>
                            <option>200+ technicians</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-2">
                            Inquiry type
                          </label>

                          <select
                            className={inputCls}
                            value={formState.inquiryType}
                            onChange={(e) =>
                              setFormState((p) => ({
                                ...p,
                                inquiryType: e.target.value,
                              }))
                            }
                          >
                            <option value="">Select type</option>
                            <option>Product demo</option>
                            <option>Pricing & plans</option>
                            <option>Technical support</option>
                            <option>Partnership</option>
                            <option>Other</option>
                          </select>
                        </div>
                      </div>

                      {/* Message */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-2">
                          Message *
                        </label>

                        <textarea
                          className={`${inputCls} h-auto resize-none`}
                          rows={5}
                          placeholder="Tell us about your challenges, brands, service centers, or technician workflows..."
                          value={formState.message}
                          onChange={(e) =>
                            setFormState((p) => ({
                              ...p,
                              message: e.target.value,
                            }))
                          }
                        />
                      </div>

                      {/* Error */}
                      {formError && (
                        <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
                          <X className="w-4 h-4 shrink-0" />
                          {formError}
                        </div>
                      )}

                      {/* Button */}
                      <button
                        type="submit"
                        disabled={formLoading}
                        className="w-full py-4 rounded-2xl  bg-gradient-to-r from-cyan-500 to-fuchsia-600
    hover:scale-105
    transition-all duration-300
    shadow-[0_0_20px_rgba(168,85,247,0.45)] disabled:opacity-60 text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_12px_40px_rgba(99,102,241,0.35)] cursor-pointer"
                      >
                        {formLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Send message
                          </>
                        )}
                      </button>

                      <p className="text-xs text-slate-400 text-center leading-relaxed">
                        By submitting this form, you agree to our Privacy Policy.
                        We never share your information.
                      </p>
                    </form>
                  )}
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ══ CTA BANNER ═══════════════════════════════════════════════ */}
        <section className="relative py-12 sm:py-12 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-white via-[#f8fbff] to-[#eef4ff]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[350px] h-[350px] bg-violet-500/10 rounded-full blur-3xl" />

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
            <Reveal>
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl lg:rounded-[36px] border border-white/70 bg-white/75 backdrop-blur-2xl shadow-[0_25px_80px_rgba(15,23,42,0.08)]">

                {/* Decorative Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.06] via-transparent to-violet-500/[0.08]" />

                {/* Floating circles */}
                <div className="absolute -top-20 -left-20 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-violet-500/10 rounded-full blur-3xl" />

                <div className="relative z-10 px-8 py-12 sm:px-14 sm:py-12 text-center">

                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold tracking-[0.18em] uppercase mb-8">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Trusted by 500+ service brands
                  </div>

                  {/* Heading */}
                  <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] text-slate-900 mb-6">
                    Ready to transform your
                    <br />
                    <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 bg-clip-text text-transparent">
                      after-sales operations?
                    </span>
                  </h2>

                  {/* Description */}
                  <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed mb-10">
                    Join hundreds of brands managing tickets, technicians, service centers,
                    analytics, and payouts — all from one unified platform.
                  </p>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">

                    <Link
                      href="/login"
                      className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl  bg-gradient-to-r from-cyan-500 to-fuchsia-600
    hover:scale-105
    transition-all duration-300
    shadow-[0_0_20px_rgba(168,85,247,0.45)] text-white font-semibold transition-all duration-300 shadow-[0_15px_45px_rgba(99,102,241,0.35)] hover:shadow-[0_20px_55px_rgba(99,102,241,0.45)]"
                    >
                      Start free 14-day trial
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>

                    <a
                      href="#contact"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-slate-200 bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 font-semibold transition-all duration-300 shadow-sm"
                    >
                      Talk to sales
                    </a>
                  </div>

                  {/* Small trust text */}
                  <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500">
                    <span>No credit card required</span>
                    <span className="hidden sm:block w-1.5 h-1.5 rounded-full bg-slate-300" />
                    <span>Setup in under 30 minutes</span>
                    <span className="hidden sm:block w-1.5 h-1.5 rounded-full bg-slate-300" />
                    <span>Cancel anytime</span>
                  </div>

                  {/* Mini stats */}
                  <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
                    {[
                      { value: "50K+", label: "Tickets resolved" },
                      { value: "2.4K+", label: "Service centers" },
                      { value: "18K+", label: "Technicians" },
                      { value: "99.9%", label: "Platform uptime" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-2xl border border-slate-200/70 bg-white/70 backdrop-blur-xl px-4 py-5"
                      >
                        <div className="text-2xl font-black text-slate-900 mb-1">
                          {item.value}
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          {item.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* ══ FOOTER ═══════════════════════════════════════════════════ */}
      <footer className="relative overflow-hidden border-t border-slate-200/70  ">

        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-indigo-500/5 blur-3xl rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

          {/* Top */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-8 sm:gap-12   border-b border-slate-200/70">


            {/* Brand */}
            <div className="col-span-2 sm:col-span-4 lg:col-span-2">

              {/* Logo + Description */}
              <div className="flex flex-col gap-5 mb-8">

                <div className="flex justify-center">
                  <Link
                    href="/"
                    className="flex items-center justify-center"
                  >
                    <Image
                      src="/logo13.png"
                      alt="SaaSTechify"
                      width={220}
                      height={80}
                      priority
                      className="h-11 sm:h-12 md:h-24 w-auto object-contain"
                    />
                  </Link>
                </div>

                <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed max-w-md">
                  The complete after-sales service management platform for brands,
                  service centers, technicians, and customer support teams across India.
                </p>
              </div>





            </div>

            {/* Footer Links */}
            {[
              {
                title: "Product",
                links: [
                  ["#features", "Features"],
                  ["#pricing", "Pricing"],
                  ["#how", "How it works"],
                  ["#faq", "FAQ"],
                ],
              },
              {
                title: "For teams",
                links: [
                  // ["#roles", "Super Admin"],
                  ["#roles", "Brand Managers"],
                  ["#roles", "Service Centers"],
                  ["#roles", "Technicians"],
                  ["#roles", "Customers"],
                ],
              },
              {
                title: "Company",
                links: [
                  ["#contact", "Contact"],
                  ["/login", "Sign In"],
                  ["/register", "Sign Up"],
                ],
              },
            ].map((col) => (
              <div key={col.title} className="pb-5">
                <h4 className="text-xs font-bold   tracking-[0.18em] uppercase text-slate-400 mb-5">
                  {col.title}
                </h4>

                <ul className="space-y-3">
                  {col.links.map(([href, label]) => (
                    <li key={label}>
                      <a
                        href={href}
                        className="text-sm text-slate-600 hover:text-indigo-600 transition-colors duration-300 font-medium"
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {/* Contact Info */}
          <div className="py-4 flex flex-col items-start  md:flex-row items-center justify-between border-b border-slate-200/70 gap-5">

            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="min-w-[42px] h-[42px] rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 text-lg">
                ✉
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 font-semibold mb-1">
                  Email us
                </p>

                <a
                  href="mailto:help.saastechify@gmail.com"
                  className="text-sm text-slate-700 hover:text-indigo-600 transition-colors break-all"
                >
                  help.saastechify@gmail.com
                </a>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-4">
              <div className="min-w-[42px] h-[42px] rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 text-lg">
                ☎
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 font-semibold mb-1">
                  Call us
                </p>

                <a
                  href="tel:+919565892772"
                  className="text-sm text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  +91 9565892772
                </a>
              </div>
            </div>

            {/* Office */}
            <div className="flex items-start gap-4">
              <div className="min-w-[42px] h-[42px] rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 text-lg">
                📍
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 font-semibold mb-1">
                  Office
                </p>

                <p className="text-sm text-slate-700 leading-relaxed max-w-sm">
                  FF-29, Gali No. 16   Laxmi Nagar,
                  East Delhi, 110092
                </p>
              </div>
            </div>

            {/* Support Hours */}
            <div className="flex items-start gap-4">
              <div className="min-w-[42px] h-[42px] rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 text-lg">
                🕘
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 font-semibold mb-1">
                  Support hours
                </p>

                <p className="text-sm text-slate-700">
                  Mon – Sat · 9am – 7pm IST
                </p>
              </div>
            </div>

          </div>
          {/* Bottom */}
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-5">

            {/* Copyright */}
            <p className="text-sm text-slate-500 text-center md:text-left">
              © 2026 SaaS Techify. All rights reserved.
            </p>
            {/* Socials */}
            <div className="flex items-center gap-3 flex-wrap">
              {socials.map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  className="
        group
        w-11 h-11 rounded-2xl
        bg-gradient-to-r from-cyan-500 to-fuchsia-600
        hover:from-fuchsia-600 hover:to-cyan-500
        text-white
        flex items-center justify-center
        transition-all duration-300
        hover:scale-105
        hover:shadow-[0_10px_25px_rgba(168,85,247,0.35)]
      "
                >
                  <span className="group-hover:scale-110 transition-transform duration-300">
                    {s.icon}
                  </span>
                </a>
              ))}
            </div>
            {/* Bottom Links */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              {[
                ["Privacy Policy", "/privacy"],
                ["Terms of Service", "/terms"],
                ["Cookie Policy", "/cookies"],
              ].map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  className="text-sm text-slate-500 hover:text-indigo-600 transition-colors duration-300"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <FloatingContact />
    </div>
  );
}