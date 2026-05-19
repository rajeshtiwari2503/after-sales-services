 

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

// import type { Metadata } from "next";
// import { Inter } from "next/font/google";
// import "./globals.css";
// import { Toaster } from "react-hot-toast";
// import Providers from "@/providers/theme-provider";

// const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "SaaS Techify — After Sales Platform",
//   description: "Enterprise after-sales service management platform",
//   icons: { icon: "/favicon.ico" },
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <body className={inter.className}>
//         <Providers>
//           {children}
//           <Toaster
//             position="top-right"
//             toastOptions={{
//               duration: 3000,
//               style: {
//                 borderRadius: "10px",
//                 fontSize: "13px",
//                 fontWeight: 500,
//               },
//               success: { iconTheme: { primary: "#6366f1", secondary: "#fff" } },
//               error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
//             }}
//           />
//         </Providers>
//       </body>
//     </html>
//   );
// }