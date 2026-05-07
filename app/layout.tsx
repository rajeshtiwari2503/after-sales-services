//  import type { Metadata } from "next";

// import "./globals.css";

// import Providers from "@/providers/theme-provider";

// export const metadata: Metadata = {
//   title: "After Sales CRM",
//   description: "Enterprise CRM",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html
//       lang="en"
//       suppressHydrationWarning
//     >
//       <body>
//         <Providers>
//           {children}
//         </Providers>
//       </body>
//     </html>
//   );
// }

import "./globals.css";

import Providers from "@/providers/theme-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}