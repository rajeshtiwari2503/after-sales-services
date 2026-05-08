"use client";

export default function WarrantyStats() {
  const stats = [
    {
      title:
        "Active Warranty",

      value: 240,
    },

    {
      title:
        "Expired",

      value: 34,
    },

    {
      title:
        "Expiring Soon",

      value: 12,
    },

    {
      title:
        "Claims",

      value: 98,
    },
  ];

  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
      {stats.map(
        (item) => (
          <div
            key={item.title}
            className="bg-white rounded-[30px] border border-slate-200 p-6"
          >
            <p className="text-slate-500">
              {item.title}
            </p>

            <h2 className="text-5xl font-black mt-4">
              {item.value}
            </h2>
          </div>
        )
      )}
    </div>
  );
}