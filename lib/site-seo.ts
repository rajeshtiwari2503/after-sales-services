import type { Metadata } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
  "https://saastechify.com";

export const siteConfig = {
  name: "SaaS Techify",
  legalName: "SaaS Techify",
  title: "SaaS Techify — After-Sales Service Management Software",
  description:
    "Cloud after-sales CRM for brands, service centers & technicians. Ticket management, warranty, inventory, pincode routing, SLA tracking & customer portal — built for India.",
  tagline: "After-sales service management platform",
  url: siteUrl,
  locale: "en_IN",
  keywords: [
    "after sales service management",
    "field service management software",
    "warranty management system",
    "service center management",
    "technician dispatch software",
    "customer service portal",
    "spare parts inventory",
    "SLA tracking",
    "after sales CRM India",
    "SaaS Techify",
  ],
  contactEmail: "help.saastechify@gmail.com",
  twitterHandle: "@saastechify",
};

type PageKey = "home" | "privacy" | "terms" | "cookies" | "login" | "register";

const pageMeta: Record<PageKey, { title: string; description: string; path: string }> = {
  home: {
    title: siteConfig.title,
    description: siteConfig.description,
    path: "/",
  },
  privacy: {
    title: `Privacy Policy | ${siteConfig.name}`,
    description:
      "How SaaS Techify collects, uses, and protects your data on our after-sales service management platform.",
    path: "/privacy",
  },
  terms: {
    title: `Terms of Service | ${siteConfig.name}`,
    description:
      "Terms and conditions for using the SaaS Techify after-sales service management platform.",
    path: "/terms",
  },
  cookies: {
    title: `Cookie Policy | ${siteConfig.name}`,
    description:
      "Cookie usage and preferences for the SaaS Techify website and application.",
    path: "/cookies",
  },
  login: {
    title: `Sign In | ${siteConfig.name}`,
    description: "Sign in to your SaaS Techify after-sales dashboard.",
    path: "/login",
  },
  register: {
    title: `Create Account | ${siteConfig.name}`,
    description: "Register for SaaS Techify after-sales service management.",
    path: "/register",
  },
};

export function getPageMetadata(
  key: PageKey,
  overrides?: Partial<Metadata>
): Metadata {
  const page = pageMeta[key];
  const url = `${siteConfig.url}${page.path}`;

  return {
    metadataBase: new URL(siteConfig.url),
    title: page.title,
    description: page.description,
    keywords: siteConfig.keywords,
    authors: [{ name: siteConfig.name, url: siteConfig.url }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    alternates: { canonical: url },
    openGraph: {
      type: key === "home" ? "website" : "article",
      locale: siteConfig.locale.replace("_", "-"),
      url,
      siteName: siteConfig.name,
      title: page.title,
      description: page.description,
      images: [
        {
          url: "/logo13.png",
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} — After-sales platform`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: ["/logo13.png"],
    },
    robots: {
      index: key === "login" || key === "register" ? false : true,
      follow: true,
      googleBot: {
        index: key === "login" || key === "register" ? false : true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    ...overrides,
  };
}

export function jsonLdOrganization() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.legalName,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo13.png`,
    email: siteConfig.contactEmail,
    description: siteConfig.description,
    areaServed: "IN",
  };
}

export function jsonLdSoftwareApplication() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
      description: "Free trial available",
    },
    description: siteConfig.description,
    url: siteConfig.url,
    provider: {
      "@type": "Organization",
      name: siteConfig.legalName,
    },
  };
}

export function jsonLdWebSite() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/login`,
      "query-input": "required name=search_term_string",
    },
  };
}
