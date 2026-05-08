// export default function InventoryTable({
//   parts,
// }: any) {
//   return (
//     <div className="bg-white rounded-[30px] border border-sky-100 overflow-hidden">
//       <table className="w-full">
//         <thead className="bg-sky-50">
//           <tr>
//             <th className="p-4 text-left">
//               Part
//             </th>

//             <th className="p-4 text-left">
//               SKU
//             </th>

//             <th className="p-4 text-left">
//               Stock
//             </th>

//             <th className="p-4 text-left">
//               Price
//             </th>
//           </tr>
//         </thead>

//         <tbody>
//           {parts.map((part: any) => (
//             <tr
//               key={part._id}
//               className="border-t border-sky-100"
//             >
//               <td className="p-4">
//                 {part.partName}
//               </td>

//               <td className="p-4">
//                 {part.sku}
//               </td>

//               <td className="p-4">
//                 {part.stock}
//               </td>

//               <td className="p-4">
//                 ₹{part.price}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

"use client";

import {
  Pencil,
  Trash2,
} from "lucide-react";

export default function InventoryTable() {
  const inventory = [
    {
      id: 1,
      name:
        "Display Panel",

      sku: "DSP-100",

      quantity: 15,

      price: 2500,
    },

    {
      id: 2,
      name: "Battery",

      sku: "BAT-200",

      quantity: 5,

      price: 1800,
    },
  ];

  return (
    <div className="bg-white rounded-[30px] border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-2xl font-black">
          Inventory Items
        </h2>

        <button className="h-12 px-6 rounded-2xl bg-blue-600 text-white font-bold">
          Add Item
        </button>
      </div>

      <div className="overflow-auto">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="text-left p-5">
                Product
              </th>

              <th className="text-left p-5">
                SKU
              </th>

              <th className="text-left p-5">
                Quantity
              </th>

              <th className="text-left p-5">
                Price
              </th>

              <th className="text-left p-5">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {inventory.map(
              (item) => (
                <tr
                  key={item.id}
                  className="border-t border-slate-200"
                >
                  <td className="p-5 font-semibold">
                    {item.name}
                  </td>

                  <td className="p-5">
                    {item.sku}
                  </td>

                  <td className="p-5">
                    {item.quantity}
                  </td>

                  <td className="p-5">
                    ₹{item.price}
                  </td>

                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <button className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Pencil size={18} />
                      </button>

                      <button className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}