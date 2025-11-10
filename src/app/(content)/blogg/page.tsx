import Link from "next/link";
import { getAllMDX } from "@/lib/mdx";

export const metadata = {
  title: "Blogg - golfkart.no",
  description: "Les våre blogginnlegg om golfbaner, tips og nyheter fra golfverdenen i Norge",
};

export default function BloggPage() {
  const posts = getAllMDX("blogg");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-12">
        <h1 className="mb-4 text-4xl font-bold text-primary">Blogg</h1>
        <p className="text-base-content/70 text-xl">
          Les våre artikler om golfbaner, tips og nyheter fra golfverdenen
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => {
          // Use seoDescription if available, otherwise strip HTML from description
          const displayDescription: string =
            (post.frontMatter.seoDescription as string) ||
            (post.frontMatter.description as string)?.replace(/<[^>]*>/g, "") ||
            "";

          return (
            <Link
              key={post.slug}
              href={`/blogg/${post.slug}`}
              className="border-border-default group flex flex-col rounded-lg border bg-background-surface p-6 transition-all hover:border-primary hover:shadow-md"
            >
              <h2 className="mb-3 text-xl font-semibold text-text-primary group-hover:text-primary">
                {post.frontMatter.title}
              </h2>

              {displayDescription && (
                <p className="mb-4 line-clamp-3 flex-1 text-text-secondary">{displayDescription}</p>
              )}

              {post.frontMatter.publishedAt && (
                <span className="text-sm text-text-tertiary">
                  {new Date(post.frontMatter.publishedAt).toLocaleDateString("nb-NO", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {posts.length === 0 && (
        <div className="text-center">
          <p className="text-base-content/60">Ingen blogginnlegg tilgjengelig ennå.</p>
        </div>
      )}
    </div>
  );
}
