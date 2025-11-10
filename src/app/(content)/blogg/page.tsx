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
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blogg/${post.slug}`}
            className="card bg-base-200 transition-shadow hover:shadow-lg"
          >
            <div className="card-body">
              <h2 className="card-title text-primary">{post.frontMatter.title}</h2>
              {post.frontMatter.description && (
                <p className="text-base-content/70">{post.frontMatter.description}</p>
              )}

              <div className="card-actions mt-4 justify-between">
                {post.frontMatter.tags && post.frontMatter.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {post.frontMatter.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="badge badge-outline badge-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {post.frontMatter.publishedAt && (
                  <span className="text-base-content/60 text-sm">
                    {new Date(post.frontMatter.publishedAt).toLocaleDateString("nb-NO", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center">
          <p className="text-base-content/60">Ingen blogginnlegg tilgjengelig ennå.</p>
        </div>
      )}
    </div>
  );
}
