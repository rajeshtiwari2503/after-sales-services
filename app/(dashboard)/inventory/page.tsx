// "use client";

// import { useEffect, useState } from "react";

// import InventoryTable from "@/components/inventory/InventoryTable";

// export default function InventoryPage() {
//   const [parts, setParts] =
//     useState([]);

//   useEffect(() => {
//     fetchInventory();
//   }, []);

//   const fetchInventory =
//     async () => {
//       try {
//         const res = await fetch(
//           "/api/inventory"
//         );

//         const data =
//           await res.json();

//         setParts(data);
//       } catch (error) {
//         console.log(error);
//       }
//     };

//   return (
//     <div className="p-6 bg-slate-50 min-h-screen">
//       <div className="flex items-center justify-between mb-8">
//         <h1 className="text-4xl font-black">
//           Inventory
//         </h1>

//         <button className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-semibold">
//           Add Part
//         </button>
//       </div>

//       <InventoryTable parts={parts} />
//     </div>
//   );
// }

"use client";

import InventoryTable from "@/components/inventory/InventoryTable";

import InventoryStats from "@/components/inventory/InventoryStats";

export default function InventoryPage() {
  return (
    <div className="p-6 bg-slate-50 min-h-screen space-y-6">
      <InventoryStats />

      <InventoryTable />
    </div>
  );
}