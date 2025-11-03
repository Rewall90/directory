/**
 * Reusable React component for rendering JSON-LD schema markup
 */

import type { Schema } from "../types/schema.types";
import { safeStringifySchema } from "../utils/format-schema";
import { validateSchema } from "../utils/validate-schema";

interface JsonLdProps {
  schema: Schema;
  /**
   * Enable validation in development (default: true)
   */
  validate?: boolean;
}

/**
 * JsonLd component renders structured data as JSON-LD script tag
 *
 * Usage:
 * ```tsx
 * <JsonLd schema={organizationSchema} />
 * ```
 */
export function JsonLd({ schema, validate = true }: JsonLdProps) {
  // Validate in development
  if (process.env.NODE_ENV === "development" && validate) {
    const result = validateSchema(schema);

    if (result.errors.length > 0) {
      console.error("JSON-LD Schema validation errors:", result.errors);
    }

    if (result.warnings.length > 0) {
      console.warn("JSON-LD Schema validation warnings:", result.warnings);
    }
  }

  // Stringify and render
  const jsonLdString = safeStringifySchema(schema);

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString }} />;
}

/**
 * Helper component to render multiple schemas at once
 *
 * Usage:
 * ```tsx
 * <JsonLdMultiple schemas={[orgSchema, websiteSchema, pageSchema]} />
 * ```
 */
export function JsonLdMultiple({ schemas }: { schemas: Schema[] }) {
  return (
    <>
      {schemas.map((schema, index) => (
        <JsonLd key={index} schema={schema} />
      ))}
    </>
  );
}
