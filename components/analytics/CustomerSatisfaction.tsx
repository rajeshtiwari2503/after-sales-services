export default function CustomerSatisfaction() {
  return (
    <div className="bg-white rounded-[30px] border border-sky-100 p-6">
      <h2 className="text-2xl font-black mb-6">
        Customer Satisfaction
      </h2>

      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold">
              Positive Reviews
            </p>

            <p className="font-bold">
              92%
            </p>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
            <div className="w-[92%] h-full bg-blue-500" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold">
              SLA Success
            </p>

            <p className="font-bold">
              87%
            </p>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
            <div className="w-[87%] h-full bg-cyan-500" />
          </div>
        </div>
      </div>
    </div>
  );
}