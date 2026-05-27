 
import Link from "next/link";
 
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
export default function PublicSiteFooter() {


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
  return (
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
                  <div key={col.title}>
                    <h4 className="text-xs font-bold tracking-[0.18em] uppercase text-slate-400 mb-5">
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
  );
}
