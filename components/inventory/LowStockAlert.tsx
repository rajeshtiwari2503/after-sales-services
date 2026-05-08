"use client";

export default function LowStockAlert() {
  const items = [
    {
      name: "Battery",

      quantity: 3,
    },

    {
      name:
        "Charging IC",

      quantity: 2,
    },
  ];

  return (
    <div className="bg-white rounded-[30px] border border-red-200 p-6">
      <h2 className="text-2xl font-black text-red-600 mb-6">
        Low Stock Alerts
      </h2>

      <div className="space-y-4">
        {items.map(
          (item) => (
            <div
              key={item.name}
              className="flex items-center justify-between bg-red-50 rounded-2xl p-4"
            >
              <div>
                <h3 className="font-bold">
                  {item.name}
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Critical Stock
                </p>
              </div>

              <div className="text-red-600 font-black text-2xl">
                {
                  item.quantity
                }
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}