"use client";

export default function WarrantyTable() {
  const warranties = [
    {
      id: 1,
      product:
        "Samsung Display",

      customer:
        "Rahul Sharma",

      expiry:
        "2026-12-20",

      status:
        "ACTIVE",
    },
  ];

  return (
    <div className="bg-white rounded-[30px] border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-2xl font-black">
          Warranty Management
        </h2>
      </div>

      <table className="w-full">
        <thead className="bg-slate-100">
          <tr>
            <th className="p-5 text-left">
              Product
            </th>

            <th className="p-5 text-left">
              Customer
            </th>

            <th className="p-5 text-left">
              Expiry
            </th>

            <th className="p-5 text-left">
              Status
            </th>
          </tr>
        </thead>

        <tbody>
          {warranties.map(
            (item) => (
              <tr
                key={item.id}
                className="border-t border-slate-200"
              >
                <td className="p-5">
                  {item.product}
                </td>

                <td className="p-5">
                  {item.customer}
                </td>

                <td className="p-5">
                  {item.expiry}
                </td>

                <td className="p-5">
                  <span className="px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-bold">
                    {
                      item.status
                    }
                  </span>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}