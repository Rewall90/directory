import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCourse, getAllCourses, calculateAverageRating } from "@/lib/courses";
import { toRegionSlug } from "@/lib/constants/norway-regions";
import type { Course, Facilities } from "@/types/course";
import { StarRating } from "@/components/courses/StarRating";
import { ExpandableDescription } from "@/components/courses/ExpandableDescription";
import { WeatherWidget } from "@/components/courses/WeatherWidget";
import { ExpandableFeatures } from "@/components/courses/ExpandableFeatures";
import { RatingCard } from "@/components/courses/RatingCard";
import { generateCourseBreadcrumb } from "@/lib/schema";

interface CoursePageProps {
  params: Promise<{
    region: string;
    course: string;
  }>;
}

function buildFacilityGroups(
  facilities: Facilities | null,
): Array<{ title: string; items: string[] }> {
  if (!facilities) return [];

  const groups: Array<{ title: string; items: string[] }> = [];

  const training: string[] = [];
  if (facilities.drivingRange) {
    const lengthSuffix = facilities.drivingRangeLength
      ? ` (${facilities.drivingRangeLength} m)`
      : "";
    training.push(`Driving Range${lengthSuffix}`);
  }
  if (facilities.puttingGreen) training.push("Putting Green");
  if (facilities.chippingArea) training.push("Chipping Area");
  if (facilities.practiceBunker) training.push("Practice Bunker");
  if (training.length) {
    groups.push({ title: "Treningsfasiliteter", items: training });
  }

  const clubhouse: string[] = [];
  if (facilities.clubhouse) clubhouse.push(facilities.clubhouseName || "Klubbhus");
  if (facilities.proShop) clubhouse.push("Pro Shop");
  if (facilities.restaurant) {
    clubhouse.push(
      facilities.restaurantName ? `Restaurant – ${facilities.restaurantName}` : "Restaurant",
    );
  }
  if (facilities.lockerRooms) clubhouse.push("Garderoberom");
  if (facilities.showers) clubhouse.push("Dusj");
  if (facilities.conferenceRoom) clubhouse.push("Konferanserom");
  if (clubhouse.length) {
    groups.push({ title: "Klubbhus", items: clubhouse });
  }

  const services: string[] = [];
  if (facilities.clubRental) services.push("Klubb-leie");
  if (facilities.cartRental) services.push("Golfbil-leie");
  if (facilities.pullCartRental) services.push("Tralle-leie");
  if (facilities.golfLessons) services.push("Golf-timer");
  if (facilities.teachingPro) services.push("Teaching Pro");
  if (facilities.clubFitting) services.push("Club Fitting");
  if (services.length) {
    groups.push({ title: "Tjenester", items: services });
  }

  const extras: string[] = [];
  if (facilities.tennis) {
    const courts = facilities.tennisCourts ? ` (${facilities.tennisCourts} baner)` : "";
    extras.push(`Tennis${courts}`);
  }
  if (facilities.discGolf) {
    extras.push(
      facilities.discGolfStandard ? `Disc Golf (${facilities.discGolfStandard})` : "Disc Golf",
    );
  }
  if (facilities.simulator) {
    extras.push(facilities.simulatorType ? `Simulator – ${facilities.simulatorType}` : "Simulator");
  }
  if (facilities.eventVenue) extras.push("Eventlokaler");
  if (typeof facilities.bunkers === "number") {
    extras.push(`Antall bunkere: ${facilities.bunkers}`);
  }
  if (extras.length) {
    groups.push({ title: "Andre aktiviteter", items: extras });
  }

  return groups;
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-text-secondary">
      <span className="font-semibold text-text-primary">{label}:</span>
      <span>{value}</span>
    </div>
  );
}

function getPhoneTypeLabel(type: string | null): string {
  if (!type) return "";

  // Map phone types to Norwegian labels
  const typeMap: Record<string, string> = {
    main: "Sentralbord",
    booking: "Booking",
    restaurant: "Restaurant",
    pro_shop: "Pro Shop",
    "Pro Shop": "Pro Shop",
    Spiseriet: "Restaurant",
  };

  return typeMap[type] || type;
}

const formatter = new Intl.NumberFormat("no-NO");

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

  const ratingData = calculateAverageRating(course.ratings);
  const facilityGroups = buildFacilityGroups(course.facilities);

  // Get pricing - year is the key in the Record
  const pricingYears = Object.keys(course.pricing).sort((a, b) => Number(b) - Number(a));
  const pricingYear = pricingYears[0];
  const pricing = pricingYear ? course.pricing[pricingYear] : null;

  // Get primary phone - sorted by primary flag
  const sortedPhones = [...course.phoneNumbers].sort((a, b) => (b.primary ? 1 : 0) - (a.primary ? 1 : 0));
  const primaryPhone = sortedPhones[0];

  // Get membership pricing for current year
  const currentYear = new Date().getFullYear().toString();
  const memberships = course.membershipPricing[currentYear] || [];

  // Get nearby courses with full data
  const nearbyCoursesData = course.nearbyCourses
    .slice(0, 4)
    .map(({ slug, distanceKm }) => {
      const nearbyCourse = getCourse(slug);
      return nearbyCourse ? { nearbyCourse, distanceKm } : null;
    })
    .filter((item): item is { nearbyCourse: Course; distanceKm: number | null } => item !== null);

  // Convert ratings Record to array with source
  const ratingsArray = Object.entries(course.ratings).map(([source, rating]) => ({
    source,
    ...rating,
  }));

  const addressLines = [
    [course.address.street, course.address.area].filter(Boolean).join(", "),
    `${course.address.postalCode} ${course.city}`,
    course.region,
  ].filter(Boolean);

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
    <div className="bg-background">
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Breadcrumb */}
      <nav className="container mx-auto max-w-[1170px] px-4 py-4 text-sm text-text-tertiary">
        <Link href="/" className="hover:text-primary">
          Hjem
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/${toRegionSlug(course.region)}`} className="hover:text-primary">
          {course.region}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-text-primary">{course.name}</span>
      </nav>

      {/* Hero Section */}
      <section className="border-b border-border-subtle bg-background-surface py-8 md:py-16">
        <div className="container mx-auto max-w-[1170px] px-4">
          {/* Former Name Badge */}
          {course.formerName && (
            <div className="mb-3">
              <span className="bg-background-elevated inline-block rounded-full px-3 py-1 text-xs text-text-tertiary">
                Tidligere: {course.formerName}
              </span>
            </div>
          )}

          {/* Course Name */}
          <h1 className="mb-4 text-3xl font-bold text-text-primary md:text-4xl">{course.name}</h1>

          {/* Address */}
          <div className="mb-4 space-y-1 text-text-secondary">
            {addressLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>

          {/* Rating */}
          {ratingData && (
            <div className="mb-6 flex flex-wrap items-center gap-2 text-text-secondary">
              <StarRating rating={ratingData.averageRating} size={20} />
              <span className="font-semibold text-text-primary">
                {ratingData.averageRating.toFixed(1)}
              </span>
              <span>
                ({formatter.format(ratingData.totalReviews)} anmeldelse
                {ratingData.totalReviews === 1 ? "" : "r"})
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {course.contact.website && (
              <a
                href={course.contact.website}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                Besøk Nettside
              </a>
            )}
            {primaryPhone && (
              <a href={`tel:${primaryPhone.number}`} className="btn-secondary">
                Ring
              </a>
            )}
            {course.coordinates && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${course.coordinates.lat},${course.coordinates.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                Veibeskrivelse
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Quick Facts Grid */}
      <section className="bg-background py-16">
        <div className="container mx-auto max-w-[1170px] px-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {/* Holes */}
            {course.course.holes && (
              <div className="rounded-lg bg-background-surface p-6 text-center shadow-sm">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                  Hull
                </div>
                <div className="text-2xl font-bold text-text-primary">{course.course.holes}</div>
              </div>
            )}

            {/* Par */}
            {course.course.par && (
              <div className="rounded-lg bg-background-surface p-6 text-center shadow-sm">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                  Par
                </div>
                <div className="text-2xl font-bold text-text-primary">{course.course.par}</div>
              </div>
            )}

            {/* Designer */}
            {course.course.designer && (
              <div className="rounded-lg bg-background-surface p-6 text-center shadow-sm">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                  Designer
                </div>
                <div className="font-semibold text-text-primary">{course.course.designer}</div>
              </div>
            )}

            {/* Year Built */}
            {course.course.yearBuilt && (
              <div className="rounded-lg bg-background-surface p-6 text-center shadow-sm">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                  Bygget
                </div>
                <div className="text-2xl font-bold text-text-primary">
                  {course.course.yearBuilt}
                  {course.course.yearRedesigned && (
                    <div className="text-xs font-normal text-text-tertiary">
                      (omb {course.course.yearRedesigned})
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Length */}
            {course.course.lengthMeters && (
              <div className="rounded-lg bg-background-surface p-6 text-center shadow-sm">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                  Lengde
                </div>
                <div className="text-2xl font-bold text-text-primary">
                  {formatter.format(course.course.lengthMeters)} m
                  {course.course.lengthYards && (
                    <div className="text-xs font-normal text-text-tertiary">
                      {formatter.format(course.course.lengthYards)} y
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Water Hazards */}
            {course.course.waterHazards && (
              <div className="rounded-lg bg-background-surface p-6 text-center shadow-sm">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                  Vannhinder
                </div>
                <div className="font-semibold text-text-primary">Ja</div>
              </div>
            )}

            {/* Season */}
            {course.season.start && course.season.end && (
              <div className="rounded-lg bg-background-surface p-6 text-center shadow-sm">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                  Sesong
                </div>
                <div className="font-semibold text-text-primary">
                  {course.season.start} - {course.season.end}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Description Section */}
      {course.description && (
        <ExpandableDescription
          description={course.description}
          signatureHole={course.course.signatureHole}
          scenicHole={course.course.scenicHole}
          terrain={course.course.terrain}
        />
      )}

      {/* Main Content Area - Two Column */}
      <section className="bg-background py-16">
        <div className="container mx-auto max-w-[1170px] px-4">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            {/* Left Column */}
            <div className="space-y-8">
              {/* Individual Rating Cards */}
              {ratingsArray.length > 0 && (
                <div className="rounded-lg bg-background-surface p-6 shadow-sm">
                  <h2 className="mb-4 text-2xl font-semibold text-text-primary">
                    Vurderinger & Anmeldelser
                  </h2>

                  {/* Overall Rating */}
                  {ratingData && (
                    <div className="mb-6 rounded-lg bg-background-hover p-4">
                      <div className="text-center">
                        <div className="mb-2 text-sm text-text-tertiary">
                          Gjennomsnittlig vurdering
                        </div>
                        <div className="mb-2 flex justify-center">
                          <StarRating rating={ratingData.averageRating} size={24} />
                        </div>
                        <div className="text-3xl font-bold text-text-primary">
                          {ratingData.averageRating.toFixed(1)}
                        </div>
                        <div className="text-text-tertiary">
                          Basert på {formatter.format(ratingData.totalReviews)} anmeldelser
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Individual Platform Ratings */}
                  <div className="space-y-3">
                    {ratingsArray.map((rating, index) => (
                      <RatingCard key={index} rating={rating} />
                    ))}
                  </div>
                </div>
              )}

              {/* Facilities */}
              {facilityGroups.length > 0 && (
                <div className="rounded-lg bg-background-surface p-6 shadow-sm">
                  <h2 className="mb-6 text-2xl font-semibold text-text-primary">Fasiliteter</h2>
                  <div className="grid gap-8 md:grid-cols-2">
                    {facilityGroups.map((group) => (
                      <div key={group.title}>
                        <h3 className="mb-3 font-semibold text-text-primary">{group.title}</h3>
                        <ul className="space-y-2.5 text-text-secondary">
                          {group.items.map((item) => {
                            // Parse item for additional details (looking for patterns like "Name - Details" or "Name (Details)")
                            const detailMatch = item.match(/^(.+?)\s*[–—-]\s*(.+)$/);
                            const parenMatch = item.match(/^(.+?)\s*\((.+?)\)\s*(.*)$/);

                            if (detailMatch) {
                              const [, mainName, details] = detailMatch;
                              // Remove phone numbers from details
                              const cleanDetails = details
                                .replace(/Tlf:\s*[+\d\s]+,?\s*/gi, "")
                                .replace(/E-post:\s*\S+,?\s*/gi, "");

                              return (
                                <li key={item} className="flex gap-2 leading-relaxed">
                                  <span className="mt-0.5 flex-shrink-0 text-primary">✓</span>
                                  <div>
                                    <div className="font-medium text-text-primary">{mainName}</div>
                                    {cleanDetails && (
                                      <div className="mt-0.5 text-sm leading-snug text-text-tertiary">
                                        {cleanDetails}
                                      </div>
                                    )}
                                  </div>
                                </li>
                              );
                            } else if (parenMatch && parenMatch[3]) {
                              // Has content after parenthesis
                              const [, mainName, parenContent, afterParen] = parenMatch;
                              return (
                                <li key={item} className="flex gap-2 leading-relaxed">
                                  <span className="mt-0.5 flex-shrink-0 text-primary">✓</span>
                                  <div>
                                    <div className="font-medium text-text-primary">
                                      {mainName.trim()}
                                    </div>
                                    <div className="mt-0.5 text-sm leading-snug text-text-tertiary">
                                      {parenContent} {afterParen}
                                    </div>
                                  </div>
                                </li>
                              );
                            } else {
                              // Simple item
                              return (
                                <li key={item} className="flex gap-2">
                                  <span className="flex-shrink-0 text-primary">✓</span>
                                  <span>{item}</span>
                                </li>
                              );
                            }
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                  {course.season.winterUse && (
                    <div className="mt-8 border-t border-border-subtle pt-6">
                      <h3 className="mb-3 font-semibold text-text-primary">Vinter</h3>
                      <div className="flex gap-2 text-text-secondary">
                        <span className="flex-shrink-0 text-primary">✓</span>
                        <span className="leading-relaxed">{course.season.winterUse}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Pricing */}
              {pricing && (
                <div className="rounded-lg bg-background-surface p-6 shadow-sm">
                  <h2 className="mb-6 text-2xl font-semibold text-text-primary">
                    Priser {pricingYear}
                  </h2>

                  {/* Green Fees - 18 hull */}
                  <div className="mb-6">
                    <h3 className="mb-3 font-semibold text-text-primary">Greenfee 18 hull</h3>
                    <div className="space-y-2">
                      {pricing.greenFeeWeekday && (
                        <div className="flex justify-between text-text-secondary">
                          <span>Standard:</span>
                          <span className="font-semibold text-text-primary">
                            {formatter.format(pricing.greenFeeWeekday)} kr
                          </span>
                        </div>
                      )}
                      {pricing.greenFeeJunior && (
                        <div className="flex justify-between text-text-secondary">
                          <span>Junior (0-18 år):</span>
                          <span className="font-semibold text-text-primary">
                            {formatter.format(pricing.greenFeeJunior)} kr
                          </span>
                        </div>
                      )}
                      {pricing.greenFeeSenior && (
                        <div className="flex justify-between text-text-secondary">
                          <span>Senior:</span>
                          <span className="font-semibold text-text-primary">
                            {formatter.format(pricing.greenFeeSenior)} kr
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Equipment Rental */}
                  {(pricing.cartRental || pricing.pullCartRental || pricing.clubRental) && (
                    <div className="mb-6 border-t border-border-subtle pt-6">
                      <h3 className="mb-3 font-semibold text-text-primary">Utstyr</h3>
                      <div className="space-y-2">
                        {pricing.cartRental && (
                          <div className="flex justify-between text-text-secondary">
                            <span>Golfbil:</span>
                            <span className="font-semibold text-text-primary">
                              {formatter.format(pricing.cartRental)} kr
                            </span>
                          </div>
                        )}
                        {pricing.pullCartRental && (
                          <div className="flex justify-between text-text-secondary">
                            <span>Tralle:</span>
                            <span className="font-semibold text-text-primary">
                              {formatter.format(pricing.pullCartRental)} kr
                            </span>
                          </div>
                        )}
                        {pricing.clubRental && (
                          <div className="flex justify-between text-text-secondary">
                            <span>Klubber:</span>
                            <span className="font-semibold text-text-primary">
                              {formatter.format(pricing.clubRental)} kr
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* View detailed pricing */}
                  {pricing.greenFeeDescription && (
                    <details className="mt-6 border-t border-border-subtle pt-6">
                      <summary className="cursor-pointer font-semibold text-primary hover:text-primary-dark">
                        Vis alle priser og detaljer
                      </summary>
                      <div className="mt-4 whitespace-pre-line text-sm leading-relaxed text-text-secondary">
                        {pricing.greenFeeDescription}
                      </div>
                    </details>
                  )}
                </div>
              )}

              {/* Membership Pricing */}
              {memberships.length > 0 && (
                <div className="rounded-lg bg-background-surface p-6 shadow-sm">
                  <h2 className="mb-4 text-2xl font-semibold text-text-primary">
                    Medlemskap {currentYear}
                  </h2>

                  {/* Joining Fee */}
                  <div className="mb-6 rounded-lg border border-border-subtle bg-background-hover p-4">
                    <div className="font-semibold text-text-primary">Innmeldingsavgift</div>
                    <div className="mt-1 text-2xl font-bold text-text-primary">70 000 kr</div>
                    <div className="mt-1 text-sm text-text-secondary">Engangsavgift ved opptak</div>
                  </div>

                  <div className="space-y-4">
                    {memberships.map((membership, index) => (
                      <div
                        key={index}
                        className="rounded-lg border border-border-subtle bg-background-hover p-4"
                      >
                        <div className="mb-2 flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold capitalize text-text-primary">
                              {membership.category.replace(/_/g, " ")}
                              {membership.ageRange && (
                                <span className="ml-2 text-sm font-normal text-text-tertiary">
                                  ({membership.ageRange})
                                </span>
                              )}
                            </h3>
                            {membership.description && (
                              <p className="mt-1 text-sm text-text-secondary">
                                {membership.description}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-text-primary">
                              {formatter.format(membership.price)} NOK
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Features */}
              {course.additionalFeatures.length > 0 && (
                <ExpandableFeatures features={course.additionalFeatures} />
              )}

              {/* Course Details */}
              <div className="rounded-lg bg-background-surface p-6 shadow-sm">
                <h2 className="mb-4 text-2xl font-semibold text-text-primary">Banedetaljer</h2>

                {/* Par Breakdown */}
                {(course.course.par3Count || course.course.par4Count || course.course.par5Count) && (
                  <div className="mb-6">
                    <h3 className="mb-2 font-semibold text-text-primary">Par-fordeling</h3>
                    <div className="space-y-1 text-text-secondary">
                      {course.course.par3Count && <div>Par 3: {course.course.par3Count} hull</div>}
                      {course.course.par4Count && <div>Par 4: {course.course.par4Count} hull</div>}
                      {course.course.par5Count && <div>Par 5: {course.course.par5Count} hull</div>}
                    </div>
                  </div>
                )}

                {/* Course Ratings Table */}
                {course.courseRatings.length > 0 && (
                  <div className="mb-6">
                    <h3 className="mb-2 font-semibold text-text-primary">Tee-valg</h3>
                    <div className="overflow-auto rounded-lg bg-background-hover p-3">
                      <table className="divide-border-default min-w-full divide-y">
                        <thead className="bg-background-elevated text-left text-sm font-semibold text-text-secondary">
                          <tr>
                            <th className="px-3 py-2">Tee</th>
                            <th className="px-3 py-2">CR</th>
                            <th className="px-3 py-2">Slope</th>
                            <th className="px-3 py-2">Par</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle text-sm text-text-secondary">
                          {course.courseRatings.map((rating, index) => (
                            <tr key={index}>
                              <td className="px-3 py-2">
                                {rating.teeColor} ({rating.gender === "men" ? "H" : "D"})
                              </td>
                              <td className="px-3 py-2">
                                {rating.courseRating?.toFixed(1) ?? "—"}
                              </td>
                              <td className="px-3 py-2">{rating.slopeRating ?? "—"}</td>
                              <td className="px-3 py-2">{rating.par ?? course.course.par ?? "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Additional Info */}
                <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                  <InfoRow label="Banetype" value={course.course.courseType} />
                  {course.course.lengthNote && <InfoRow label="Lengde" value={course.course.lengthNote} />}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
              {/* Contact */}
              <div className="rounded-lg bg-background-surface p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-text-primary">Kontaktinformasjon</h2>
                <div className="space-y-3 text-text-secondary">
                  {/* Primary Phone */}
                  {primaryPhone && (
                    <div>
                      <div className="font-semibold text-text-primary">Telefon</div>
                      <a
                        href={`tel:${primaryPhone.number}`}
                        className="text-primary hover:underline"
                      >
                        {primaryPhone.number}
                      </a>
                    </div>
                  )}

                  {/* Additional Phone Numbers */}
                  {sortedPhones.length > 1 && (
                    <div className="space-y-2">
                      {sortedPhones.slice(1).map((phone, index) => {
                        const label = getPhoneTypeLabel(phone.type);
                        return (
                          <div key={index}>
                            {label && (
                              <div className="font-semibold text-text-primary">{label}</div>
                            )}
                            <a
                              href={`tel:${phone.number}`}
                              className="text-primary hover:underline"
                            >
                              {phone.number}
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {course.contact.email && (
                    <div>
                      <div className="font-semibold text-text-primary">E-post</div>
                      <a href={`mailto:${course.contact.email}`} className="text-primary hover:underline">
                        {course.contact.email}
                      </a>
                    </div>
                  )}
                  {course.contact.website && (
                    <div>
                      <div className="font-semibold text-text-primary">Nettside</div>
                      <a
                        href={course.contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {course.contact.website.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  )}
                  {course.contact.facebook && (
                    <div>
                      <div className="font-semibold text-text-primary">Facebook</div>
                      <a
                        href={course.contact.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Facebook
                      </a>
                    </div>
                  )}
                  {course.contact.instagram && (
                    <div>
                      <div className="font-semibold text-text-primary">Instagram</div>
                      <a
                        href={course.contact.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {course.contact.instagram}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Weather */}
              {course.coordinates && (
                <WeatherWidget lat={course.coordinates.lat} lng={course.coordinates.lng} />
              )}

              {/* Practical Info */}
              <div className="rounded-lg bg-background-surface p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-text-primary">Praktisk info</h2>
                <div className="space-y-3 text-text-secondary">
                  {course.season.start && course.season.end && (
                    <div>
                      <div className="font-semibold text-text-primary">Sesong</div>
                      <p>
                        {course.season.start} – {course.season.end}
                      </p>
                    </div>
                  )}
                  {course.visitors.welcome && (
                    <div className="flex items-center gap-2">
                      <span className="text-primary">✓</span>
                      <span>Besøkende velkommen</span>
                    </div>
                  )}
                  {course.visitors.walkingAllowed && (
                    <div className="flex items-center gap-2">
                      <span className="text-primary">✓</span>
                      <span>Gåing tillatt</span>
                    </div>
                  )}
                  {course.visitors.distanceFromCenter && (
                    <div>
                      <div className="font-semibold text-text-primary">Avstand</div>
                      <p>{course.visitors.distanceFromCenter}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Map */}
              {course.coordinates && (
                <div className="rounded-lg bg-background-surface p-6 shadow-sm">
                  <h2 className="mb-4 text-xl font-semibold text-text-primary">Google Maps</h2>
                  <div className="border-border-default aspect-square w-full overflow-hidden rounded-lg border">
                    <iframe
                      src={`https://www.google.com/maps?q=${course.coordinates.lat},${course.coordinates.lng}&hl=no&z=14&output=embed`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-text-tertiary">
                    {addressLines.map((line) => (
                      <div key={line}>{line}</div>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>

      {/* Nearby Courses Section */}
      {nearbyCoursesData.length > 0 && (
        <section className="bg-background py-16">
          <div className="container mx-auto max-w-[1170px] px-4">
            <h2 className="mb-6 text-2xl font-semibold text-text-primary">Nærliggende baner</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {nearbyCoursesData.map(({ nearbyCourse, distanceKm }) => {
                const nearbyRating = calculateAverageRating(nearbyCourse.ratings);

                return (
                  <Link
                    key={nearbyCourse.slug}
                    href={`/${toRegionSlug(nearbyCourse.region)}/${nearbyCourse.slug}`}
                    className="group block rounded-lg bg-background-surface p-5 shadow-sm transition-shadow hover:shadow-md"
                  >
                    {/* Course Name */}
                    <h3 className="mb-2 font-semibold text-text-primary group-hover:text-primary">
                      {nearbyCourse.name}
                    </h3>

                    {/* City */}
                    <p className="mb-2 text-text-tertiary">{nearbyCourse.city}</p>

                    {/* Info Row */}
                    <div className="mb-3 flex items-center gap-3 text-text-secondary">
                      {/* Holes */}
                      <span className="flex items-center gap-1">
                        <span className="font-medium">{nearbyCourse.course.holes}</span> hull
                      </span>

                      {/* Rating */}
                      {nearbyRating && (
                        <span className="flex items-center gap-1">
                          <StarRating rating={nearbyRating.averageRating} size={14} />
                          <span className="font-medium">
                            {nearbyRating.averageRating.toFixed(1)}
                          </span>
                        </span>
                      )}
                    </div>

                    {/* Distance */}
                    {distanceKm && (
                      <div className="text-sm font-medium text-primary">
                        {distanceKm.toFixed(0)} km unna
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
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
