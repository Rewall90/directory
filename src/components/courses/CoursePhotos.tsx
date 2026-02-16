"use client";

import { useState } from "react";
import Image from "next/image";
import type { PlacePhoto } from "@/types/course";

interface CoursePhotosProps {
  photos: PlacePhoto[];
  courseName: string;
}

/**
 * Displays course photos in hero + gallery layout
 * Hero: First photo, full width
 * Gallery: Remaining photos in 3-column grid
 *
 * Includes Google attribution as required by ToS
 */
export function CoursePhotos({ photos, courseName }: CoursePhotosProps) {
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [heroFailed, setHeroFailed] = useState(false);

  if (photos.length === 0) {
    return null;
  }

  const [heroPhoto, ...galleryPhotos] = photos;

  // Filter out failed gallery images
  const validGalleryPhotos = galleryPhotos.filter((photo) => !failedImages.has(photo.url));

  // If hero image failed, hide the entire component
  if (heroFailed) {
    return null;
  }

  const handleGalleryError = (url: string) => {
    setFailedImages((prev) => new Set(prev).add(url));
  };

  return (
    <section className="mb-8">
      <div className="container mx-auto max-w-[1170px] px-4">
        {/* Hero Photo */}
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl">
          <Image
            src={heroPhoto.url}
            alt={`${courseName} - hovedbilde`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            priority
            onError={() => setHeroFailed(true)}
          />
          {/* Attribution overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-2">
            <p
              className="text-xs text-white/80"
              dangerouslySetInnerHTML={{
                __html: `Foto: ${heroPhoto.attributionHtml}`,
              }}
            />
          </div>
        </div>

        {/* Gallery Grid */}
        {validGalleryPhotos.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {validGalleryPhotos.map((photo, index) => (
              <div key={photo.url} className="relative aspect-[4/3] overflow-hidden rounded-lg">
                <Image
                  src={photo.url}
                  alt={`${courseName} - bilde ${index + 2}`}
                  fill
                  className="object-cover transition-transform hover:scale-105"
                  sizes="(max-width: 768px) 33vw, 300px"
                  onError={() => handleGalleryError(photo.url)}
                />
                {/* Small attribution tooltip on hover */}
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity hover:opacity-100">
                  <p
                    className="w-full truncate px-2 py-1 text-xs text-white/80"
                    dangerouslySetInnerHTML={{
                      __html: photo.attributionHtml,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
