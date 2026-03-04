import Image from "next/image";
import type { Review } from "@/types/course";
import { getReviews } from "@/lib/reviews";
import { ReviewForm } from "./ReviewForm";

interface ReviewSectionProps {
  courseSlug: string;
  courseName: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          viewBox="0 0 24 24"
          className={`h-4 w-4 ${star <= rating ? "fill-v3d-gold" : "fill-gray-300"}`}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const formattedDate = new Date(review.date).toLocaleDateString("no-NO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="rounded-lg border border-v3d-border bg-v3d-warm p-6">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="font-medium text-v3d-text-dark">{review.author}</div>
          <div className="text-sm text-v3d-text-muted">{formattedDate}</div>
        </div>
        <StarRating rating={review.rating} />
      </div>
      <p className="leading-relaxed text-v3d-text-body">{review.text}</p>
      {review.images && review.images.length > 0 && (
        <div className="mt-4 flex gap-2">
          {review.images.map((src, i) => (
            <div
              key={i}
              className="relative h-20 w-20 overflow-hidden rounded-lg border border-v3d-border"
            >
              <Image
                src={src}
                alt={`Bilde ${i + 1} fra ${review.author}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ReviewSection({ courseSlug, courseName }: ReviewSectionProps) {
  const reviews = getReviews(courseSlug);

  return (
    <section id="anmeldelser" className="mx-auto max-w-[1200px] scroll-mt-8 px-8 py-20">
      {/* Section Header */}
      <div className="mb-8 flex items-baseline gap-4">
        <span className="font-serif text-6xl font-normal text-v3d-accent">05</span>
        <h2 className="font-serif text-2xl font-medium text-v3d-text-dark">Anmeldelser</h2>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Left: Review List */}
        <div>
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review, index) => (
                <ReviewCard key={`${review.author}-${review.date}-${index}`} review={review} />
              ))}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-v3d-border p-12">
              <p className="text-center text-v3d-text-muted">
                Ingen anmeldelser ennå. Bli den første!
              </p>
            </div>
          )}
        </div>

        {/* Right: Review Form */}
        <div>
          <ReviewForm courseSlug={courseSlug} courseName={courseName} />
        </div>
      </div>
    </section>
  );
}
