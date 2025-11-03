/**
 * Utilities for generating consistent @id values across all schemas
 * @id values are used to create entity relationships in schema.org
 */

import { SITE_CONFIG } from "../config/site-config";

/**
 * Create the @id for the Organization entity
 * Used site-wide to identify the organization
 */
export function createOrganizationId(): string {
  return `${SITE_CONFIG.baseUrl}/${SITE_CONFIG.fragments.organization}`;
}

/**
 * Create the @id for the WebSite entity
 * Used site-wide to identify the website
 */
export function createWebsiteId(): string {
  return `${SITE_CONFIG.baseUrl}/${SITE_CONFIG.fragments.website}`;
}

/**
 * Create the @id for a WebPage entity
 * @param url - Full URL of the page or relative path
 */
export function createWebPageId(url: string): string {
  const fullUrl = url.startsWith("http") ? url : `${SITE_CONFIG.baseUrl}${url}`;
  return `${fullUrl}${SITE_CONFIG.fragments.webpage}`;
}

/**
 * Create the @id for a BreadcrumbList entity
 * @param url - Full URL of the page or relative path
 */
export function createBreadcrumbId(url: string): string {
  const fullUrl = url.startsWith("http") ? url : `${SITE_CONFIG.baseUrl}${url}`;
  return `${fullUrl}${SITE_CONFIG.fragments.breadcrumb}`;
}

/**
 * Create the @id for an ItemList entity (regions)
 * @param url - Full URL of the page or relative path
 */
export function createRegionListId(url: string): string {
  const fullUrl = url.startsWith("http") ? url : `${SITE_CONFIG.baseUrl}${url}`;
  return `${fullUrl}${SITE_CONFIG.fragments.regionList}`;
}

/**
 * Create the @id for an ItemList entity (courses)
 * @param url - Full URL of the page or relative path
 */
export function createCourseListId(url: string): string {
  const fullUrl = url.startsWith("http") ? url : `${SITE_CONFIG.baseUrl}${url}`;
  return `${fullUrl}${SITE_CONFIG.fragments.courseList}`;
}

/**
 * Create the @id for a golf course entity
 * @param regionSlug - URL slug for the region
 * @param courseSlug - URL slug for the course
 */
export function createCourseId(regionSlug: string, courseSlug: string): string {
  return `${SITE_CONFIG.baseUrl}/${regionSlug}/${courseSlug}`;
}

/**
 * Create the @id for a region/place entity
 * @param regionSlug - URL slug for the region
 */
export function createRegionId(regionSlug: string): string {
  return `${SITE_CONFIG.baseUrl}/${regionSlug}`;
}

/**
 * Create a full URL from a path
 * Helper function to ensure consistent URL formatting
 * @param path - Relative path (with or without leading slash)
 */
export function createFullUrl(path: string): string {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${SITE_CONFIG.baseUrl}/${cleanPath}`;
}

/**
 * Reference to Organization entity (for linking)
 */
export function getOrganizationReference() {
  return { "@id": createOrganizationId() };
}

/**
 * Reference to WebSite entity (for linking)
 */
export function getWebsiteReference() {
  return { "@id": createWebsiteId() };
}

/**
 * Reference to BreadcrumbList entity (for linking)
 * @param url - Page URL
 */
export function getBreadcrumbReference(url: string) {
  return { "@id": createBreadcrumbId(url) };
}

/**
 * Reference to a Region/Place entity (for linking)
 * @param regionSlug - Region slug
 * @param regionName - Optional region name for enhanced reference
 */
export function getRegionReference(regionSlug: string, regionName?: string) {
  const reference: { "@id": string; name?: string } = {
    "@id": createRegionId(regionSlug),
  };
  if (regionName) {
    reference.name = regionName;
  }
  return reference;
}

/**
 * Reference to a Course entity (for linking)
 * @param regionSlug - Region slug
 * @param courseSlug - Course slug
 * @param courseName - Optional course name for enhanced reference
 */
export function getCourseReference(regionSlug: string, courseSlug: string, courseName?: string) {
  const reference: { "@id": string; name?: string } = {
    "@id": createCourseId(regionSlug, courseSlug),
  };
  if (courseName) {
    reference.name = courseName;
  }
  return reference;
}
