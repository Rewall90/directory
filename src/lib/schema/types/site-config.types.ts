/**
 * Type definitions for mapping database/application data to schema.org
 * These types represent the data structures used in the application
 */

// Breadcrumb item for navigation
export interface BreadcrumbItem {
  name: string;
  url: string;
}

// Page metadata for WebPage schema
export interface PageMetadata {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
}

// Region data for Place/AdministrativeArea schema
export interface RegionData {
  name: string;
  slug: string;
  description?: string;
  courseCount?: number;
}

// Course data for GolfCourse schema
export interface CourseData {
  name: string;
  slug: string;
  description?: string;
  region: string;
  regionSlug: string;

  // Location data
  address?: {
    street?: string;
    city: string;
    postalCode?: string;
    region?: string;
  };
  latitude?: number;
  longitude?: number;

  // Contact information
  telephone?: string;
  email?: string;
  website?: string;

  // Course details
  numberOfHoles?: number;
  facilities?: string[];

  // Hours
  openingHours?: {
    dayOfWeek: string[];
    opens: string;
    closes: string;
  }[];

  // Images
  images?: string[];

  // Reviews and ratings
  rating?: {
    average: number;
    count: number;
  };
  reviews?: ReviewData[];
}

// Review data for Review schema
export interface ReviewData {
  author: string;
  date: string;
  rating: number;
  comment: string;
}

// List item for ItemList schema
export interface ListItemData {
  name: string;
  url: string;
  description?: string;
  image?: string;
}
