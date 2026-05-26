import Link from "next/link";
import Image from "next/image";
import PublicSiteFooter from "@/components/layout/PublicSiteFooter";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/logo13.png"
              alt="SaaS Techify — Home"
              width={160}
              height={56}
              className="h-8 sm:h-9 w-auto object-contain"
              priority
            />
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/" className="text-slate-600 hover:text-indigo-600 font-medium hidden sm:inline">
              Home
            </Link>
            <Link href="/privacy" className="text-slate-500 hover:text-indigo-600 hidden md:inline">
              Privacy
            </Link>
            <Link
              href="/register"
              className="text-indigo-600 font-semibold hover:text-indigo-700"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>
      <div className="flex-1">{children}</div>
      <PublicSiteFooter />
    </div>
  );
}
