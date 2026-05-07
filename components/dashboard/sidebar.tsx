// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { sidebarItems } from "@/constants/sidebar";
// import clsx from "clsx";

// export default function Sidebar() {
//   const pathname = usePathname();

//   return (
//     <aside className="w-[280px] bg-slate-950 text-white min-h-screen p-6">
//       <div className="mb-10">
//         <h1 className="text-2xl font-bold">
//           After Sales CRM
//         </h1>
//       </div>

//       <nav className="space-y-3">
//         {sidebarItems.map((item) => {
//           const Icon = item.icon;

//           return (
//             <Link
//               key={item.href}
//               href={item.href}
//               className={clsx(
//                 "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
//                 pathname === item.href
//                   ? "bg-blue-600"
//                   : "hover:bg-slate-800"
//               )}
//             >
//               <Icon size={20} />
//               <span>{item.title}</span>
//             </Link>
//           );
//         })}
//       </nav>
//     </aside>
//   );
// }

"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

export default function Sidebar() {
  const [open, setOpen] =
    useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-black text-white p-3 rounded-xl"
      >
        <Menu />
      </button>

      <aside
        className={`fixed lg:static top-0 left-0 z-40 h-screen w-[280px] bg-slate-950 text-white p-6 transition-all ${
          open
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        Sidebar
      </aside>
    </>
  );
}