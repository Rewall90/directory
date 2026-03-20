import { useTranslations } from "next-intl";

interface TrustBadgeProps {
  totalReviews: number;
  averageRating: number;
  courseCount: number;
}

function StarIcon({ filled = true }: { filled?: boolean }) {
  return (
    <svg
      className="h-[15px] w-[15px]"
      viewBox="0 0 20 20"
      fill="currentColor"
      style={{ color: "#d4a948", opacity: filled ? 1 : 0.35 }}
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg className="mr-1 inline h-3 w-3" viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function formatReviewCount(count: number): string {
  if (count >= 1000) {
    const rounded = Math.floor(count / 1000) * 1000;
    return `${(rounded / 1000).toLocaleString("nb-NO")} 000+`;
  }
  return count.toLocaleString("nb-NO");
}

export function TrustBadge({ totalReviews, averageRating, courseCount }: TrustBadgeProps) {
  const t = useTranslations("trustBadge");
  const roundedRating = Math.round(averageRating * 10) / 10;
  const fullStars = Math.floor(roundedRating);
  const hasPartial = roundedRating - fullStars >= 0.3;
  const totalFilled = hasPartial ? fullStars + 1 : fullStars;

  return (
    <div className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 text-[13px] backdrop-blur-sm sm:gap-3">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <StarIcon key={i} filled={i <= totalFilled} />
        ))}
      </div>

      <span className="text-sm font-bold text-white">{roundedRating.toFixed(1)}</span>

      <span className="h-3.5 w-px bg-white/20" />

      <span className="font-light" style={{ color: "hsl(132, 30%, 75%)" }}>
        <GoogleIcon />
        {t("reviewSummary", {
          count: formatReviewCount(totalReviews),
          courseCount,
        })}
      </span>
    </div>
  );
}
