import {
  ShieldCheck,
  Lock,
  Database,
  Eye,
  Globe,
  Mail,
} from "lucide-react";
import { siteConfig } from "@/lib/site-seo";

export default function PrivacyPolicyPage() {
  return (
    <>
      <section className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-20">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
              <ShieldCheck size={18} />
              Privacy & Data Protection
            </div>

            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900">
              Privacy Policy
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-600">
              How {siteConfig.name} collects, uses, and protects information when you use our
              after-sales service management platform.
            </p>

            <p className="mt-4 text-sm text-slate-500">
              Effective & last updated: May 18, 2026
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-2">
          <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
              <Database size={28} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Information we collect</h2>
            <ul className="mt-6 space-y-3 text-slate-600 list-disc pl-5">
              <li>Name, email, phone, and account credentials</li>
              <li>Service tickets, warranty, inventory, and audit data</li>
              <li>Usage logs, device, and IP for security</li>
            </ul>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <Lock size={28} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Data security</h2>
            <p className="mt-6 leading-8 text-slate-600">
              We use encryption, role-based access, secure hosting, and audit logging to protect
              your organization&apos;s data.
            </p>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
              <Eye size={28} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">How we use data</h2>
            <ul className="mt-6 space-y-3 text-slate-600 list-disc pl-5">
              <li>Operate tickets, SLAs, notifications, and reporting</li>
              <li>Improve product reliability and support</li>
              <li>Meet legal and security obligations</li>
            </ul>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <Globe size={28} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Third-party services</h2>
            <p className="mt-6 leading-8 text-slate-600">
              We may use cloud hosting, email, SMS/WhatsApp, payments, and analytics providers.
              Each is bound by appropriate data agreements.
            </p>
          </article>
        </div>

        <div className="mt-12 rounded-3xl border border-slate-200 bg-slate-900 p-8 sm:p-10 text-white">
          <h2 className="text-2xl font-bold">Questions about privacy?</h2>
          <p className="mt-3 text-slate-300 max-w-2xl">
            Contact us for data access, correction, or deletion requests.
          </p>
          <a
            href={`mailto:${siteConfig.contactEmail}`}
            className="mt-6 inline-flex items-center gap-3 rounded-2xl bg-white/10 px-5 py-4 text-sm font-medium hover:bg-white/15 transition"
          >
            <Mail size={20} />
            {siteConfig.contactEmail}
          </a>
        </div>
      </section>
    </>
  );
}


 
 