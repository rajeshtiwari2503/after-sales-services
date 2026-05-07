//  import type { Metadata } from "next";
// import "./globals.css";
// import QueryProvider from "@/providers/query-provider";
// import { Toaster } from "react-hot-toast";

// export const metadata: Metadata = {
//   title: "After Sales CRM",
//   description: "Enterprise After Sales Service CRM",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body>
//         <QueryProvider>
//           {children}
//           <Toaster position="top-right" />
//         </QueryProvider>
//       </body>
//     </html>
//   );
// }


import Providers from "@/providers/theme-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}