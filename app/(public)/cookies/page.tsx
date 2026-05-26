import { siteConfig } from "@/lib/site-seo";

export default function CookiesPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 py-14 sm:py-20 prose prose-slate">
      <h1 className="text-4xl font-black text-slate-900 not-prose">Cookie Policy</h1>
      <p className="text-slate-500 text-sm not-prose mt-2">Last updated: May 18, 2026</p>

      <p>
        {siteConfig.name} uses cookies and similar technologies to keep you signed in, remember
        preferences, and understand how the marketing site is used.
      </p>

      <h2>Essential cookies</h2>
      <p>
        Required for authentication (e.g. session tokens), security, and core application
        functionality. These cannot be disabled while using the app.
      </p>

      <h2>Analytics (optional)</h2>
      <p>
        We may use privacy-friendly analytics on the public website to improve content and
        conversion. You can control non-essential cookies via your browser settings.
      </p>

      <h2>Managing cookies</h2>
      <p>
        Most browsers let you block or delete cookies. Blocking essential cookies may prevent
        login and dashboard access.
      </p>

      <p>
        Contact: <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
      </p>
    </article>
  );
}
