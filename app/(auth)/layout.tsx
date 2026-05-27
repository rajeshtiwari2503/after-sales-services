import Link from "next/link";
import Image from "next/image";
import PublicSiteFooter from "@/components/layout/PublicSiteFooter";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex -ml-5  items-center shrink-0">
              <Image
                         src="/logo13.png"
                         alt="SaaS Techify — after-sales service management software"
                         width={220}
                         height={80}
                         priority
                         className="h-9 sm:h-11 md:h-[58px] lg:h-[68px] w-auto max-w-full object-contain drop-shadow-[0_8px_25px_rgba(59,130,246,0.35)] hover:drop-shadow-[0_10px_35px_rgba(168,85,247,0.45)] hover:scale-[1.02] transition-all duration-300"
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
