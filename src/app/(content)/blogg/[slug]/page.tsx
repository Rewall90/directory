import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllSlugs, getMDXBySlug } from "@/lib/mdx";
import { mdxComponents } from "@/app/mdx-components";
import Script from "next/script";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

interface PageProps {
  params: Promise<{ slug: string }>;
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
  const slugs = getAllSlugs("blogg");
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps) {
  const params = await props.params;
  const mdxContent = getMDXBySlug("blogg", params.slug);

  if (!mdxContent) {
    return {
      title: "Ikke funnet",
    };
  }

  // Use seoTitle if available, otherwise fall back to title
  const metaTitle = mdxContent.frontMatter.seoTitle || mdxContent.frontMatter.title;

  // Use seoDescription if available, otherwise strip HTML tags from description for meta tags
  const metaDescription =
    mdxContent.frontMatter.seoDescription ||
    mdxContent.frontMatter.description?.replace(/<[^>]*>/g, "") ||
    "";

  return {
    title: metaTitle,
    description: metaDescription,
    alternates: {
      canonical: `https://golfkart.no/blogg/${params.slug}`,
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: "article",
      publishedTime: mdxContent.frontMatter.publishedAt,
      authors: [mdxContent.frontMatter.author || "golfkart.no"],
      url: `https://golfkart.no/blogg/${params.slug}`,
    },
  };
}

// Generate structured data for SEO
function generateStructuredData(slug: string, frontMatter: FrontMatter) {
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
    inLanguage: "no",
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
      "@id": `${baseUrl}/blogg/${slug}`,
    },
  };

  // Add ranking-specific schema if this is the best courses post
  if (slug === "beste-golfbaner-norge-2025") {
    const itemListSchema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Norges 10 beste golfbaner 2025",
      description: "De 10 beste golfbanene i Norge rangert etter Google-anmeldelser",
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
            url: `${baseUrl}/trondelag/stiklestad-golfklubb`,
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
            url: `${baseUrl}/trondelag/trondheim-golfklubb`,
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
            url: `${baseUrl}/agder/bjaavann-golfklubb`,
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
            url: `${baseUrl}/akershus/oustoen-country-club`,
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
            url: `${baseUrl}/more-og-romsdal/molde-golfklubb`,
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
            url: `${baseUrl}/innlandet/valdres-golfklubb`,
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
            url: `${baseUrl}/nordland/bodo-golfpark`,
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
            url: `${baseUrl}/nordland/lofoten-links`,
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
            url: `${baseUrl}/akershus/krokhol-golfklubb`,
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
            url: `${baseUrl}/troms/tromso-golfklubb`,
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
          name: "Hjem",
          item: baseUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Blogg",
          item: `${baseUrl}/blogg`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Beste Golfbaner i Norge 2025",
          item: `${baseUrl}/blogg/beste-golfbaner-norge-2025`,
        },
      ],
    };

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
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
  const mdxContent = getMDXBySlug("blogg", params.slug);

  if (!mdxContent) {
    notFound();
  }

  const schemas = generateStructuredData(params.slug, mdxContent.frontMatter);

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
            { label: "Hjem", href: "/" },
            { label: "Blogg", href: "/blogg" },
            { label: mdxContent.frontMatter.title },
          ]}
        />

        <article>
          <header className="mb-8">
            <h1 className="mb-4 text-4xl font-bold text-primary">{mdxContent.frontMatter.title}</h1>

            <div className="text-base-content/60 mb-4 flex flex-wrap items-center gap-4 text-sm">
              {mdxContent.frontMatter.author && <span>Av {mdxContent.frontMatter.author}</span>}
              {mdxContent.frontMatter.publishedAt && (
                <span>
                  Publisert{" "}
                  {new Date(mdxContent.frontMatter.publishedAt).toLocaleDateString("nb-NO", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
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
            <MDXRemote source={mdxContent.content} components={mdxComponents} />
          </div>
        </article>
      </div>
    </>
  );
}
