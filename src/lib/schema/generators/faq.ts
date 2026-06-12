/**
 * FAQPage schema generator
 * Creates structured Q&A markup for frequently asked questions
 * Helps Google show rich FAQ results in search
 */

import type { FAQPageSchema, Question } from "../types/schema.types";
import type { FAQEntry } from "../types/site-config.types";

/**
 * Generate FAQPage schema from question/answer entries
 *
 * @param entries - Array of FAQ entries (question + answer)
 * @returns FAQPageSchema object
 *
 * @example
 * ```ts
 * const schema = generateFAQPageSchema([
 *   { question: "Hva koster et VTG-kurs?", answer: "Mellom 995 og 1 795 kr." },
 * ]);
 * ```
 */
export function generateFAQPageSchema(entries: FAQEntry[]): FAQPageSchema {
  // Convert entries to schema.org Question format
  const questions: Question[] = entries.map((entry) => ({
    "@type": "Question",
    name: entry.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: entry.answer,
    },
  }));

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions,
  };
}
