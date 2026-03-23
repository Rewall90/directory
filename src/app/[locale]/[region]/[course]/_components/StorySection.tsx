import Image from "next/image";
import { useTranslations } from "next-intl";
import type { Course } from "@/types/course";
import type { DisplayPhoto } from "../page";
import { getLocalizedDescription } from "@/lib/i18n-courses";

interface StorySectionProps {
  course: Course;
  photos: DisplayPhoto[];
  locale: "nb" | "en";
}

export function StorySection({ course, photos, locale }: StorySectionProps) {
  const t = useTranslations("storySection");

  const description = getLocalizedDescription(course, locale);
  if (!description) return null;

  // Split description into lead (first sentence) and rest
  const sentences = description.split(/(?<=\.)\s+/);
  const lead = sentences[0];
  const rest = sentences.slice(1).join(" ");

  // Get gallery photos (skip first 2 used in hero)
  const galleryPhotos = photos.slice(2, 5);

  return (
    <section className="mx-auto max-w-[1200px] px-8 py-20">
      <div className="grid gap-16 md:grid-cols-2">
        {/* Left: Story Content */}
        <div>
          {/* Section Header */}
          <div className="mb-8 flex items-baseline gap-4">
            <span className="font-serif text-6xl font-normal text-v3d-accent">
              {t("sectionNumber")}
            </span>
            <h2 className="font-serif text-2xl font-medium text-v3d-text-dark">{t("title")}</h2>
          </div>

          {/* Lead Paragraph */}
          <p className="mb-8 border-l-[3px] border-v3d-gold pl-6 text-xl font-light leading-relaxed text-v3d-text-dark">
            {lead}
          </p>

          {/* Rest of Description */}
          {rest && (
            <div className="space-y-6 text-lg leading-relaxed text-v3d-text-body">
              {rest.split(/\n\n/).map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          )}
        </div>

        {/* Right: Gallery */}
        <div className="grid grid-cols-2 gap-4">
          {/* Large image spanning 2 columns */}
          <div className="relative col-span-2 flex aspect-[2/1] items-center justify-center overflow-hidden rounded-lg border border-dashed border-v3d-border bg-v3d-warm">
            {galleryPhotos[0] ? (
              <Image
                src={galleryPhotos[0].url}
                alt={galleryPhotos[0].alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 560px"
                loading="lazy"
                {...((galleryPhotos[0] as any).placeholder
                  ? {
                      placeholder: "blur" as const,
                      blurDataURL: (galleryPhotos[0] as any).placeholder,
                    }
                  : {})}
              />
            ) : (
              <span className="text-xs text-v3d-text-light">{t("galleryPlaceholder1")}</span>
            )}
          </div>

          {/* Two smaller images */}
          <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-dashed border-v3d-border bg-v3d-warm">
            {galleryPhotos[1] ? (
              <Image
                src={galleryPhotos[1].url}
                alt={galleryPhotos[1].alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 270px"
                loading="lazy"
                {...((galleryPhotos[1] as any).placeholder
                  ? {
                      placeholder: "blur" as const,
                      blurDataURL: (galleryPhotos[1] as any).placeholder,
                    }
                  : {})}
              />
            ) : (
              <span className="text-xs text-v3d-text-light">{t("galleryPlaceholder2")}</span>
            )}
          </div>
          <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-dashed border-v3d-border bg-v3d-warm">
            {galleryPhotos[2] ? (
              <Image
                src={galleryPhotos[2].url}
                alt={galleryPhotos[2].alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 270px"
                loading="lazy"
                {...((galleryPhotos[2] as any).placeholder
                  ? {
                      placeholder: "blur" as const,
                      blurDataURL: (galleryPhotos[2] as any).placeholder,
                    }
                  : {})}
              />
            ) : (
              <span className="text-xs text-v3d-text-light">{t("galleryPlaceholder3")}</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
