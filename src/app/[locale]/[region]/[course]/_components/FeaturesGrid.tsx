"use client";

import { useTranslations } from "next-intl";
import type { Facilities } from "@/types/course";

interface FeaturesGridProps {
  facilities: Facilities | null;
  winterUse: string | null;
  winterUse_en?: string | null;
  locale: "nb" | "en";
}

interface FeatureGroup {
  icon: string;
  title: string;
  items: string[];
}

export function FeaturesGrid({ facilities, winterUse, winterUse_en, locale }: FeaturesGridProps) {
  const t = useTranslations("featuresGrid");

  // Select localized winter use text
  const winterUseText = locale === "en" && winterUse_en ? winterUse_en : winterUse;

  function buildFeatureGroups(facilities: Facilities | null): FeatureGroup[] {
    if (!facilities) return [];

    const groups: FeatureGroup[] = [];

    // Training
    const training: string[] = [];
    if (facilities.drivingRange) {
      training.push(
        facilities.drivingRangeLength
          ? t("drivingRangeWithLength", { length: facilities.drivingRangeLength })
          : t("drivingRange"),
      );
    }
    if (facilities.puttingGreen) training.push(t("puttingGreen"));
    if (facilities.chippingArea) training.push(t("chippingArea"));
    if (facilities.practiceBunker) training.push(t("practiceBunker"));
    if (training.length) {
      groups.push({ icon: "\u{1F3CC}\uFE0F", title: t("trainingFacilities"), items: training });
    }

    // Clubhouse
    const clubhouse: string[] = [];
    if (facilities.clubhouse) clubhouse.push(facilities.clubhouseName || t("clubhouse"));
    if (facilities.proShop) clubhouse.push(t("proShop"));
    if (facilities.restaurant) {
      clubhouse.push(
        facilities.restaurantName
          ? t("restaurantNamed", { name: facilities.restaurantName })
          : t("restaurant"),
      );
    }
    if (facilities.lockerRooms) clubhouse.push(t("lockerRooms"));
    if (facilities.conferenceRoom) clubhouse.push(t("conferenceRoom"));
    if (clubhouse.length) {
      groups.push({ icon: "\u{1F3E0}", title: t("clubhouse"), items: clubhouse });
    }

    // Services
    const services: string[] = [];
    if (facilities.clubRental) services.push(t("clubRental"));
    if (facilities.cartRental) services.push(t("cartRental"));
    if (facilities.pullCartRental) services.push(t("pullCartRental"));
    if (facilities.golfLessons) services.push(t("golfLessons"));
    if (facilities.teachingPro) services.push(t("teachingPro"));
    if (facilities.simulator) {
      services.push(
        facilities.simulatorType
          ? t("simulatorTyped", { type: facilities.simulatorType })
          : t("simulator"),
      );
    }
    if (services.length) {
      groups.push({ icon: "\u26F3", title: t("services"), items: services });
    }

    return groups;
  }

  const groups = buildFeatureGroups(facilities);

  if (groups.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1200px] px-8 py-20">
      {/* Section Header */}
      <div className="mb-8 flex items-baseline gap-4">
        <span className="font-serif text-6xl font-normal text-v3d-accent">
          {t("sectionNumber")}
        </span>
        <h2 className="font-serif text-2xl font-medium text-v3d-text-dark">{t("title")}</h2>
      </div>

      {/* Feature Cards */}
      <div className="grid gap-8 md:grid-cols-3">
        {groups.map((group) => (
          <div
            key={group.title}
            className="rounded-lg border border-transparent bg-v3d-warm p-8 transition-all hover:-translate-y-1 hover:border-v3d-forest-soft hover:shadow-lg"
          >
            {/* Icon */}
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-v3d-forest-soft text-2xl">
              {group.icon}
            </div>

            {/* Title */}
            <h3 className="mb-3 font-serif text-xl font-medium text-v3d-text-dark">
              {group.title}
            </h3>

            {/* Items */}
            <ul className="space-y-2 text-v3d-text-muted">
              {group.items.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 border-b border-v3d-border pb-2 last:border-b-0"
                >
                  <span className="text-v3d-forest">{"\u2713"}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Winter Use Note */}
      {winterUseText && (
        <div className="mt-8 border-t border-v3d-border pt-6">
          <h3 className="mb-3 font-semibold text-v3d-text-dark">{t("winter")}</h3>
          <div className="flex gap-2 text-v3d-text-muted">
            <span className="text-v3d-forest">{"\u2713"}</span>
            <span>{winterUseText}</span>
          </div>
        </div>
      )}
    </section>
  );
}
