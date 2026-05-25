 

// import "./globals.css";

// import Providers from "@/providers/theme-provider";

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
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

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
 
import Providers from "@/providers/theme-provider";
import ToasterProvider from "@/components/ui/toaster-provider";

const inter = {
  className: "font-sans",
};

export const metadata: Metadata = {
  title: "SaaS Techify — After Sales Platform",
  description: "Enterprise after-sales service management platform",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
             <ToasterProvider />
        </Providers>
      </body>
    </html>
  );
}