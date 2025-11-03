/**
 * Site-wide configuration for schema.org markup
 * Single source of truth for consistent schema generation
 */

export const SITE_CONFIG = {
  // Base URLs
  baseUrl: "https://golfkart.no",
  name: "golfkart.no",
  legalName: "golfkart.no",

  // Site description
  description:
    "Utforsk 169 golfbaner i hele Norge – med oppdatert informasjon om fasiliteter, tjenester og brukeranmeldelser.",

  // Organization details
  organization: {
    name: "golfkart.no",
    legalName: "golfkart.no",
    description: "Norges mest komplette oversikt over golfbaner",
    foundingDate: "2024",
    areaServed: {
      "@type": "Country" as const,
      name: "Norge",
    },
  },

  // Contact information
  contact: {
    contactType: "customer service" as const,
    email: "petter@tegnogfarge.no",
    availableLanguage: ["no", "nb"],
  },

  // Social media profiles (add when available)
  socialProfiles: [] as string[],
  // Example: ["https://www.facebook.com/golfkart", "https://twitter.com/golfkart"]

  // Logo and images
  logo: {
    url: "/logo.svg",
    width: 200,
    height: 40,
  },

  // Default image for pages without specific images
  defaultImage: {
    url: "/og-image.jpg", // Update with actual OG image
    width: 1200,
    height: 630,
  },

  // Fragment identifiers for @id generation
  fragments: {
    organization: "#organization",
    website: "#website",
    webpage: "#webpage",
    breadcrumb: "#breadcrumb",
    regionList: "#regionlist",
    courseList: "#courselist",
  },
} as const;

/**
 * Helper to get full URL from path
 */
export function getFullUrl(path: string): string {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${SITE_CONFIG.baseUrl}/${cleanPath}`;
}

/**
 * Helper to get logo URL
 */
export function getLogoUrl(): string {
  return `${SITE_CONFIG.baseUrl}${SITE_CONFIG.logo.url}`;
}

/**
 * Helper to get default image URL
 */
export function getDefaultImageUrl(): string {
  return `${SITE_CONFIG.baseUrl}${SITE_CONFIG.defaultImage.url}`;
}
