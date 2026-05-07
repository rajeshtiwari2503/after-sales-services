export default function AnalyticsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <div className="bg-white rounded-2xl border p-6">
        <p className="text-slate-500">
          SLA Compliance
        </p>

        <h2 className="text-4xl font-bold mt-3">
          94%
        </h2>
      </div>

      <div className="bg-white rounded-2xl border p-6">
        <p className="text-slate-500">
          Avg Resolution Time
        </p>

        <h2 className="text-4xl font-bold mt-3">
          12h
        </h2>
      </div>

      <div className="bg-white rounded-2xl border p-6">
        <p className="text-slate-500">
          Customer Satisfaction
        </p>

        <h2 className="text-4xl font-bold mt-3">
          4.8
        </h2>
      </div>

      <div className="bg-white rounded-2xl border p-6">
        <p className="text-slate-500">
          Active Technicians
        </p>

        <h2 className="text-4xl font-bold mt-3">
          84
        </h2>
      </div>
    </div>
  );
}