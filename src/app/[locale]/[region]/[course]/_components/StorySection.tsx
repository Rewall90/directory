import Image from "next/image";
import type { Course, PlacePhoto } from "@/types/course";

interface StorySectionProps {
  course: Course;
  photos: PlacePhoto[];
}

export function StorySection({ course, photos }: StorySectionProps) {
  if (!course.description) return null;

  // Split description into lead (first sentence) and rest
  const sentences = course.description.split(/(?<=\.)\s+/);
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
            <span className="font-serif text-6xl font-normal text-v3d-accent">01</span>
            <h2 className="font-serif text-2xl font-medium text-v3d-text-dark">Historien</h2>
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
                alt="Banen fra luften"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 560px"
              />
            ) : (
              <span className="text-xs text-v3d-text-light">
                [ Galleribilde 1 - Banen fra luften ]
              </span>
            )}
          </div>

          {/* Two smaller images */}
          <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-dashed border-v3d-border bg-v3d-warm">
            {galleryPhotos[1] ? (
              <Image
                src={galleryPhotos[1].url}
                alt="Hull"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 270px"
              />
            ) : (
              <span className="text-xs text-v3d-text-light">[ Hull 14 ]</span>
            )}
          </div>
          <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-dashed border-v3d-border bg-v3d-warm">
            {galleryPhotos[2] ? (
              <Image
                src={galleryPhotos[2].url}
                alt="Klubbhuset"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 270px"
              />
            ) : (
              <span className="text-xs text-v3d-text-light">[ Klubbhuset ]</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
