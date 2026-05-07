export default function DashboardHeader() {
  return (
    <header className="bg-white border-b px-8 py-5 flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">
          Dashboard
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-slate-200" />
      </div>
    </header>
  );
}