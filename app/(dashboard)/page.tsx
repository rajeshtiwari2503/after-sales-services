import StatsCard from "@/components/dashboard/stats-card";
import TicketsChart from "@/components/dashboard/tickets-chart";

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold">
          Dashboard Overview
        </h1>

        <p className="text-slate-500 mt-2">
          Welcome back to your CRM panel.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="mt-10">
  <TicketsChart />
</div>
        <StatsCard
          title="Total Tickets"
          value="1,248"
        />

        <StatsCard
          title="Open Complaints"
          value="328"
        />

        <StatsCard
          title="Technicians"
          value="84"
        />

        <StatsCard
          title="Service Centers"
          value="16"
        />
      </div>
    </div>
  );
}