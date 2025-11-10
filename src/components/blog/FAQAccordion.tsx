"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
}

export function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={index}
          className="rounded-lg border border-border-subtle bg-background-surface transition-all hover:border-primary"
        >
          <button
            onClick={() => toggleItem(index)}
            className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors"
            aria-expanded={openIndex === index}
            aria-controls={`faq-answer-${index}`}
          >
            <h3 className="pr-4 text-lg font-semibold text-text-primary">{item.question}</h3>
            <svg
              className={`h-5 w-5 flex-shrink-0 text-primary transition-transform duration-200 ${
                openIndex === index ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <div
            id={`faq-answer-${index}`}
            className={`overflow-hidden transition-all duration-200 ease-in-out ${
              openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
            role="region"
            aria-labelledby={`faq-question-${index}`}
          >
            <div className="px-5 pb-4 pt-0 leading-relaxed text-text-secondary">{item.answer}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
