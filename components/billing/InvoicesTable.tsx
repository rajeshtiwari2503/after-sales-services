"use client";

export default function InvoicesTable() {
  return (
    <div className="bg-white rounded-[30px] border border-slate-200 p-6">
      <h2 className="text-2xl font-black mb-6">
        Invoices
      </h2>

      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left p-4">
              Invoice
            </th>

            <th className="text-left p-4">
              Amount
            </th>

            <th className="text-left p-4">
              Status
            </th>
          </tr>
        </thead>

        <tbody>
          <tr className="border-t border-slate-200">
            <td className="p-4">
              INV-1001
            </td>

            <td className="p-4">
              ₹4999
            </td>

            <td className="p-4">
              Paid
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}