
import {
  ShieldCheck,
  Lock,
  Database,
  Eye,
  Globe,
  Mail,
} from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero */}
      <section className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
              <ShieldCheck size={18} />
              Privacy & Data Protection
            </div>

            <h1 className="font-heading text-5xl font-black tracking-tight text-slate-900 lg:text-6xl">
              Privacy Policy
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-600">
              Your privacy matters to us. This Privacy Policy explains how we collect,
              use, protect, and manage your information when you use our SaaS CRM
              platform.
            </p>

            <div className="mt-8 flex flex-wrap gap-4 text-sm text-slate-500">
              <span>Effective Date: May 18, 2026</span>
              <span>•</span>
              <span>Last Updated: May 18, 2026</span>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
              <Database size={28} />
            </div>

            <h2 className="font-heading text-2xl font-bold text-slate-900">
              Information We Collect
            </h2>

            <ul className="mt-6 space-y-4 text-slate-600">
              <li>• Personal details like name, email, phone number.</li>
              <li>• Account login and authentication information.</li>
              <li>• CRM activity, support tickets, analytics and logs.</li>
              <li>• Device information, browser type, and IP address.</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <Lock size={28} />
            </div>

            <h2 className="font-heading text-2xl font-bold text-slate-900">
              Data Security
            </h2>

            <p className="mt-6 leading-8 text-slate-600">
              We use enterprise-grade security practices including encryption,
              secure authentication, protected cloud infrastructure, and access
              control mechanisms to safeguard your information.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
              <Eye size={28} />
            </div>

            <h2 className="font-heading text-2xl font-bold text-slate-900">
              How We Use Data
            </h2>

            <ul className="mt-6 space-y-4 text-slate-600">
              <li>• Improve CRM platform performance and reliability.</li>
              <li>• Provide customer support and notifications.</li>
              <li>• Generate reports, analytics, and operational insights.</li>
              <li>• Ensure security, fraud prevention, and compliance.</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <Globe size={28} />
            </div>

            <h2 className="font-heading text-2xl font-bold text-slate-900">
              Third-Party Services
            </h2>

            <p className="mt-6 leading-8 text-slate-600">
              Our platform may integrate with third-party providers such as cloud
              hosting, payment gateways, analytics services, and communication
              providers to enhance functionality.
            </p>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-12 rounded-3xl border border-slate-200 bg-slate-900 p-10 text-white shadow-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-heading text-3xl font-bold">
                Questions About Privacy?
              </h2>

              <p className="mt-3 max-w-2xl text-slate-300">
                If you have any concerns regarding your data or privacy rights,
                feel free to contact our support team.
              </p>
            </div>

            <div className="inline-flex items-center gap-3 rounded-2xl bg-white/10 px-5 py-4 backdrop-blur">
              <Mail size={22} />
              <span className="font-medium">
                support@yourcompany.com
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 
