import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAllSlugs, getMDXBySlug } from "@/lib/mdx";
import { mdxComponents } from "@/app/mdx-components";
import { routing } from "@/i18n/routing";
import Script from "next/script";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

interface FrontMatter {
  title: string;
  seoTitle?: string;
  description?: string;
  seoDescription?: string;
  publishedAt?: string;
  updatedAt?: string;
  author?: string;
  tags?: string[];
  image?: string;
  imageAlt?: string;
}

// Extract FAQ items from MDX source for FAQPage schema
function extractFAQItems(mdxSource: string): { question: string; answer: string }[] {
  const faqMatch = mdxSource.match(/<FAQAccordion\s+items=\{(\[[\s\S]*?\])}\s*\/>/);
  if (!faqMatch) return [];

  try {
    // Clean the JS object literal into valid JSON
    const cleaned = faqMatch[1]
      .replace(/\n\s*/g, " ")
      .replace(/question:\s*"/g, '"question": "')
      .replace(/answer:\s*"/g, '"answer": "')
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]");
    return JSON.parse(cleaned);
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  return routing.locales.flatMap((locale) => {
    const localeParam = locale === "en" ? "en" : undefined;
    const slugs = getAllSlugs("blogg", localeParam);
    return slugs.map((slug) => ({ locale, slug }));
  });
}

export async function generateMetadata(props: PageProps) {
  const params = await props.params;
  const { locale, slug } = params;
  const t = await getTranslations({ locale, namespace: "blog" });
  const localeParam = locale === "en" ? "en" : undefined;
  const mdxContent = getMDXBySlug("blogg", slug, localeParam);

  if (!mdxContent) {
    return {
      title: t("notFound"),
    };
  }

  // Use seoTitle if available, otherwise fall back to title
  const metaTitle = mdxContent.frontMatter.seoTitle || mdxContent.frontMatter.title;

  // Use seoDescription if available, otherwise strip HTML tags from description for meta tags
  const metaDescription =
    mdxContent.frontMatter.seoDescription ||
    mdxContent.frontMatter.description?.replace(/<[^>]*>/g, "") ||
    "";

  // Resolve the alternate locale slug for hreflang
  const alternateSlug = (mdxContent.frontMatter.alternateSlug as string) || slug;
  const nbSlug = locale === "en" ? alternateSlug : slug;
  const enSlug = locale === "en" ? slug : alternateSlug;

  return {
    title: metaTitle,
    description: metaDescription,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: "article",
      locale: locale === "en" ? "en_GB" : "nb_NO",
      publishedTime: mdxContent.frontMatter.publishedAt,
      authors: [mdxContent.frontMatter.author || "golfkart.no"],
      url: `https://golfkart.no${locale === "en" ? "/en" : ""}/blog/${slug}`,
      ...(typeof mdxContent.frontMatter.image === "string"
        ? {
            images: [
              {
                url: `https://golfkart.no${mdxContent.frontMatter.image.replace(".webp", "-og.jpg")}`,
                width: 1200,
                height: 630,
                alt: mdxContent.frontMatter.imageAlt || metaTitle,
              },
            ],
          }
        : {}),
    },
    alternates: {
      canonical: `https://golfkart.no${locale === "en" ? "/en" : ""}/blog/${slug}`,
      languages: {
        nb: `https://golfkart.no/blog/${nbSlug}`,
        en: `https://golfkart.no/en/blog/${enSlug}`,
        "x-default": `https://golfkart.no/blog/${nbSlug}`,
      },
    },
  };
}

// Generate structured data for SEO
function generateStructuredData(
  slug: string,
  frontMatter: FrontMatter,
  locale: string,
  mdxSource: string,
) {
  const baseUrl = "https://golfkart.no";
  const isEn = locale === "en";

  // Use seoTitle if available, otherwise fall back to title
  const structuredTitle = frontMatter.seoTitle || frontMatter.title;

  // Use seoDescription if available, otherwise strip HTML tags from description
  const structuredDescription =
    frontMatter.seoDescription || frontMatter.description?.replace(/<[^>]*>/g, "") || "";

  // Determine articleSection from tags
  const tagToSection: Record<string, string> = {
    reiseguide: "Golf Travel",
    "travel-guide": "Golf Travel",
    golfbaner: "Golf Courses",
    "golf-courses": "Golf Courses",
    rangering: "Golf Rankings",
    ranking: "Golf Rankings",
  };
  const articleSection =
    frontMatter.tags?.reduce<string | null>(
      (found, tag) => found || tagToSection[tag] || null,
      null,
    ) || "Golf";

  // Format date with timezone for ISO 8601 compliance
  const formatDate = (date?: string) => (date ? `${date}T00:00:00+01:00` : undefined);

  // Build image array with multiple aspect ratios (16:9, 4:3, 1:1) per Google recommendations
  const imageBaseName = frontMatter.image?.replace(".webp", "");
  const imageArray = frontMatter.image
    ? [
        `${baseUrl}${imageBaseName}-og.jpg`,
        `${baseUrl}${imageBaseName}-4x3.jpg`,
        `${baseUrl}${imageBaseName}-1x1.jpg`,
      ]
    : undefined;

  // Article Schema (BlogPosting for blog content)
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: structuredTitle,
    description: structuredDescription,
    inLanguage: isEn ? "en" : "nb",
    articleSection,
    author: {
      "@type": "Organization",
      name: frontMatter.author || "golfkart.no",
      url: baseUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "golfkart.no",
      url: baseUrl,
    },
    datePublished: formatDate(frontMatter.publishedAt),
    dateModified: formatDate(frontMatter.updatedAt || frontMatter.publishedAt),
    ...(imageArray && { image: imageArray }),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}${isEn ? "/en" : ""}/blog/${slug}`,
    },
  };

  // BreadcrumbList schema — all blog posts
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: isEn ? "Home" : "Hjem",
        item: isEn ? `${baseUrl}/en` : baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: isEn ? "Blog" : "Blogg",
        item: `${baseUrl}${isEn ? "/en" : ""}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: frontMatter.title,
      },
    ],
  };

  // FAQPage schema — auto-extracted from MDX content
  const faqItems = extractFAQItems(mdxSource);
  const faqSchema =
    faqItems.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }
      : null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const schemas: any[] = [articleSchema, breadcrumbSchema];
  if (faqSchema) schemas.push(faqSchema);

  // Add ranking-specific schema if this is the best courses post
  const isBestCoursesPost = slug === "beste-golfbaner-norge" || slug === "best-golf-courses-norway";

  if (isBestCoursesPost) {
    const courseUrl = (region: string, nbSlug: string, enSlug: string) =>
      `${baseUrl}${isEn ? "/en" : ""}/${region}/${isEn ? enSlug : nbSlug}`;

    const itemListSchema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: isEn ? "Norway's 10 Best Golf Courses 2025" : "Norges 10 beste golfbaner 2025",
      description: isEn
        ? "The 10 best golf courses in Norway ranked by Google reviews"
        : "De 10 beste golfbanene i Norge rangert etter Google-anmeldelser",
      numberOfItems: 10,
      itemListOrder: "https://schema.org/ItemListOrderDescending",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          item: {
            "@type": "SportsActivityLocation",
            name: "Stiklestad Golfklubb",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Verdal",
              addressRegion: "Trøndelag",
            },
            aggregateRating: { "@type": "AggregateRating", ratingValue: 4.9, reviewCount: 119 },
            url: courseUrl("trondelag", "stiklestad-golfklubb", "stiklestad-golf-club"),
          },
        },
        {
          "@type": "ListItem",
          position: 2,
          item: {
            "@type": "SportsActivityLocation",
            name: "Trondheim Golfklubb",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Trondheim",
              addressRegion: "Trøndelag",
            },
            aggregateRating: { "@type": "AggregateRating", ratingValue: 4.9, reviewCount: 36 },
            url: courseUrl("trondelag", "trondheim-golfklubb", "trondheim-golf-club"),
          },
        },
        {
          "@type": "ListItem",
          position: 3,
          item: {
            "@type": "SportsActivityLocation",
            name: "Bjaavann Golfklubb",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Kristiansand S",
              addressRegion: "Agder",
            },
            aggregateRating: { "@type": "AggregateRating", ratingValue: 4.7, reviewCount: 108 },
            url: courseUrl("agder", "bjaavann-golfklubb", "bjaavann-golf-club"),
          },
        },
        {
          "@type": "ListItem",
          position: 4,
          item: {
            "@type": "SportsActivityLocation",
            name: "Oustøen Country Club",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Snarøya",
              addressRegion: "Akershus",
            },
            aggregateRating: { "@type": "AggregateRating", ratingValue: 4.7, reviewCount: 90 },
            url: courseUrl("akershus", "oustoen-country-club", "oustoen-country-club"),
          },
        },
        {
          "@type": "ListItem",
          position: 5,
          item: {
            "@type": "SportsActivityLocation",
            name: "Molde Golfklubb",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Molde",
              addressRegion: "Møre og Romsdal",
            },
            aggregateRating: { "@type": "AggregateRating", ratingValue: 4.7, reviewCount: 88 },
            url: courseUrl("more-og-romsdal", "molde-golfklubb", "molde-golf-club"),
          },
        },
        {
          "@type": "ListItem",
          position: 6,
          item: {
            "@type": "SportsActivityLocation",
            name: "Valdres Golfklubb",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Aurdal",
              addressRegion: "Innlandet",
            },
            aggregateRating: { "@type": "AggregateRating", ratingValue: 4.7, reviewCount: 80 },
            url: courseUrl("innlandet", "valdres-golfklubb", "valdres-golf-club"),
          },
        },
        {
          "@type": "ListItem",
          position: 7,
          item: {
            "@type": "SportsActivityLocation",
            name: "Bodø Golfpark",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Bodø",
              addressRegion: "Nordland",
            },
            aggregateRating: { "@type": "AggregateRating", ratingValue: 4.7, reviewCount: 70 },
            url: courseUrl("nordland", "bodo-golfpark", "bodo-golf-park"),
          },
        },
        {
          "@type": "ListItem",
          position: 8,
          item: {
            "@type": "SportsActivityLocation",
            name: "Lofoten Links",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Gimsøysand",
              addressRegion: "Nordland",
            },
            aggregateRating: { "@type": "AggregateRating", ratingValue: 4.6, reviewCount: 279 },
            url: courseUrl("nordland", "lofoten-links", "lofoten-links"),
          },
        },
        {
          "@type": "ListItem",
          position: 9,
          item: {
            "@type": "SportsActivityLocation",
            name: "Krokhol Golfklubb",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Asker",
              addressRegion: "Akershus",
            },
            aggregateRating: { "@type": "AggregateRating", ratingValue: 4.6, reviewCount: 223 },
            url: courseUrl("akershus", "krokhol-golfklubb", "krokhol-golf-club"),
          },
        },
        {
          "@type": "ListItem",
          position: 10,
          item: {
            "@type": "SportsActivityLocation",
            name: "Tromsø Golfklubb",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Tromsø",
              addressRegion: "Troms",
            },
            aggregateRating: { "@type": "AggregateRating", ratingValue: 4.6, reviewCount: 215 },
            url: courseUrl("troms", "tromso-golfklubb", "tromso-golf-club"),
          },
        },
      ],
    };

    schemas.push(itemListSchema);
  }

  return schemas;
}

export default async function BloggPage(props: PageProps) {
  const params = await props.params;
  const { locale, slug } = params;
  setRequestLocale(locale);
  const t = await getTranslations("blog");
  const localeParam = locale === "en" ? "en" : undefined;
  const mdxContent = getMDXBySlug("blogg", slug, localeParam);

  if (!mdxContent) {
    notFound();
  }

  const schemas = generateStructuredData(slug, mdxContent.frontMatter, locale, mdxContent.content);

  return (
    <>
      {/* Structured Data (JSON-LD) */}
      {schemas.map((schema, index) => (
        <Script
          key={index}
          id={`schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: t("breadcrumbHome"), href: "/" },
            { label: t("breadcrumbBlog"), href: "/blog" },
            { label: mdxContent.frontMatter.title },
          ]}
        />

        <article>
          <header className="mb-8">
            <h1 className="mb-4 text-4xl font-bold text-primary">{mdxContent.frontMatter.title}</h1>

            <div className="text-base-content/60 mb-4 flex flex-wrap items-center gap-4 text-sm">
              {mdxContent.frontMatter.author && (
                <span>{t("byAuthor", { author: mdxContent.frontMatter.author })}</span>
              )}
              {mdxContent.frontMatter.publishedAt && (
                <span>
                  {t("publishedDate", {
                    date: new Date(mdxContent.frontMatter.publishedAt).toLocaleDateString(
                      locale === "en" ? "en-GB" : "nb-NO",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    ),
                  })}
                </span>
              )}
            </div>

            {mdxContent.frontMatter.description && (
              <p
                className="text-base-content/70 mb-4 text-xl"
                dangerouslySetInnerHTML={{ __html: mdxContent.frontMatter.description }}
              />
            )}
          </header>

          <div className="prose-lg prose max-w-none">
            <MDXRemote
              source={mdxContent.content}
              components={mdxComponents}
              options={{ blockJS: false }}
            />
          </div>
        </article>
      </div>
    </>
  );
}
