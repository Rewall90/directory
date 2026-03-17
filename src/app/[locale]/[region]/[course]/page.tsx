import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCourse, getAllCourses, calculateAverageRating } from "@/lib/courses";
import { getReviews } from "@/lib/reviews";
import { toRegionSlug } from "@/lib/constants/norway-regions";
import type { Course, Booking } from "@/types/course";
import { generateCourseBreadcrumb } from "@/lib/schema";
import { getPlacePhotos } from "@/lib/google-places";
import { routing } from "@/i18n/routing";
import { getLocalizedName, getLocalizedDescription, getLocalizedSlug } from "@/lib/i18n-courses";
import { CourseHero } from "./_components/CourseHero";
import { StatsBar } from "./_components/StatsBar";
import { StorySection } from "./_components/StorySection";
import { FeaturesGrid } from "./_components/FeaturesGrid";
import { PricingTabs } from "./_components/PricingTabs";
import { ContactSection } from "./_components/ContactSection";
import { NearbyCoursesGrid } from "./_components/NearbyCoursesGrid";
import { ReviewSection } from "./_components/ReviewSection";

// Revalidate every 30 minutes to keep photo URLs fresh (URLs expire after ~1 hour)
export const revalidate = 1800;

type Props = {
  params: Promise<{
    locale: string;
    region: string;
    course: string;
  }>;
};

/**
 * Get the best booking action for a course
 * Returns { type, value } where type is 'email' | 'phone' | 'url' | null
 */
function getBookingAction(
  booking: Booking | null,
  contact: Course["contact"],
): {
  type: "email" | "phone" | "url" | null;
  value: string | null;
  label: string;
} {
  // Priority: dedicated booking URL > booking email > booking phone > general contact
  if (booking?.url) {
    return { type: "url", value: booking.url, label: "" };
  }
  if (booking?.email) {
    return { type: "email", value: booking.email, label: "" };
  }
  if (booking?.phone) {
    return { type: "phone", value: booking.phone, label: "" };
  }
  // Fallback to contact email if GolfBox is enabled
  if (booking?.golfboxEnabled && contact.email) {
    return { type: "email", value: contact.email, label: "" };
  }
  return { type: null, value: null, label: "" };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, region: regionSlug, course: courseSlug } = await params;

  const course = getCourse(courseSlug);

  if (!course || toRegionSlug(regionSlug) !== toRegionSlug(course.region)) {
    return {
      title: "Course Not Found",
    };
  }

  const ratingData = calculateAverageRating(course.ratings);
  const localeType = locale as "nb" | "en";

  const name = getLocalizedName(course, localeType);
  const title =
    locale === "en" ? `${name} - Golf in ${course.region}` : `${name} - Golf i ${course.region}`;

  const descriptionContent = getLocalizedDescription(course, localeType);
  const description = descriptionContent
    ? descriptionContent.substring(0, 160) + "..."
    : locale === "en"
      ? `${name} - ${course.course.holes} hole golf course in ${course.city}, ${course.region}. ${ratingData ? `Rated ${ratingData.averageRating.toFixed(1)}/5 by ${ratingData.totalReviews} golfers.` : ""}`
      : `${name} - ${course.course.holes} hull golfbane i ${course.city}, ${course.region}. ${ratingData ? `Vurdert til ${ratingData.averageRating.toFixed(1)}/5 av ${ratingData.totalReviews} golfere.` : ""}`;

  const regionPath = toRegionSlug(course.region);

  return {
    title,
    description,
    openGraph: {
      title: name,
      description,
      type: "website",
      locale: locale === "en" ? "en_GB" : "nb_NO",
      url: `https://golfkart.no${locale === "en" ? "/en" : ""}/${regionPath}/${course.slug}`,
      siteName: "golfkart.no",
    },
    twitter: {
      card: "summary",
      title: name,
      description,
    },
    alternates: {
      canonical: `https://golfkart.no${locale === "en" ? "/en" : ""}/${regionPath}/${course.slug}`,
      languages: {
        nb: `https://golfkart.no/${regionPath}/${course.slug}`,
        en: `https://golfkart.no/en/${regionPath}/${course.slug}`,
        "x-default": `https://golfkart.no/${regionPath}/${course.slug}`,
      },
    },
  };
}

export default async function CoursePage({ params }: Props) {
  const { locale, region: regionSlug, course: courseSlug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("course");

  const course = getCourse(courseSlug);

  if (!course) {
    notFound();
  }

  if (toRegionSlug(regionSlug) !== toRegionSlug(course.region)) {
    notFound();
  }

  // Fetch photos if Place ID exists
  const photos = course.googlePlaceId ? await getPlacePhotos(course.googlePlaceId, 4) : [];

  const ratingData = calculateAverageRating(course.ratings);

  // Get site reviews summary for hero
  const reviews = getReviews(course.slug);
  const siteReviews =
    reviews.length > 0
      ? {
          averageRating: reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length,
          reviewCount: reviews.length,
        }
      : null;

  // Get pricing - year is the key in the Record
  const pricingYears = Object.keys(course.pricing).sort((a, b) => Number(b) - Number(a));
  const pricingYear = pricingYears[0] || null;
  const pricing = pricingYear ? course.pricing[pricingYear] : null;

  // Get membership pricing for current year
  const currentYear = new Date().getFullYear().toString();
  const memberships = course.membershipPricing[currentYear] || [];

  // Get booking action
  const bookingAction = getBookingAction(course.booking ?? null, course.contact);

  // Get nearby courses with full data
  const nearbyCoursesData = course.nearbyCourses
    .slice(0, 4)
    .map(({ slug, distanceKm }) => {
      const nearbyCourse = getCourse(slug);
      return nearbyCourse ? { nearbyCourse, distanceKm } : null;
    })
    .filter((item): item is { nearbyCourse: Course; distanceKm: number | null } => item !== null);

  // Generate BreadcrumbList schema
  const breadcrumbSchema = generateCourseBreadcrumb(
    course.region,
    toRegionSlug(course.region),
    course.name,
    course.slug,
    locale,
  );

  // Structured data for SEO - GolfCourse schema
  const localeType = locale as "nb" | "en";
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "GolfCourse",
    inLanguage: locale === "en" ? "en" : "nb",
    name: getLocalizedName(course, localeType),
    description:
      getLocalizedDescription(course, localeType) ||
      (locale === "en"
        ? `${getLocalizedName(course, localeType)} - Golf course in ${course.city}, ${course.region}`
        : `${getLocalizedName(course, localeType)} - Golfbane i ${course.city}, ${course.region}`),
    url: `https://golfkart.no${locale === "en" ? "/en" : ""}/${toRegionSlug(course.region)}/${course.slug}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: course.address.street,
      addressLocality: course.city,
      addressRegion: course.region,
      postalCode: course.address.postalCode,
      addressCountry: "NO",
    },
    ...(course.coordinates && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: course.coordinates.lat,
        longitude: course.coordinates.lng,
      },
    }),
    ...(course.contact.phone && { telephone: course.contact.phone }),
    ...(course.contact.email && { email: course.contact.email }),
    ...(course.contact.website && { url: course.contact.website }),
    ...(ratingData && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: ratingData.averageRating.toFixed(1),
        reviewCount: ratingData.totalReviews,
        bestRating: "5",
        worstRating: "1",
      },
    }),
    ...(pricing && {
      priceRange: `${Math.min(
        pricing.greenFeeWeekday || Infinity,
        pricing.greenFeeWeekend || Infinity,
        pricing.greenFeeJunior || Infinity,
      )} - ${Math.max(
        pricing.greenFeeWeekday || 0,
        pricing.greenFeeWeekend || 0,
      )} ${pricing.currency}`,
    }),
  };

  return (
    <div className="v3d bg-v3d-cream font-sans text-v3d-text-body">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Breadcrumb Navigation */}
      <nav className="border-b border-v3d-border bg-v3d-cream">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-8 py-4">
          <div className="text-sm text-v3d-text-muted">
            <Link href="/" className="hover:text-v3d-forest">
              {t("breadcrumbHome")}
            </Link>
            <span className="mx-2">/</span>
            <Link href={`/${toRegionSlug(course.region)}`} className="hover:text-v3d-forest">
              {course.region}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-v3d-text-dark">{course.name}</span>
          </div>
          <div className="flex gap-4">
            <button className="rounded border border-v3d-border px-6 py-3 text-sm font-medium text-v3d-text-dark transition-colors hover:border-v3d-forest hover:text-v3d-forest">
              {t("contactButton")}
            </button>
            {bookingAction.type === "url" && bookingAction.value && (
              <a
                href={bookingAction.value}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded bg-v3d-forest px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-v3d-forest-light"
              >
                {t("bookTeeTime")}
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <CourseHero
        course={course}
        ratingData={ratingData}
        siteReviews={siteReviews}
        photos={photos}
        googlePlaceId={course.googlePlaceId}
        locale={locale as "nb" | "en"}
      />

      {/* Stats Bar */}
      <StatsBar course={course} locale={locale as "nb" | "en"} />

      {/* Story Section */}
      <StorySection course={course} photos={photos} locale={locale as "nb" | "en"} />

      {/* Features Grid */}
      <FeaturesGrid
        facilities={course.facilities}
        winterUse={course.season.winterUse}
        winterUse_en={course.season.winterUse_en}
        locale={locale as "nb" | "en"}
      />

      {/* Pricing Tabs */}
      <PricingTabs
        pricing={pricing}
        pricingYear={pricingYear}
        memberships={memberships}
        membershipStatus={course.membershipStatus}
        locale={locale as "nb" | "en"}
      />

      {/* Contact Section */}
      <ContactSection course={course} locale={locale as "nb" | "en"} />

      {/* Reviews */}
      <ReviewSection
        courseSlug={course.slug}
        courseName={getLocalizedName(course, locale as "nb" | "en")}
        locale={locale as "nb" | "en"}
      />

      {/* Nearby Courses */}
      <NearbyCoursesGrid
        courses={nearbyCoursesData.map(({ nearbyCourse, distanceKm }) => ({
          course: nearbyCourse,
          distanceKm,
        }))}
        locale={locale as "nb" | "en"}
      />
    </div>
  );
}

export function generateStaticParams() {
  const courses = getAllCourses();

  return routing.locales.flatMap((locale) =>
    courses.map((course) => ({
      locale,
      region: toRegionSlug(course.region),
      course: getLocalizedSlug(course, locale as "nb" | "en"),
    })),
  );
}
