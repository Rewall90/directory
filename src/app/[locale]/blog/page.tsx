import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAllMDX } from "@/lib/mdx";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    openGraph: {
      locale: locale === "en" ? "en_GB" : "nb_NO",
    },
    alternates: {
      canonical: `https://golfkart.no${locale === "en" ? "/en" : ""}/blog`,
      languages: {
        nb: "https://golfkart.no/blog",
        en: "https://golfkart.no/en/blog",
        "x-default": "https://golfkart.no/blog",
      },
    },
  };
}

export default async function BloggPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("blog");
  const posts = getAllMDX("blogg", locale === "en" ? "en" : undefined);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-12">
        <h1 className="mb-4 text-4xl font-bold text-primary">{t("pageTitle")}</h1>
        <p className="text-base-content/70 text-xl">{t("subtitle")}</p>
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
              href={`/blog/${post.slug}`}
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
                  {new Date(post.frontMatter.publishedAt).toLocaleDateString(
                    locale === "en" ? "en-GB" : "nb-NO",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {posts.length === 0 && (
        <div className="text-center">
          <p className="text-base-content/60">{t("noPosts")}</p>
        </div>
      )}
    </div>
  );
}
