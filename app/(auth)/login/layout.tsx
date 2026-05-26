import { getPageMetadata } from "@/lib/site-seo";

export const metadata = getPageMetadata("login");

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
