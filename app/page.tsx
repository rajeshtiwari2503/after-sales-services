import LandingPage from "@/components/landing/LandingPage";
import {
  getPageMetadata,
  jsonLdOrganization,
  jsonLdSoftwareApplication,
  jsonLdWebSite,
} from "@/lib/site-seo";

export const metadata = getPageMetadata("home");

export default function HomePage() {
  const structuredData = [
    jsonLdOrganization(),
    jsonLdSoftwareApplication(),
    jsonLdWebSite(),
  ];

  return (
    <>
      {structuredData.map((data, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
      <LandingPage />
    </>
  );
}
