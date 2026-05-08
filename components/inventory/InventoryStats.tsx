"use client";

export default function InventoryStats() {
  const stats = [
    {
      title:
        "Total Products",

      value: 240,
    },

    {
      title:
        "Low Stock",

      value: 12,
    },

    {
      title:
        "Out of Stock",

      value: 4,
    },

    {
      title:
        "Inventory Value",

      value: "₹4.8L",
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