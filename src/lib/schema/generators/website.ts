/**
 * WebSite schema generator
 * Represents the website as a searchable entity
 * Enables sitelinks search box in Google search results
 */

import type { WebSiteSchema } from "../types/schema.types";
import { SITE_CONFIG } from "../config/site-config";
import { createWebsiteId, getOrganizationReference } from "../utils/create-id";

/**
 * Generate WebSite schema with SearchAction
 * Include on homepage (and optionally all pages) to enable site search in SERPs
 *
 * @returns WebSiteSchema object
 */
export function generateWebSiteSchema(): WebSiteSchema {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": createWebsiteId(),

    // Basic information
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.baseUrl,

    // Link to organization (entity relationship)
    publisher: getOrganizationReference(),

    // Language
    inLanguage: ["nb", "no"],

    // SearchAction - enables sitelinks search box in Google
    // This allows users to search your site directly from Google results
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        // The URL template where {search_term_string} will be replaced with user's query
        urlTemplate: `${SITE_CONFIG.baseUrl}/search?q={search_term_string}`,
      },
      // Tells Google what parameter name to use
      "query-input": "required name=search_term_string",
    },
  };
}
