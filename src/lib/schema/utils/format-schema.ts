/**
 * Schema formatting utilities
 * Handles JSON stringification for schema objects
 */

import type { Schema } from "../types/schema.types";

/**
 * Format schema for production (minified)
 * Removes unnecessary whitespace to reduce HTML size
 * @param schema - Schema object to format
 */
export function formatSchemaForProduction(schema: Schema): string {
  return JSON.stringify(schema);
}

/**
 * Format schema for development (pretty-printed)
 * Makes JSON-LD easier to read in view source
 * @param schema - Schema object to format
 */
export function formatSchemaForDev(schema: Schema): string {
  return JSON.stringify(schema, null, 2);
}

/**
 * Format schema based on environment
 * Auto-detects production vs development
 * @param schema - Schema object to format
 */
export function formatSchema(schema: Schema): string {
  if (process.env.NODE_ENV === "production") {
    return formatSchemaForProduction(schema);
  }
  return formatSchemaForDev(schema);
}

/**
 * Remove undefined/null values from schema object
 * Cleans up optional properties before serialization
 * @param obj - Object to clean
 */
export function cleanSchemaObject<T extends Record<string, unknown>>(obj: T): T {
  const cleaned = { ...obj };

  Object.keys(cleaned).forEach((key) => {
    const value = cleaned[key];

    // Remove null/undefined values
    if (value === null || value === undefined) {
      delete cleaned[key];
      return;
    }

    // Recursively clean nested objects
    if (typeof value === "object" && !Array.isArray(value)) {
      cleaned[key] = cleanSchemaObject(value as Record<string, unknown>) as T[Extract<
        keyof T,
        string
      >];
    }

    // Clean arrays (remove null/undefined items)
    if (Array.isArray(value)) {
      cleaned[key] = value.filter((item) => item !== null && item !== undefined) as T[Extract<
        keyof T,
        string
      >];
    }
  });

  return cleaned;
}

/**
 * Safely stringify schema with error handling
 * @param schema - Schema object to stringify
 */
export function safeStringifySchema(schema: Schema): string {
  try {
    const cleaned = cleanSchemaObject(schema as Record<string, unknown>) as Schema;
    return formatSchema(cleaned);
  } catch (error) {
    console.error("Error stringifying schema:", error);
    // Return minimal valid JSON-LD on error
    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Thing",
    });
  }
}
