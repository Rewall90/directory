import type { Course } from "@/types/course";
import { WeatherWidget } from "./WeatherWidget";

interface ContactSectionProps {
  course: Course;
}

export function ContactSection({ course }: ContactSectionProps) {
  const addressLines = [
    [course.address.street, course.address.area].filter(Boolean).join(", "),
    `${course.address.postalCode} ${course.city}`,
  ].filter(Boolean);

  const primaryPhone = course.phoneNumbers[0];

  return (
    <section className="mx-auto max-w-[1200px] px-8 py-20">
      {/* Section Header */}
      <div className="mb-8 flex items-baseline gap-4">
        <span className="font-serif text-6xl font-normal text-v3d-accent">04</span>
        <h2 className="font-serif text-2xl font-medium text-v3d-text-dark">Finn oss</h2>
      </div>

      <div className="grid gap-12 md:grid-cols-[1.5fr_1fr]">
        {/* Left: Map */}
        <div className="overflow-hidden rounded-xl border border-v3d-border bg-v3d-warm">
          {/* Map Embed */}
          {course.coordinates ? (
            <iframe
              src={`https://www.google.com/maps?q=${course.coordinates.lat},${course.coordinates.lng}&hl=no&z=14&output=embed`}
              className="h-[300px] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="flex h-[300px] items-center justify-center bg-gradient-to-br from-v3d-warm to-v3d-accent text-v3d-text-light">
              [ Google Maps embed ]
            </div>
          )}

          {/* Address */}
          <div className="p-6">
            <div className="mb-4">
              <strong className="block font-serif text-xl font-medium text-v3d-text-dark">
                {course.address.street || course.name}
              </strong>
              {addressLines.map((line, i) => (
                <span key={i} className="block text-v3d-text-body">
                  {line}
                </span>
              ))}
            </div>

            {course.coordinates && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${course.coordinates.lat},${course.coordinates.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-medium text-v3d-forest transition-all hover:gap-3"
              >
                Få veibeskrivelse →
              </a>
            )}
          </div>
        </div>

        {/* Right: Contact Cards + Weather */}
        <div className="space-y-4">
          {/* Contact Card */}
          <div className="rounded-xl border border-v3d-border bg-v3d-warm p-6">
            <h3 className="mb-6 font-serif text-xl font-medium text-v3d-text-dark">Kontakt oss</h3>

            <div className="space-y-4">
              {/* Phone */}
              {primaryPhone && (
                <div className="flex items-center gap-4 border-b border-v3d-border pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-v3d-forest-soft">
                    📱
                  </div>
                  <div>
                    <small className="block text-xs uppercase tracking-wider text-v3d-text-light">
                      Telefon
                    </small>
                    <a href={`tel:${primaryPhone.number}`} className="font-medium text-v3d-forest">
                      {primaryPhone.number}
                    </a>
                  </div>
                </div>
              )}

              {/* Email */}
              {course.contact.email && (
                <div className="flex items-center gap-4 border-b border-v3d-border pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-v3d-forest-soft">
                    ✉️
                  </div>
                  <div>
                    <small className="block text-xs uppercase tracking-wider text-v3d-text-light">
                      E-post
                    </small>
                    <a
                      href={`mailto:${course.contact.email}`}
                      className="font-medium text-v3d-forest"
                    >
                      {course.contact.email}
                    </a>
                  </div>
                </div>
              )}

              {/* Website */}
              {course.contact.website && (
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-v3d-forest-soft">
                    🌐
                  </div>
                  <div>
                    <small className="block text-xs uppercase tracking-wider text-v3d-text-light">
                      Nettside
                    </small>
                    <a
                      href={course.contact.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-v3d-forest"
                    >
                      {course.contact.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Weather Widget */}
          {course.coordinates && (
            <div className="rounded-xl bg-gradient-to-br from-v3d-forest to-v3d-forest-light p-6 text-white">
              <h4 className="mb-4 text-xs uppercase tracking-widest opacity-80">Været på banen</h4>
              <WeatherWidget lat={course.coordinates.lat} lng={course.coordinates.lng} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
