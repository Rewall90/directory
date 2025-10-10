import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllSlugs, getMDXBySlug } from "@/lib/mdx";
import { mdxComponents } from "@/app/mdx-components";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllSlugs("guides");
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps) {
  const params = await props.params;
  const mdxContent = getMDXBySlug("guides", params.slug);

  if (!mdxContent) {
    return {
      title: "Not Found",
    };
  }

  return {
    title: mdxContent.frontMatter.title,
    description: mdxContent.frontMatter.description,
  };
}

export default async function GuidePage(props: PageProps) {
  const params = await props.params;
  const mdxContent = getMDXBySlug("guides", params.slug);

  if (!mdxContent) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-8">
        <h1 className="mb-4 text-4xl font-bold text-primary">{mdxContent.frontMatter.title}</h1>

        {mdxContent.frontMatter.description && (
          <p className="text-base-content/70 mb-4 text-xl">{mdxContent.frontMatter.description}</p>
        )}

        <div className="text-base-content/60 flex flex-wrap items-center gap-4 text-sm">
          {mdxContent.frontMatter.author && <span>By {mdxContent.frontMatter.author}</span>}
          {mdxContent.frontMatter.publishedAt && (
            <span>
              Published on{" "}
              {new Date(mdxContent.frontMatter.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          )}
        </div>

        {mdxContent.frontMatter.tags && mdxContent.frontMatter.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {mdxContent.frontMatter.tags.map((tag) => (
              <span key={tag} className="badge badge-outline badge-primary">
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="prose-lg prose max-w-none">
        <MDXRemote source={mdxContent.content} components={mdxComponents} />
      </div>
    </article>
  );
}
