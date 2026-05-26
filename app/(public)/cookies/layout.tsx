import { getPageMetadata } from "@/lib/site-seo";

export const metadata = getPageMetadata("cookies");

export default function CookiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
