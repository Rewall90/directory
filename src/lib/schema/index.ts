/**
 * Schema.org markup library - Main exports
 * Centralized exports for clean imports across the application
 */

// ========================================
// Components
// ========================================
export { JsonLd, JsonLdMultiple } from "./components/JsonLd";

// ========================================
// Configuration
// ========================================
export { SITE_CONFIG, getFullUrl, getLogoUrl, getDefaultImageUrl } from "./config/site-config";

// ========================================
// Types
// ========================================
export type {
  // Schema.org types
  Schema,
  OrganizationSchema,
  WebSiteSchema,
  WebPageSchema,
  BreadcrumbListSchema,
  ItemListSchema,
  GolfCourseSchema,
  PlaceSchema,
  ImageObject,
  PostalAddress,
  GeoCoordinates,
  ContactPoint,
  SearchAction,
  ListItem,
  AggregateRating,
  Review,
  // Reference types
  OrganizationReference,
  WebSiteReference,
  BreadcrumbReference,
  PlaceReference,
} from "./types/schema.types";

export type {
  // Application data types
  BreadcrumbItem,
  PageMetadata,
  RegionData,
  CourseData,
  ReviewData,
  ListItemData,
} from "./types/site-config.types";

// ========================================
// Utilities
// ========================================

// ID creation utilities
export {
  createOrganizationId,
  createWebsiteId,
  createWebPageId,
  createBreadcrumbId,
  createRegionListId,
  createCourseListId,
  createCourseId,
  createRegionId,
  createFullUrl,
  getOrganizationReference,
  getWebsiteReference,
  getBreadcrumbReference,
  getRegionReference,
  getCourseReference,
} from "./utils/create-id";

// Validation utilities (for development)
export { validateSchema, validateSchemas, logValidation } from "./utils/validate-schema";

// Formatting utilities
export {
  formatSchema,
  formatSchemaForProduction,
  formatSchemaForDev,
  cleanSchemaObject,
  safeStringifySchema,
} from "./utils/format-schema";

// ========================================
// Generators
// ========================================

// Site-wide generators
export { generateOrganizationSchema } from "./generators/organization";
export { generateWebSiteSchema } from "./generators/website";
export {
  generateBreadcrumbSchema,
  generateHomeBreadcrumb,
  generateRegionBreadcrumb,
  generateCourseBreadcrumb,
  generateSearchBreadcrumb,
  generateRegionsOverviewBreadcrumb,
} from "./generators/breadcrumb";

// Page-specific generators
export {
  generateWebPageSchema,
  generateHomePageSchema,
  generateRegionPageSchema,
  generateSearchPageSchema,
} from "./generators/webpage";
export {
  generateItemListSchema,
  generateRegionListSchema,
  generateCourseListSchema,
  generateSearchResultsListSchema,
} from "./generators/itemlist";

// Entity generators
export { generateRegionPlaceSchema, generateBasicRegionSchema } from "./generators/place";

// Entity generators (to be created):
// export { generateGolfCourseSchema } from './generators/golf-course';

// ========================================
// Composables
// ========================================

// Homepage composable
export { getHomepageSchemas } from "./composables/homepage-schema";

// Region page composable
export { getRegionPageSchemas } from "./composables/region-page-schema";

// Regions overview page composable
export { getRegionsOverviewSchemas } from "./composables/regions-overview-schema";

// Other page composables (to be created):
// export { getCoursePageSchemas } from './composables/course-page-schema';
// export { getSearchPageSchemas } from './composables/search-page-schema';
