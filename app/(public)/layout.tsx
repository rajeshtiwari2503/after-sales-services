import PublicSiteHeader from "@/components/layout/PublicSiteHeader";
import PublicSiteFooter from "@/components/layout/PublicSiteFooter";

export default function PublicPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <PublicSiteHeader />
      <main className="flex-1">{children}</main>
      <PublicSiteFooter />
    </div>
  );
}
