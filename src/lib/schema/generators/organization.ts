/**
 * Organization schema generator
 * Represents your business/website as an entity
 * Used site-wide to establish E-E-A-T and brand identity
 */

import type { OrganizationSchema } from "../types/schema.types";
import { SITE_CONFIG, getLogoUrl } from "../config/site-config";
import { createOrganizationId } from "../utils/create-id";

/**
 * Generate Organization schema
 * This should be included on every page to establish your site as an entity
 *
 * @returns OrganizationSchema object
 */
export function generateOrganizationSchema(): OrganizationSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": createOrganizationId(),

    // Basic information
    name: SITE_CONFIG.organization.name,
    legalName: SITE_CONFIG.organization.legalName,
    description: SITE_CONFIG.organization.description,
    url: SITE_CONFIG.baseUrl,

    // Logo (important for brand recognition in search)
    logo: {
      "@type": "ImageObject",
      url: getLogoUrl(),
      width: SITE_CONFIG.logo.width,
      height: SITE_CONFIG.logo.height,
    },

    // Contact information
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: SITE_CONFIG.contact.contactType,
        email: SITE_CONFIG.contact.email,
        availableLanguage: SITE_CONFIG.contact.availableLanguage as string[],
      },
    ],

    // Geographic area served
    areaServed: SITE_CONFIG.organization.areaServed,

    // Founding date (helps with trust signals)
    foundingDate: SITE_CONFIG.organization.foundingDate,

    // Social media profiles (if available)
    ...(SITE_CONFIG.socialProfiles.length > 0 && {
      sameAs: SITE_CONFIG.socialProfiles,
    }),
  };
}
