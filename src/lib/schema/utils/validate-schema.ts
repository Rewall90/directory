/**
 * Schema validation utilities for development
 * Helps catch common errors before deployment
 */

import type { Schema } from "../types/schema.types";

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate a schema object
 * Performs basic validation checks in development mode
 * @param schema - Schema object to validate
 */
export function validateSchema(schema: Schema): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Only run in development
  if (process.env.NODE_ENV === "production") {
    return { valid: true, errors: [], warnings: [] };
  }

  // Check for required @context
  if (!schema["@context"]) {
    errors.push("Missing @context property");
  } else if (schema["@context"] !== "https://schema.org") {
    warnings.push(
      `Unexpected @context value: ${schema["@context"]}. Expected "https://schema.org"`,
    );
  }

  // Check for required @type
  if (!schema["@type"]) {
    errors.push("Missing @type property");
  }

  // Check for required properties based on type
  const schemaType = Array.isArray(schema["@type"]) ? schema["@type"][0] : schema["@type"];

  switch (schemaType) {
    case "Organization":
      if (!("name" in schema)) errors.push("Organization missing required 'name'");
      if (!("url" in schema)) errors.push("Organization missing required 'url'");
      break;

    case "WebSite":
      if (!("name" in schema)) errors.push("WebSite missing required 'name'");
      if (!("url" in schema)) errors.push("WebSite missing required 'url'");
      break;

    case "WebPage":
      if (!("name" in schema)) errors.push("WebPage missing required 'name'");
      if (!("url" in schema)) errors.push("WebPage missing required 'url'");
      break;

    case "BreadcrumbList":
      if (!("itemListElement" in schema))
        errors.push("BreadcrumbList missing required 'itemListElement'");
      break;

    case "ItemList":
      if (!("itemListElement" in schema))
        errors.push("ItemList missing required 'itemListElement'");
      break;

    case "GolfCourse":
      if (!("name" in schema)) errors.push("GolfCourse missing required 'name'");
      if (!("address" in schema))
        warnings.push("GolfCourse should have 'address' for better local SEO");
      if (!("geo" in schema))
        warnings.push("GolfCourse should have 'geo' coordinates for map results");
      break;

    case "Place":
    case "AdministrativeArea":
      if (!("name" in schema)) errors.push("Place missing required 'name'");
      break;
  }

  // Check for @id on entities that should have them
  if (
    schemaType === "GolfCourse" ||
    schemaType === "Place" ||
    schemaType === "AdministrativeArea"
  ) {
    if (!schema["@id"]) {
      warnings.push(`${schemaType} should have an @id for entity linking`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate an array of schemas
 * @param schemas - Array of schema objects
 */
export function validateSchemas(schemas: Schema[]): ValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  schemas.forEach((schema, index) => {
    const result = validateSchema(schema);
    if (!result.valid) {
      allErrors.push(`Schema ${index}: ${result.errors.join(", ")}`);
    }
    if (result.warnings.length > 0) {
      allWarnings.push(`Schema ${index}: ${result.warnings.join(", ")}`);
    }
  });

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}

/**
 * Log validation results to console (development only)
 * @param schemas - Schema or array of schemas to validate
 */
export function logValidation(schemas: Schema | Schema[]): void {
  if (process.env.NODE_ENV === "production") return;

  const schemasArray = Array.isArray(schemas) ? schemas : [schemas];
  const result = validateSchemas(schemasArray);

  if (result.errors.length > 0) {
    console.error("Schema validation errors:", result.errors);
  }

  if (result.warnings.length > 0) {
    console.warn("Schema validation warnings:", result.warnings);
  }

  if (result.valid && result.warnings.length === 0) {
    console.log("✓ All schemas validated successfully");
  }
}
