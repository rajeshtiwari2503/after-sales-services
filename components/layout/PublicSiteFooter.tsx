import Link from "next/link";
import Image from "next/image";

export default function PublicSiteFooter() {
  return (
    <footer className="border-t border-slate-200/70 bg-gradient-to-b from-white via-[#f8fbff] to-[#eef4ff]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 pb-10 border-b border-slate-200/70">
          <div className="col-span-2 sm:col-span-4 lg:col-span-2">
            <Link href="/" className="inline-flex mb-4">
              <Image
                src="/logo13.png"
                alt="SaaS Techify"
                width={200}
                height={72}
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-slate-600 max-w-md leading-relaxed">
              After-sales service management for brands, service centers, technicians, and customers across India.
            </p>
          </div>

          {[
            {
              title: "Product",
              links: [
                ["/#features", "Features"],
                ["/#pricing", "Pricing"],
                ["/#how", "How it works"],
                ["/#faq", "FAQ"],
              ],
            },
            {
              title: "Company",
              links: [
                ["/#contact", "Contact"],
                ["/login", "Sign in"],
                ["/register", "Register"],
                ["/privacy", "Privacy"],
                ["/terms", "Terms"],
                ["/cookies", "Cookies"],
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map(([href, label]) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-slate-600 hover:text-indigo-600 transition"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} SaaS Techify. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/privacy" className="hover:text-indigo-600">Privacy</Link>
            <Link href="/terms" className="hover:text-indigo-600">Terms</Link>
            <Link href="/cookies" className="hover:text-indigo-600">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
