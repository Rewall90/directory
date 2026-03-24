import { getLocalizedName, getLocalizedSlug } from "@/lib/utils/locale-helpers";
import { buildCourseUrl } from "@/lib/utils/url-helpers";
import type { MapCourse } from "@/lib/courses";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface PopupLabels {
  holes: string;
  par: string;
  viewDetails: string;
}

export function buildMarkerPopupHtml(
  course: MapCourse,
  locale: string,
  labels: PopupLabels,
): string {
  const name = escapeHtml(getLocalizedName(course.name, course.name_en, locale));
  const slug = getLocalizedSlug(course.slug, course.slug_en, locale);
  const city = escapeHtml(course.city);
  const url = escapeHtml(buildCourseUrl(course.regionSlug, slug, locale));

  const ratingHtml = course.rating
    ? `<p class="text-sm">\u2B50 ${course.rating.toFixed(1)} (${course.reviewCount})</p>`
    : "";
  const feeHtml = course.greenFee18
    ? `<p class="mt-1 text-sm font-medium text-primary">${course.greenFee18} kr</p>`
    : "";

  return `<div class="p-2">
  <h3 class="font-semibold">${name}</h3>
  <p class="text-sm text-gray-600">${city}</p>
  <p class="text-sm">${course.holes} ${escapeHtml(labels.holes)} &bull; ${course.par ? `${escapeHtml(labels.par)} ${course.par}` : "\u2014"}</p>
  ${ratingHtml}
  ${feeHtml}
  <a href="${url}" class="mt-2 inline-block text-sm text-primary hover:underline">${escapeHtml(labels.viewDetails)} \u2192</a>
</div>`;
}
