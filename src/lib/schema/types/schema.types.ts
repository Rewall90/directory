/**
 * TypeScript interfaces for schema.org types
 * Based on https://schema.org specifications
 */

// Base schema type
export interface SchemaBase {
  "@context"?: string;
  "@type": string | string[];
  "@id"?: string;
}

// Organization schema
export interface OrganizationSchema extends SchemaBase {
  "@type": "Organization";
  name: string;
  legalName?: string;
  description?: string;
  url: string;
  logo?: ImageObject | string;
  foundingDate?: string;
  contactPoint?: ContactPoint[];
  sameAs?: string[];
  areaServed?: Place | string;
}

// WebSite schema
export interface WebSiteSchema extends SchemaBase {
  "@type": "WebSite";
  name: string;
  description?: string;
  url: string;
  publisher?: OrganizationReference;
  potentialAction?: SearchAction;
  inLanguage?: string | string[];
}

// WebPage schema
export interface WebPageSchema extends SchemaBase {
  "@type": "WebPage";
  name: string;
  description?: string;
  url: string;
  isPartOf?: WebSiteReference;
  about?: Thing;
  breadcrumb?: BreadcrumbReference;
  inLanguage?: string | string[];
  datePublished?: string;
  dateModified?: string;
  image?: ImageObject | ImageObject[] | string | string[];
}

// BreadcrumbList schema
export interface BreadcrumbListSchema extends SchemaBase {
  "@type": "BreadcrumbList";
  itemListElement: ListItem[];
}

// ItemList schema
export interface ItemListSchema extends SchemaBase {
  "@type": "ItemList";
  name?: string;
  description?: string;
  numberOfItems: number;
  itemListElement: ListItem[];
}

// GolfCourse schema
export interface GolfCourseSchema extends SchemaBase {
  "@type": ["GolfCourse", "SportsActivityLocation", "LocalBusiness"] | "GolfCourse";
  "@id": string;
  name: string;
  description?: string;
  url: string;
  image?: ImageObject | ImageObject[] | string | string[];
  address?: PostalAddress;
  geo?: GeoCoordinates;
  telephone?: string;
  email?: string;
  openingHoursSpecification?: OpeningHoursSpecification[];
  containedInPlace?: PlaceReference;
  hasMap?: string;
  amenityFeature?: LocationFeatureSpecification[];
  aggregateRating?: AggregateRating;
  review?: Review[];
  numberOfHoles?: number;
  priceRange?: string;
}

// Place/AdministrativeArea schema (for regions)
export interface PlaceSchema extends SchemaBase {
  "@type": "Place" | "AdministrativeArea";
  "@id": string;
  name: string;
  description?: string;
  url?: string;
  geo?: GeoCoordinates;
  containsPlace?: PlaceReference[];
  containedInPlace?: PlaceReference;
  address?: PostalAddress;
}

// Supporting types
export interface ImageObject {
  "@type": "ImageObject";
  url: string;
  width?: number;
  height?: number;
  caption?: string;
}

export interface PostalAddress {
  "@type": "PostalAddress";
  streetAddress?: string;
  addressLocality: string;
  addressRegion?: string;
  postalCode?: string;
  addressCountry: string;
}

export interface GeoCoordinates {
  "@type": "GeoCoordinates";
  latitude: number;
  longitude: number;
}

export interface ContactPoint {
  "@type": "ContactPoint";
  contactType: string;
  email?: string;
  telephone?: string;
  availableLanguage?: string[];
  areaServed?: string;
}

export interface SearchAction {
  "@type": "SearchAction";
  target: {
    "@type": "EntryPoint";
    urlTemplate: string;
  };
  "query-input": string;
}

export interface ListItem {
  "@type": "ListItem";
  position: number;
  name?: string;
  item: string | Thing;
}

export interface Thing {
  "@type"?: string;
  "@id"?: string;
  name?: string;
  url?: string;
}

export interface OpeningHoursSpecification {
  "@type": "OpeningHoursSpecification";
  dayOfWeek: string | string[];
  opens: string;
  closes: string;
}

export interface LocationFeatureSpecification {
  "@type": "LocationFeatureSpecification";
  name: string;
  value: boolean | string | number;
}

export interface AggregateRating {
  "@type": "AggregateRating";
  ratingValue: number;
  reviewCount: number;
  bestRating?: number;
  worstRating?: number;
}

export interface Review {
  "@type": "Review";
  author: {
    "@type": "Person";
    name: string;
  };
  datePublished: string;
  reviewBody: string;
  reviewRating: {
    "@type": "Rating";
    ratingValue: number;
    bestRating?: number;
    worstRating?: number;
  };
}

// Reference types (for @id linking)
export interface OrganizationReference {
  "@id": string;
}

export interface WebSiteReference {
  "@id": string;
}

export interface BreadcrumbReference {
  "@id": string;
}

export interface PlaceReference {
  "@id": string;
  name?: string;
}

// Union type for all schemas
export type Schema =
  | OrganizationSchema
  | WebSiteSchema
  | WebPageSchema
  | BreadcrumbListSchema
  | ItemListSchema
  | GolfCourseSchema
  | PlaceSchema;
