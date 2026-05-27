// import { siteConfig } from "@/lib/site-seo";

// export default function TermsPage() {
//   return (
//     <article className="mx-auto max-w-3xl px-4 sm:px-6 py-14 sm:py-20 prose prose-slate">
//       <h1 className="text-4xl font-black text-slate-900 not-prose">Terms of Service</h1>
//       <p className="text-slate-500 text-sm not-prose mt-2">Last updated: May 18, 2026</p>

//       <p className="lead">
//         These terms govern your use of the {siteConfig.name} after-sales service management
//         platform (&quot;Service&quot;). By accessing the Service you agree to these terms.
//       </p>

//       <h2>1. Accounts</h2>
//       <p>
//         You are responsible for safeguarding login credentials and for activity under your
//         account. Roles (admin, brand, service center, technician, customer) define access scope.
//       </p>

//       <h2>2. Acceptable use</h2>
//       <p>
//         You may not misuse the Service, attempt unauthorized access, or upload unlawful content.
//         We may suspend accounts that violate these terms or applicable law.
//       </p>

//       <h2>3. Data & privacy</h2>
//       <p>
//         Our use of personal data is described in our{" "}
//         <a href="/privacy">Privacy Policy</a>. You retain ownership of your business data;
//         you grant us a license to host and process it to provide the Service.
//       </p>

//       <h2>4. Availability</h2>
//       <p>
//         We strive for high uptime but do not guarantee uninterrupted access. Maintenance and
//         updates may occur with reasonable notice where possible.
//       </p>

//       <h2>5. Limitation of liability</h2>
//       <p>
//         To the extent permitted by law, {siteConfig.name} is not liable for indirect or
//         consequential damages arising from use of the Service.
//       </p>

//       <h2>6. Contact</h2>
//       <p>
//         Questions: <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
//       </p>
//     </article>
//   );
// }


import { siteConfig } from "@/lib/site-seo";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Top Header */}
      <div className="border-b bg-white/70 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              {siteConfig.name}
            </h1>
            <p className="text-xs text-slate-500">
              Legal • Terms of Service
            </p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-600">
            Last updated: May 18, 2026
          </span>
        </div>
      </div>

      {/* Content */}
      <article className="  mx-auto max-w-6xl   px-4 sm:px-6 py-10 sm:py-16 text-slate-700">
        {/* Hero */}
        <div className="mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
            Terms of Service
          </h2>
          <p className="mt-3 text-slate-600 leading-relaxed">
            These Terms govern your use of <strong>{siteConfig.name}</strong>,
            a SaaS-based after-sales CRM platform for managing customers,
            tickets, service workflows, and analytics.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-10">
          <section className="p-6 rounded-2xl border bg-white shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900 mb-3">
              1. Accounts & Access Control
            </h3>
            <p>
              You are responsible for maintaining account security. Access is
              role-based (Admin, Brand, Service Center, Technician, Customer)
              and must not be shared or misused.
            </p>
          </section>

          <section className="p-6 rounded-2xl border bg-white shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900 mb-3">
              2. Acceptable Use Policy
            </h3>
            <p>
              You agree not to misuse the system, attempt unauthorized access,
              introduce malicious code, or disrupt platform operations in any
              form.
            </p>
          </section>

          <section className="p-6 rounded-2xl border bg-white shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900 mb-3">
              3. Data Ownership & Rights
            </h3>
            <p>
              All business data remains your property. We only process data to
              operate and improve the Service. Data handling is governed by our
              Privacy Policy.
            </p>
            <a
              href="/privacy"
              className="inline-block mt-3 text-sm text-indigo-600 font-medium hover:underline"
            >
              View Privacy Policy →
            </a>
          </section>

          <section className="p-6 rounded-2xl border bg-white shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900 mb-3">
              4. Service Availability
            </h3>
            <p>
              We strive for high uptime but do not guarantee uninterrupted
              service. Maintenance, updates, or emergency fixes may temporarily
              affect access.
            </p>
          </section>

          <section className="p-6 rounded-2xl border border-red-100 bg-red-50">
            <h3 className="text-xl font-semibold text-red-700 mb-3">
              5. Limitation of Liability
            </h3>
            <p className="text-red-700">
              To the maximum extent permitted by law, {siteConfig.name} is not
              liable for any indirect, incidental, or consequential damages
              including data loss, revenue loss, or business interruption.
            </p>
          </section>

          <section className="p-6 rounded-2xl border bg-white shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900 mb-3">
              6. Termination
            </h3>
            <p>
              We may suspend or terminate accounts violating these Terms or
              applicable laws. Users may discontinue service anytime.
            </p>
          </section>

          <section className="p-6 rounded-2xl border bg-white shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900 mb-3">
              7. Contact
            </h3>
            <p>Email: {siteConfig.contactEmail}</p>
            <p>Phone: 9565892772</p>
          </section>
        </div>

        {/* Footer Note */}
        <p className="mt-12 text-xs text-slate-500 text-center">
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
      </article>
    </div>
  );
}
