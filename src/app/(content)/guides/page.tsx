import Link from "next/link";
import { getAllMDX } from "@/lib/mdx";

export const metadata = {
  title: "Guides - Golf Directory",
  description: "Browse our collection of golf guides and resources",
};

export default function GuidesPage() {
  const guides = getAllMDX("guides");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-12">
        <h1 className="mb-4 text-4xl font-bold text-primary">Golf Guides</h1>
        <p className="text-base-content/70 text-xl">
          Explore our comprehensive collection of golf guides and resources
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {guides.map((guide) => (
          <Link
            key={guide.slug}
            href={`/guides/${guide.slug}`}
            className="card bg-base-200 transition-shadow hover:shadow-lg"
          >
            <div className="card-body">
              <h2 className="card-title text-primary">{guide.frontMatter.title}</h2>
              {guide.frontMatter.description && (
                <p className="text-base-content/70">{guide.frontMatter.description}</p>
              )}

              <div className="card-actions mt-4 justify-between">
                {guide.frontMatter.tags && guide.frontMatter.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {guide.frontMatter.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="badge badge-outline badge-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {guide.frontMatter.publishedAt && (
                  <span className="text-base-content/60 text-sm">
                    {new Date(guide.frontMatter.publishedAt).toLocaleDateString("en-US", {
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

      {guides.length === 0 && (
        <div className="text-center">
          <p className="text-base-content/60">No guides available yet.</p>
        </div>
      )}
    </div>
  );
}
