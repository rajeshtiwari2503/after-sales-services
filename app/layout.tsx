 

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
import "./globals.css";
import Providers from "@/providers/theme-provider";
import ToasterProvider from "@/components/ui/toaster-provider";
import { getPageMetadata, siteConfig } from "@/lib/site-seo";

const inter = {
  className: "font-sans",
};

export const metadata: Metadata = {
  ...getPageMetadata("home"),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  icons: { icon: "/favicon.ico", apple: "/logo13.png" },
  verification: {
    // google: "your-google-search-console-verification-code",
  },
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