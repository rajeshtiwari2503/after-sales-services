"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV = [
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
  { href: "/#contact", label: "Contact" },
];

export default function PublicSiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center shrink-0">
          <Image
                     src="/logo13.png"
                     alt="SaaS Techify — after-sales service management software"
                     width={220}
                     height={80}
                     priority
                     className="h-9 sm:h-11 md:h-[58px] lg:h-[68px] w-auto max-w-full object-contain drop-shadow-[0_8px_25px_rgba(59,130,246,0.35)] hover:drop-shadow-[0_10px_35px_rgba(168,85,247,0.45)] hover:scale-[1.02] transition-all duration-300"
                   />
        </Link>

        <nav className="hidden md:flex items-center gap-6" aria-label="Site">
          {NAV.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/login"
            className="text-sm font-semibold text-slate-700 hover:text-indigo-600 px-3 py-2 rounded-lg"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="text-sm font-semibold text-white px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-fuchsia-600 hover:opacity-95 transition"
          >
            Start free trial
          </Link>
        </div>

        <button
          type="button"
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-3">
          {NAV.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="block text-sm font-medium text-slate-700 py-2"
              onClick={() => setOpen(false)}
            >
              {label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
            <Link href="/login" className="text-center py-2.5 text-sm font-semibold border border-slate-200 rounded-xl">
              Sign in
            </Link>
            <Link href="/register" className="text-center py-2.5 text-sm font-semibold text-white rounded-xl bg-indigo-600">
              Start free trial
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
