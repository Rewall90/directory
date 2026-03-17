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
  author?: string;
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
function generateStructuredData(slug: string, frontMatter: FrontMatter, locale: string) {
  const baseUrl = "https://golfkart.no";

  // Use seoTitle if available, otherwise fall back to title
  const structuredTitle = frontMatter.seoTitle || frontMatter.title;

  // Use seoDescription if available, otherwise strip HTML tags from description
  const structuredDescription =
    frontMatter.seoDescription || frontMatter.description?.replace(/<[^>]*>/g, "") || "";

  // Article Schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: structuredTitle,
    description: structuredDescription,
    inLanguage: locale === "en" ? "en" : "nb",
    articleSection: "Golf Rankings",
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
    datePublished: frontMatter.publishedAt,
    dateModified: frontMatter.publishedAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}${locale === "en" ? "/en" : ""}/blog/${slug}`,
    },
  };

  // Add ranking-specific schema if this is the best courses post
  const isEn = locale === "en";
  const isBestCoursesPost =
    slug === "beste-golfbaner-norge-2025" || slug === "best-golf-courses-norway";

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
          name: isEn ? "Best Golf Courses in Norway 2025" : "Beste Golfbaner i Norge 2025",
          item: `${baseUrl}${isEn ? "/en" : ""}/blog/${slug}`,
        },
      ],
    };

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: isEn
        ? [
            {
              "@type": "Question",
              name: "Which golf course is best in Norway?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Stiklestad Golf Club in Trøndelag is ranked as Norway's best golf course in 2025, with an impressive 4.9-star rating based on 119 Google reviews. The course is located in Verdal and combines high quality with consistently excellent service.",
              },
            },
            {
              "@type": "Question",
              name: "How many golf courses are there in Norway?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "There are over 160 golf courses across Norway. In our analysis, we've ranked 152 Norwegian golf clubs that all have at least 5 Google reviews, providing a reliable basis for comparison.",
              },
            },
            {
              "@type": "Question",
              name: "How are golf courses ranked objectively?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "We use Bayesian Average, the same statistical method IMDb uses to rank films. The formula balances the number of reviews with the average rating, so courses with many positive reviews rank higher than those with just a few (even if they're perfect).",
              },
            },
            {
              "@type": "Question",
              name: "Which region in Norway has the most good golf courses?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Trøndelag dominates with 2 of the 10 best golf courses in Norway, including first place (Stiklestad). Akershus and Nordland also have 2 courses each in the top 10. The Oslo area (Akershus) is especially popular for golfers seeking quality courses near the capital.",
              },
            },
            {
              "@type": "Question",
              name: "What does it cost to play golf at Norway's best courses?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Green fees at top-ranked Norwegian golf courses typically range from 400-900 NOK depending on day and season. Membership offers significant discounts. Most top 10 courses also offer driving ranges, clubhouses with restaurants, and club rentals.",
              },
            },
            {
              "@type": "Question",
              name: "Is Lofoten Links worth visiting?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Absolutely! Lofoten Links is the most reviewed course in our top 10 with 279 Google reviews and 4.6 stars. The course is world-famous for its spectacular location and unique Northern Norwegian landscape. Perfect for a golf holiday.",
              },
            },
            {
              "@type": "Question",
              name: "Which golf courses are best for beginners?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Many of the highly ranked courses have both 18-hole and shorter courses suitable for beginners. We recommend contacting the golf clubs directly for information about lessons, driving range facilities, and beginner-friendly offers.",
              },
            },
            {
              "@type": "Question",
              name: "When is the best time to play golf in Norway?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "The golf season in Norway typically runs from April to October, with best conditions in June-August. Northern Norwegian courses like Tromsø and Bodø offer unique midnight sun experiences in June-July.",
              },
            },
          ]
        : [
            {
              "@type": "Question",
              name: "Hvilken golfbane er best i Norge?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Stiklestad Golfklubb i Trøndelag er rangert som Norges beste golfbane i 2025, med en imponerende 4.9-stjerner rating basert på 119 Google-anmeldelser. Golfbanen ligger i Verdal og kombinerer høy kvalitet med konsistent god service.",
              },
            },
            {
              "@type": "Question",
              name: "Hvor mange golfbaner finnes det i Norge?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Det finnes over 160 golfbaner fordelt over hele Norge. I vår analyse har vi rangert 152 norske golfklubber som alle har minimum 5 Google-anmeldelser, noe som gir et pålitelig grunnlag for sammenligningen.",
              },
            },
            {
              "@type": "Question",
              name: "Hvordan rangeres golfbaner objektivt?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Vi bruker Bayesian Average, samme statistiske metode som IMDb bruker for å rangere filmer. Formelen balanserer antall anmeldelser med gjennomsnittsrating, slik at baner med mange positive anmeldelser rangeres høyere enn de med bare få (selv om de er perfekte).",
              },
            },
            {
              "@type": "Question",
              name: "Hvilken region i Norge har flest gode golfbaner?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Trøndelag dominerer med 2 av de 10 beste golfbanene i Norge, inkludert førsteplassen (Stiklestad). Akershus og Nordland har også 2 baner hver i topp 10. Oslo-området (Akershus) er spesielt populært for golfere som søker kvalitetsbaner nær hovedstaden.",
              },
            },
            {
              "@type": "Question",
              name: "Hva koster det å spille golf på Norges beste baner?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Greenfee på topp-rangerte norske golfbaner varierer typisk fra 400-900 kr avhengig av dag og sesong. Medlemskap gir betydelig rabatt. De fleste av topp 10-banene tilbyr også driving range, klubbhus med restaurant, og klubbutleie.",
              },
            },
            {
              "@type": "Question",
              name: "Er Lofoten Links verdt besøket?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Absolutt! Lofoten Links er den mest anmeldte banen i vår topp 10 med 279 Google-anmeldelser og 4.6-stjerner. Golfbanen er verdenskjent for sin spektakulære beliggenhet og unike nordnorske landskap. Perfekt for golfferie.",
              },
            },
            {
              "@type": "Question",
              name: "Hvilke golfbaner er best for nybegynnere?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Mange av de høyt rangerte banene har både 18-hulls og kortere baner som passer nybegynnere. Vi anbefaler å kontakte golfklubbene direkte for informasjon om kurs, driving range-fasiliteter og begynnervennlige tilbud.",
              },
            },
            {
              "@type": "Question",
              name: "Når er beste tid å spille golf i Norge?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Golfsesongen i Norge går typisk fra april til oktober, med best forhold i juni-august. Nordnorske baner som Tromsø og Bodø tilbyr unike midnattssol-opplevelser i juni-juli.",
              },
            },
          ],
    };

    return [articleSchema, itemListSchema, faqSchema, breadcrumbSchema];
  }

  return [articleSchema];
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

  const schemas = generateStructuredData(slug, mdxContent.frontMatter, locale);

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
