import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-seo";

export const metadata: Metadata = {
  title: `Reset Password | ${siteConfig.name}`,
  description: "Reset your SaaS Techify account password.",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
