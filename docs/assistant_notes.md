# Assistant Notes: Tech Stack

## Summary

- Core framework: Next.js 14 using the App Router.
- Language & styling: TypeScript with Tailwind CSS and DaisyUI component library.
- Content strategy: MDX files stored under `/content`, compiled at build time with Next.js MDX (`@next/mdx`).
- Data storage: Vercel Postgres for golf course data.
- Asset storage: Prefer Vercel Blob for images; `/public` is acceptable for static assets.
- Hosting & delivery: Deploy on Vercel (same account as Postgres/Blob).

## Stack Overview

| Layer                 | Technology                | Purpose / Notes                                                                                                        |
| --------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Application framework | Next.js 14 (App Router)   | File-system routing, streaming, React Server Components. Keep `/app` as the primary entry point.                       |
| Language              | TypeScript                | End-to-end typing in components, data fetching, and server actions. Enforce strict mode.                               |
| Styling               | Tailwind CSS              | Utility-first styling; configure `tailwind.config.ts` to include DaisyUI plugin.                                       |
| UI components         | DaisyUI                   | Themeable Tailwind component presets; align with the design palette for consistency.                                   |
| Content authoring     | MDX + `/content`          | Write long-form pages in MDX; colocate by slug under `/content/<section>/<slug>.mdx`.                                  |
| MDX processing        | `@next/mdx` (Next.js MDX) | Built-in MDX plugin, compiles local `/content` files at build time; pair with dynamic route generation as needed.      |
| Data layer            | Vercel Postgres           | Store golf course metadata, stats, and relational data. Use `@vercel/postgres` client or Prisma configured for Vercel. |
| Media storage         | Vercel Blob (primary)     | Store user-uploaded or frequently changing images. Public `/public` directory is fine for immutable assets.            |
| Hosting               | Vercel                    | One-click deployments, environment variables, serverless/edge runtime alignment with Next.js.                          |

## Implementation Notes

### Next.js 14 (App Router)

- Organize routes under `/app`; leverage `layout.tsx` for shared UI and metadata.
- Use Server Components by default; opt into Client Components only when interactivity is required.
- Fetch data through route handlers, server actions, or `cache` utilities as appropriate for Vercel Postgres.

### TypeScript, Tailwind, DaisyUI

- Configure `tsconfig.json` with `strict: true` to catch runtime issues early.
- Tailwind: ensure `content` paths include `/app`, `/components`, and `/content` MDX files.
- DaisyUI: define the project theme in `tailwind.config.ts`; restrict arbitrary class usage where DaisyUI covers the pattern.
- ESLint: `import/no-default-export` is enforced repo-wide with overrides for Next.js route entrypoints; update `eslint.config.mjs` if new defaults are required.

### MDX Workflow

- Keep MDX files under `/content`. Separate metadata via front matter for title, description, tags, and hero image references.
- We standardize on `@next/mdx` for compile-time transforms of local content. Reach for `next-mdx-remote` only if future requirements demand runtime-sourced MDX.
- Rationale: `@next/mdx` integrates directly with the App Router build pipeline, keeps compilation static, and avoids shipping MDX parsing code to the client.
- Provide shared MDX components (for example, `app/mdx-components.tsx`) to handle typography, callouts, and media embeds consistently.

**Installation checklist**

- `npm install @next/mdx @mdx-js/react remark-gfm rehype-slug gray-matter`
- Update `tsconfig.json` includes if you import from `/content` using path aliases.

**Next.js configuration** (`next.config.mjs`)

```ts
import createMDX from "@next/mdx";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";

const withMDX = createMDX({
  extension: /\\.mdx?$/,
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug],
  },
});

const nextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  experimental: {
    mdxRs: true,
  },
};

export default withMDX(nextConfig);
```

**MDX provider**

- Create `app/mdx-provider.tsx` that wraps pages or layouts needing MDX components.

```tsx
"use client";

import { MDXProvider } from "@mdx-js/react";
import { MDXComponents } from "./mdx-components";

export function MdxProvider({ children }: { children: React.ReactNode }) {
  return <MDXProvider components={MDXComponents}>{children}</MDXProvider>;
}
```

- Define `app/mdx-components.tsx` exporting an `MDXComponents` map for typography, links, callouts, etc., and reuse it across MDX renderers.

**Content loading**

- Add `lib/mdx.ts` helpers that read from `/content`, parse front matter, and cache results with `cache()` for reuse across server components.

```ts
import { cache } from "react";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

interface MdxPage {
  content: string;
  frontmatter: Record<string, unknown>;
}

export const getMdxPage = cache(async (slug: string): Promise<MdxPage> => {
  const filePath = path.join(process.cwd(), "content", `${slug}.mdx`);
  const file = await fs.readFile(filePath, "utf8");
  const { content, data } = matter(file);
  return { content, frontmatter: data };
});
```

- For static routes, import MDX modules directly and leverage Next.js static generation. For dynamic routes, pair the helper above with `compileMDX` or `next-mdx-remote` only when runtime sources are unavoidable.

**Optional tooling**

- Add `remark-lint` or Prettier MDX plugins if the editorial workflow needs formatting guarantees.
- Enable `contentlayer` or similar only if we later require schema validation across MDX documents.

### Data & Assets

- Model golf course entities in Vercel Postgres with clear relationships (courses, holes, stats, user favorites if needed).
- Use migrations (Prisma or drizzle-kit) to version schema changes; store migration files in repo.
- For images that need CDN-level caching or user uploads, use Vercel Blob. Reserve `/public` for brand assets or rarely changing files.

### Hosting & DevOps

- Default deployment target is Vercel; use Preview branches for feature QA, Production for stable releases.
- Configure environment variables (`POSTGRES_URL`, `BLOB_READ_WRITE_TOKEN`, etc.) via Vercel dashboard.
- Enable Next.js analytics and Vercel speed insights when available.

## Working Agreements

- Treat this file as the canonical reference for stack decisions. Update it whenever the stack changes or tooling is swapped.
- When starting new tasks, skim this document first so implementation choices align with the agreed stack.

## Layer 02: create-next-app prompts

- pnpm create next-app command: pnpm create next-app@latest golf-directory --ts --app --tailwind true --turbopack true --eslint false --src-dir false --import-alias "@/\*"
- Tailwind CSS: Yes (explicit via --tailwind true)
- Turbopack: Yes (explicit via --turbopack true)
- ESLint: Disabled (--eslint false)
- src directory: Disabled (--src-dir false)
- Import alias: @/\*
- Additional setup: Configured `turbopack.root` in `next.config.ts` to pin the workspace root to this project and silence lockfile warnings.
