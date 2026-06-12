import { describe, it, expect } from "vitest";
import { generateFAQPageSchema } from "./faq";

describe("generateFAQPageSchema", () => {
  it("produces valid FAQPage JSON-LD", () => {
    const schema = generateFAQPageSchema([
      { question: "Hva koster et VTG-kurs?", answer: "Mellom 995 og 1 795 kr." },
    ]);
    expect(schema).toEqual({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Hva koster et VTG-kurs?",
          acceptedAnswer: { "@type": "Answer", text: "Mellom 995 og 1 795 kr." },
        },
      ],
    });
  });
});
