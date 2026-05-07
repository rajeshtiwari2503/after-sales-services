import Sidebar from "@/components/dashboard/sidebar";
import DashboardHeader from "@/components/dashboard/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <DashboardHeader />

        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}