import { getPageMetadata } from "@/lib/site-seo";

export const metadata = getPageMetadata("register");

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
