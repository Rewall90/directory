import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCourse, getAllCourses, calculateAverageRating } from "@/lib/courses";
import { getReviews } from "@/lib/reviews";
import { toRegionSlug } from "@/lib/constants/norway-regions";
import type { Course, Booking } from "@/types/course";
import { generateCourseBreadcrumb } from "@/lib/schema";
import { getPlacePhotos } from "@/lib/google-places";
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

interface CoursePageProps {
  params: Promise<{
    region: string;
    course: string;
  }>;
}

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
    return { type: "url", value: booking.url, label: "Book online" };
  }
  if (booking?.email) {
    return { type: "email", value: booking.email, label: "Book via e-post" };
  }
  if (booking?.phone) {
    return { type: "phone", value: booking.phone, label: "Ring for booking" };
  }
  // Fallback to contact email if GolfBox is enabled
  if (booking?.golfboxEnabled && contact.email) {
    return { type: "email", value: contact.email, label: "Kontakt for booking" };
  }
  return { type: null, value: null, label: "" };
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { region: regionSlug, course: courseSlug } = await params;

  const course = getCourse(courseSlug);

  if (!course || toRegionSlug(regionSlug) !== toRegionSlug(course.region)) {
    return {
      title: "Course Not Found",
    };
  }

  const ratingData = calculateAverageRating(course.ratings);

  const description = course.description
    ? course.description.substring(0, 160) + "..."
    : `${course.name} - ${course.course.holes} hull golf course in ${course.city}, ${course.region}. ${ratingData ? `Rated ${ratingData.averageRating.toFixed(1)}/5 by ${ratingData.totalReviews} golfers.` : ""}`;

  return {
    title: `${course.name} - Golf i ${course.region}`,
    description,
    openGraph: {
      title: course.name,
      description,
      type: "website",
      locale: "no_NO",
      url: `/${toRegionSlug(course.region)}/${course.slug}`,
      siteName: "golfkart.no",
    },
    twitter: {
      card: "summary",
      title: course.name,
      description,
    },
    alternates: {
      canonical: `/${toRegionSlug(course.region)}/${course.slug}`,
    },
  };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { region: regionSlug, course: courseSlug } = await params;

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
  );

  // Structured data for SEO - GolfCourse schema
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "GolfCourse",
    name: course.name,
    description:
      course.description || `${course.name} - Golf course in ${course.city}, ${course.region}`,
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
              Hjem
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
              Kontakt
            </button>
            {bookingAction.type === "url" && bookingAction.value && (
              <a
                href={bookingAction.value}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded bg-v3d-forest px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-v3d-forest-light"
              >
                Book starttid
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
      />

      {/* Stats Bar */}
      <StatsBar course={course} />

      {/* Story Section */}
      <StorySection course={course} photos={photos} />

      {/* Features Grid */}
      <FeaturesGrid facilities={course.facilities} winterUse={course.season.winterUse} />

      {/* Pricing Tabs */}
      <PricingTabs
        pricing={pricing}
        pricingYear={pricingYear}
        memberships={memberships}
        membershipStatus={course.membershipStatus}
      />

      {/* Contact Section */}
      <ContactSection course={course} />

      {/* Reviews */}
      <ReviewSection courseSlug={course.slug} courseName={course.name} />

      {/* Nearby Courses */}
      <NearbyCoursesGrid
        courses={nearbyCoursesData.map(({ nearbyCourse, distanceKm }) => ({
          course: nearbyCourse,
          distanceKm,
        }))}
      />
    </div>
  );
}

export function generateStaticParams() {
  const courses = getAllCourses();

  return courses.map((course) => ({
    region: toRegionSlug(course.region),
    course: course.slug,
  }));
}
