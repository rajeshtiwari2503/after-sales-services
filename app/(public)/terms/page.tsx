import { siteConfig } from "@/lib/site-seo";

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 py-14 sm:py-20 prose prose-slate">
      <h1 className="text-4xl font-black text-slate-900 not-prose">Terms of Service</h1>
      <p className="text-slate-500 text-sm not-prose mt-2">Last updated: May 18, 2026</p>

      <p className="lead">
        These terms govern your use of the {siteConfig.name} after-sales service management
        platform (&quot;Service&quot;). By accessing the Service you agree to these terms.
      </p>

      <h2>1. Accounts</h2>
      <p>
        You are responsible for safeguarding login credentials and for activity under your
        account. Roles (admin, brand, service center, technician, customer) define access scope.
      </p>

      <h2>2. Acceptable use</h2>
      <p>
        You may not misuse the Service, attempt unauthorized access, or upload unlawful content.
        We may suspend accounts that violate these terms or applicable law.
      </p>

      <h2>3. Data & privacy</h2>
      <p>
        Our use of personal data is described in our{" "}
        <a href="/privacy">Privacy Policy</a>. You retain ownership of your business data;
        you grant us a license to host and process it to provide the Service.
      </p>

      <h2>4. Availability</h2>
      <p>
        We strive for high uptime but do not guarantee uninterrupted access. Maintenance and
        updates may occur with reasonable notice where possible.
      </p>

      <h2>5. Limitation of liability</h2>
      <p>
        To the extent permitted by law, {siteConfig.name} is not liable for indirect or
        consequential damages arising from use of the Service.
      </p>

      <h2>6. Contact</h2>
      <p>
        Questions: <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
      </p>
    </article>
  );
}
