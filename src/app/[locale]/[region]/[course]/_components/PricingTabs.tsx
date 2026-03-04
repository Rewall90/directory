"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Pricing, MembershipTier, MembershipStatus } from "@/types/course";

interface PricingTabsProps {
  pricing: Pricing | null;
  pricingYear: string | null;
  memberships: MembershipTier[];
  membershipStatus: MembershipStatus | null;
}

const formatter = new Intl.NumberFormat("no-NO");

type TabId = "greenfee" | "medlemskap" | "utstyr";

export function PricingTabs({
  pricing,
  pricingYear,
  memberships,
  membershipStatus,
}: PricingTabsProps) {
  const t = useTranslations("pricingTabs");
  const [activeTab, setActiveTab] = useState<TabId>("greenfee");

  // Determine which tabs to show
  const hasGreenfee =
    pricing && (pricing.greenFee18 || pricing.greenFeeWeekday || pricing.greenFee9);
  const hasMembership = memberships.length > 0 || membershipStatus;
  const hasEquipment =
    pricing && (pricing.cartRental || pricing.pullCartRental || pricing.clubRental);

  if (!hasGreenfee && !hasMembership && !hasEquipment) return null;

  const tabs: { id: TabId; label: string; show: boolean }[] = [
    { id: "greenfee", label: t("greenfeeTab"), show: !!hasGreenfee },
    { id: "medlemskap", label: t("membershipTab"), show: !!hasMembership },
    { id: "utstyr", label: t("equipmentTab"), show: !!hasEquipment },
  ];

  const visibleTabs = tabs.filter((t) => t.show);

  return (
    <section className="mx-auto max-w-[1200px] px-8 py-20">
      <div className="-mx-8 rounded-2xl bg-v3d-warm px-8 py-12 md:px-16">
        {/* Section Header */}
        <div className="mb-8 flex items-baseline gap-4">
          <span className="font-serif text-6xl font-normal text-v3d-accent">
            {t("sectionNumber")}
          </span>
          <h2 className="font-serif text-2xl font-medium text-v3d-text-dark">
            {t("title", { year: pricingYear || new Date().getFullYear() })}
          </h2>
        </div>

        {/* Tabs */}
        <div role="tablist" className="mb-8 flex gap-2 border-b border-v3d-border pb-2">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`relative rounded-t-md px-6 py-3 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-v3d-forest-soft text-v3d-forest"
                  : "text-v3d-text-muted hover:text-v3d-text-dark"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-v3d-forest" />
              )}
            </button>
          ))}
        </div>

        {/* Greenfee Panel */}
        {activeTab === "greenfee" && pricing && (
          <div
            role="tabpanel"
            id="panel-greenfee"
            aria-labelledby="tab-greenfee"
            className="grid gap-8 md:grid-cols-2"
          >
            {/* Standard */}
            <div className="rounded-xl border border-v3d-border bg-v3d-cream p-8">
              <h3 className="mb-6 border-b border-v3d-border pb-4 font-serif text-xl font-medium">
                {t("standard")}
              </h3>
              <div className="space-y-3">
                {(pricing.greenFee18 || pricing.greenFeeWeekday) && (
                  <div className="flex justify-between border-b border-v3d-border pb-3">
                    <span className="text-v3d-text-muted">{t("holes18")}</span>
                    <span className="font-semibold text-v3d-forest">
                      {formatter.format(pricing.greenFee18 ?? pricing.greenFeeWeekday ?? 0)}{" "}
                      {t("currency")}
                    </span>
                  </div>
                )}
                {pricing.greenFee9 && (
                  <div className="flex justify-between border-b border-v3d-border pb-3">
                    <span className="text-v3d-text-muted">{t("holes9")}</span>
                    <span className="font-semibold text-v3d-forest">
                      {formatter.format(pricing.greenFee9)} {t("currency")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Discounted */}
            <div className="rounded-xl border border-v3d-border bg-v3d-cream p-8">
              <h3 className="mb-6 border-b border-v3d-border pb-4 font-serif text-xl font-medium">
                {t("discounted")}
              </h3>
              <div className="space-y-3">
                {pricing.greenFeeJunior && (
                  <div className="flex justify-between border-b border-v3d-border pb-3">
                    <span className="text-v3d-text-muted">{t("junior")}</span>
                    <span className="font-semibold text-v3d-forest">
                      {formatter.format(pricing.greenFeeJunior)} {t("currency")}
                    </span>
                  </div>
                )}
                {pricing.greenFeeTwilight && (
                  <div className="flex justify-between border-b border-v3d-border pb-3">
                    <span className="text-v3d-text-muted">
                      {pricing.twilightStartTime
                        ? t("twilightWithTime", { time: pricing.twilightStartTime })
                        : t("twilight")}
                    </span>
                    <span className="font-semibold text-v3d-forest">
                      {formatter.format(pricing.greenFeeTwilight)} {t("currency")}
                    </span>
                  </div>
                )}
                {pricing.greenFeeSenior && (
                  <div className="flex justify-between border-b border-v3d-border pb-3">
                    <span className="text-v3d-text-muted">{t("senior")}</span>
                    <span className="font-semibold text-v3d-forest">
                      {formatter.format(pricing.greenFeeSenior)} {t("currency")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Medlemskap Panel */}
        {activeTab === "medlemskap" && (
          <div
            role="tabpanel"
            id="panel-medlemskap"
            aria-labelledby="tab-medlemskap"
            className="grid gap-8 md:grid-cols-2"
          >
            {/* Membership Prices */}
            {memberships.length > 0 && (
              <div className="rounded-xl border border-v3d-border bg-v3d-cream p-8">
                <h3 className="mb-6 border-b border-v3d-border pb-4 font-serif text-xl font-medium">
                  {t("membership")}
                </h3>
                <div className="space-y-3">
                  {memberships.map((m, i) => (
                    <div
                      key={i}
                      className="flex justify-between border-b border-v3d-border pb-3 last:border-b-0"
                    >
                      <span className="text-v3d-text-muted">{m.name || m.category}</span>
                      <span className="font-semibold text-v3d-forest">
                        {formatter.format(m.totalAnnual ?? m.price)} {t("perYear")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status */}
            {membershipStatus && (
              <div className="rounded-xl border border-v3d-border bg-v3d-cream p-8">
                <h3 className="mb-6 border-b border-v3d-border pb-4 font-serif text-xl font-medium">
                  {t("status")}
                </h3>
                <div className="space-y-3">
                  {membershipStatus.waitingListSize && (
                    <div className="flex justify-between border-b border-v3d-border pb-3">
                      <span className="text-v3d-text-muted">{t("waitingList")}</span>
                      <span className="font-semibold text-v3d-forest">
                        {t("waitingListPersons", { count: membershipStatus.waitingListSize })}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-b border-v3d-border pb-3">
                    <span className="text-v3d-text-muted">{t("admission")}</span>
                    <span className="font-semibold text-v3d-forest">
                      {membershipStatus.status === "open"
                        ? t("admissionOpen")
                        : membershipStatus.status === "waitlist"
                          ? t("admissionWaitlist")
                          : t("admissionClosed")}
                    </span>
                  </div>
                  {membershipStatus.waitingListYears && (
                    <div className="flex justify-between">
                      <span className="text-v3d-text-muted">{t("waitingTime")}</span>
                      <span className="font-semibold text-v3d-forest">
                        {t("waitingTimeYears", { years: membershipStatus.waitingListYears })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Utstyr Panel */}
        {activeTab === "utstyr" && pricing && (
          <div
            role="tabpanel"
            id="panel-utstyr"
            aria-labelledby="tab-utstyr"
            className="grid gap-8 md:grid-cols-2"
          >
            <div className="rounded-xl border border-v3d-border bg-v3d-cream p-8">
              <h3 className="mb-6 border-b border-v3d-border pb-4 font-serif text-xl font-medium">
                {t("rental")}
              </h3>
              <div className="space-y-3">
                {pricing.cartRental && (
                  <div className="flex justify-between border-b border-v3d-border pb-3">
                    <span className="text-v3d-text-muted">{t("golfCart")}</span>
                    <span className="font-semibold text-v3d-forest">
                      {formatter.format(pricing.cartRental)} {t("currency")}
                    </span>
                  </div>
                )}
                {pricing.pullCartRental && (
                  <div className="flex justify-between border-b border-v3d-border pb-3">
                    <span className="text-v3d-text-muted">{t("pullCart")}</span>
                    <span className="font-semibold text-v3d-forest">
                      {formatter.format(pricing.pullCartRental)} {t("currency")}
                    </span>
                  </div>
                )}
                {pricing.clubRental && (
                  <div className="flex justify-between">
                    <span className="text-v3d-text-muted">{t("clubSet")}</span>
                    <span className="font-semibold text-v3d-forest">
                      {formatter.format(pricing.clubRental)} {t("currency")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
