// import { siteConfig } from "@/lib/site-seo";

// export default function CookiesPage() {
//   return (
//     <article className="mx-auto max-w-3xl px-4 sm:px-6 py-14 sm:py-20 prose prose-slate">
//       <h1 className="text-4xl font-black text-slate-900 not-prose">Cookie Policy</h1>
//       <p className="text-slate-500 text-sm not-prose mt-2">Last updated: May 18, 2026</p>

//       <p>
//         {siteConfig.name} uses cookies and similar technologies to keep you signed in, remember
//         preferences, and understand how the marketing site is used.
//       </p>

//       <h2>Essential cookies</h2>
//       <p>
//         Required for authentication (e.g. session tokens), security, and core application
//         functionality. These cannot be disabled while using the app.
//       </p>

//       <h2>Analytics (optional)</h2>
//       <p>
//         We may use privacy-friendly analytics on the public website to improve content and
//         conversion. You can control non-essential cookies via your browser settings.
//       </p>

//       <h2>Managing cookies</h2>
//       <p>
//         Most browsers let you block or delete cookies. Blocking essential cookies may prevent
//         login and dashboard access.
//       </p>

//       <p>
//         Contact: <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
//       </p>
//     </article>
//   );
// }


import {
  ShieldCheck,
  Lock,
  Database,
  Eye,
  Globe,
  Mail,
  Cookie,
  Settings,
  BarChart3,
} from "lucide-react";
import { siteConfig } from "@/lib/site-seo";
 
 
export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <section className="border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
              <Cookie size={18} />
              Cookies & Tracking
            </div>

            <h1 className="mt-5 text-4xl sm:text-5xl font-black text-slate-900">
              Cookie Policy
            </h1>

            <p className="mt-6 text-lg text-slate-600 leading-8">
              {siteConfig.name} uses cookies to improve authentication, security,
              and user experience across the platform.
            </p>

            <p className="mt-4 text-sm text-slate-500">
              Last updated: May 18, 2026
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-2">
          <article className="rounded-3xl border bg-white p-8 shadow-sm">
            <Settings className="mb-4 text-indigo-600" size={28} />
            <h2 className="text-2xl font-bold">Essential Cookies</h2>
            <p className="mt-4 text-slate-600">
              Required for login, authentication, and secure session management.
            </p>
          </article>

          <article className="rounded-3xl border bg-white p-8 shadow-sm">
            <BarChart3 className="mb-4 text-blue-600" size={28} />
            <h2 className="text-2xl font-bold">Analytics Cookies</h2>
            <p className="mt-4 text-slate-600">
              Help us understand usage patterns and improve platform performance.
            </p>
          </article>

          <article className="rounded-3xl border bg-white p-8 shadow-sm">
            <Globe className="mb-4 text-emerald-600" size={28} />
            <h2 className="text-2xl font-bold">Preferences</h2>
            <p className="mt-4 text-slate-600">
              Store user settings like theme, language, and layout preferences.
            </p>
          </article>

          <article className="rounded-3xl border bg-white p-8 shadow-sm">
            <Lock className="mb-4 text-red-500" size={28} />
            <h2 className="text-2xl font-bold">Managing Cookies</h2>
            <p className="mt-4 text-slate-600">
              You can disable cookies in browser settings, but some features may stop working.
            </p>
          </article>
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-3xl border bg-slate-900 p-8 text-white">
          <h2 className="text-2xl font-bold">Need help?</h2>
          <p className="mt-3 text-slate-300">
            Contact us for any privacy or cookie-related questions.
          </p>
          <a
            href={`mailto:${siteConfig.contactEmail}`}
            className="mt-6 inline-flex items-center gap-3 rounded-2xl bg-white/10 px-5 py-4 hover:bg-white/15 transition"
          >
            <Mail size={18} />
            {siteConfig.contactEmail}
          </a>
        </div>
      </section>
    </div>
  );
}
