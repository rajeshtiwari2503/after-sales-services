"use client";

export default function ReportsPage() {
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="bg-white rounded-[30px] border border-slate-200 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black">
              Reports
            </h1>

            <p className="text-slate-500 mt-3">
              Export enterprise reports and analytics
            </p>
          </div>

          <button className="h-14 px-8 rounded-2xl bg-blue-600 text-white font-bold">
            Export Report
          </button>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mt-10">
          {[
            "Ticket Reports",
            "Revenue Reports",
            "SLA Reports",
            "Technician Reports",
          ].map((item) => (
            <div
              key={item}
              className="border border-slate-200 rounded-3xl p-6"
            >
              <h3 className="text-xl font-black">
                {item}
              </h3>

              <p className="text-slate-500 mt-3 leading-7">
                Download detailed enterprise level reports.
              </p>

              <button className="mt-6 h-12 px-5 rounded-xl bg-slate-100 font-semibold">
                Generate
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}