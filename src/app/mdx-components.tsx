import type { MDXComponents } from "mdx/types";
import { FAQAccordion } from "@/components/blog/FAQAccordion";
import { RankingTable } from "@/components/blog/RankingTable";
import { Top10RankingTable } from "@/components/blog/Top10RankingTable";
import { BlogCourseCard } from "@/components/blog/BlogCourseCard";

// MDX components configuration for styling
export const mdxComponents: MDXComponents = {
  // Custom components
  FAQAccordion,
  RankingTable,
  Top10RankingTable,
  BlogCourseCard,
  // Headings with custom styling
  h1: ({ children }) => <h1 className="mb-6 mt-8 text-4xl font-bold text-primary">{children}</h1>,
  h2: ({ children }) => (
    <h2 className="mb-4 mt-6 text-3xl font-semibold text-primary">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-3 mt-5 text-2xl font-semibold text-primary">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="mb-2 mt-4 text-xl font-semibold text-primary">{children}</h4>
  ),

  // Paragraphs
  p: ({ children }) => <p className="mb-4 leading-relaxed text-base-content">{children}</p>,

  // Links
  a: ({ href, children }) => (
    <a
      href={href}
      className="link link-primary font-medium hover:underline"
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  ),

  // Lists
  ul: ({ children }) => <ul className="mb-4 ml-6 list-disc space-y-2">{children}</ul>,
  ol: ({ children }) => <ol className="mb-4 ml-6 list-decimal space-y-2">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed text-base-content">{children}</li>,

  // Blockquotes
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-primary bg-base-200 py-2 pl-4 pr-4 italic">
      {children}
    </blockquote>
  ),

  // Code blocks
  pre: ({ children }) => (
    <pre className="mb-4 overflow-x-auto rounded-lg bg-base-300 p-4">{children}</pre>
  ),
  code: ({ children }) => (
    <code className="rounded bg-base-300 px-1.5 py-0.5 font-mono text-sm">{children}</code>
  ),

  // Tables
  table: ({ children }) => (
    <div className="mb-4 overflow-x-auto">
      <table className="table">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-base-200">{children}</thead>,
  th: ({ children }) => <th className="font-semibold">{children}</th>,
  td: ({ children }) => <td>{children}</td>,

  // Horizontal rule
  hr: () => <hr className="my-8 border-base-300" />,

  // Strong and emphasis
  strong: ({ children }) => <strong className="font-bold text-primary">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
};

// Hook for client components (if needed)
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...mdxComponents,
    ...components,
  };
}
