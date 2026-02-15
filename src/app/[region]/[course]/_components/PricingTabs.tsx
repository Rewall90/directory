"use client";

import { useState } from "react";
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
  const [activeTab, setActiveTab] = useState<TabId>("greenfee");

  // Determine which tabs to show
  const hasGreenfee =
    pricing && (pricing.greenFee18 || pricing.greenFeeWeekday || pricing.greenFee9);
  const hasMembership = memberships.length > 0 || membershipStatus;
  const hasEquipment =
    pricing && (pricing.cartRental || pricing.pullCartRental || pricing.clubRental);

  if (!hasGreenfee && !hasMembership && !hasEquipment) return null;

  const tabs: { id: TabId; label: string; show: boolean }[] = [
    { id: "greenfee", label: "Greenfee", show: !!hasGreenfee },
    { id: "medlemskap", label: "Medlemskap", show: !!hasMembership },
    { id: "utstyr", label: "Utstyr", show: !!hasEquipment },
  ];

  const visibleTabs = tabs.filter((t) => t.show);

  return (
    <section className="mx-auto max-w-[1200px] px-8 py-20">
      <div className="-mx-8 rounded-2xl bg-v3d-warm px-8 py-12 md:px-16">
        {/* Section Header */}
        <div className="mb-8 flex items-baseline gap-4">
          <span className="font-serif text-6xl font-normal text-v3d-accent">03</span>
          <h2 className="font-serif text-2xl font-medium text-v3d-text-dark">
            Priser {pricingYear || new Date().getFullYear()}
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
                Standard
              </h3>
              <div className="space-y-3">
                {(pricing.greenFee18 || pricing.greenFeeWeekday) && (
                  <div className="flex justify-between border-b border-v3d-border pb-3">
                    <span className="text-v3d-text-muted">18 hull</span>
                    <span className="font-semibold text-v3d-forest">
                      {formatter.format(pricing.greenFee18 ?? pricing.greenFeeWeekday ?? 0)} kr
                    </span>
                  </div>
                )}
                {pricing.greenFee9 && (
                  <div className="flex justify-between border-b border-v3d-border pb-3">
                    <span className="text-v3d-text-muted">9 hull</span>
                    <span className="font-semibold text-v3d-forest">
                      {formatter.format(pricing.greenFee9)} kr
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Discounted */}
            <div className="rounded-xl border border-v3d-border bg-v3d-cream p-8">
              <h3 className="mb-6 border-b border-v3d-border pb-4 font-serif text-xl font-medium">
                Rabattert
              </h3>
              <div className="space-y-3">
                {pricing.greenFeeJunior && (
                  <div className="flex justify-between border-b border-v3d-border pb-3">
                    <span className="text-v3d-text-muted">Junior (under 18)</span>
                    <span className="font-semibold text-v3d-forest">
                      {formatter.format(pricing.greenFeeJunior)} kr
                    </span>
                  </div>
                )}
                {pricing.greenFeeTwilight && (
                  <div className="flex justify-between border-b border-v3d-border pb-3">
                    <span className="text-v3d-text-muted">
                      Kveld
                      {pricing.twilightStartTime ? ` (etter ${pricing.twilightStartTime})` : ""}
                    </span>
                    <span className="font-semibold text-v3d-forest">
                      {formatter.format(pricing.greenFeeTwilight)} kr
                    </span>
                  </div>
                )}
                {pricing.greenFeeSenior && (
                  <div className="flex justify-between border-b border-v3d-border pb-3">
                    <span className="text-v3d-text-muted">Senior</span>
                    <span className="font-semibold text-v3d-forest">
                      {formatter.format(pricing.greenFeeSenior)} kr
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
                  Medlemskap
                </h3>
                <div className="space-y-3">
                  {memberships.map((m, i) => (
                    <div
                      key={i}
                      className="flex justify-between border-b border-v3d-border pb-3 last:border-b-0"
                    >
                      <span className="text-v3d-text-muted">{m.name || m.category}</span>
                      <span className="font-semibold text-v3d-forest">
                        {formatter.format(m.totalAnnual ?? m.price)} kr/år
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
                  Status
                </h3>
                <div className="space-y-3">
                  {membershipStatus.waitingListSize && (
                    <div className="flex justify-between border-b border-v3d-border pb-3">
                      <span className="text-v3d-text-muted">Venteliste</span>
                      <span className="font-semibold text-v3d-forest">
                        ~{formatter.format(membershipStatus.waitingListSize)} personer
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-b border-v3d-border pb-3">
                    <span className="text-v3d-text-muted">Opptak</span>
                    <span className="font-semibold text-v3d-forest">
                      {membershipStatus.status === "open"
                        ? "Åpent"
                        : membershipStatus.status === "waitlist"
                          ? "Venteliste"
                          : "Stengt"}
                    </span>
                  </div>
                  {membershipStatus.waitingListYears && (
                    <div className="flex justify-between">
                      <span className="text-v3d-text-muted">Ventetid</span>
                      <span className="font-semibold text-v3d-forest">
                        Ca. {membershipStatus.waitingListYears} år
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
                Utleie
              </h3>
              <div className="space-y-3">
                {pricing.cartRental && (
                  <div className="flex justify-between border-b border-v3d-border pb-3">
                    <span className="text-v3d-text-muted">Golfbil (18 hull)</span>
                    <span className="font-semibold text-v3d-forest">
                      {formatter.format(pricing.cartRental)} kr
                    </span>
                  </div>
                )}
                {pricing.pullCartRental && (
                  <div className="flex justify-between border-b border-v3d-border pb-3">
                    <span className="text-v3d-text-muted">Tralle</span>
                    <span className="font-semibold text-v3d-forest">
                      {formatter.format(pricing.pullCartRental)} kr
                    </span>
                  </div>
                )}
                {pricing.clubRental && (
                  <div className="flex justify-between">
                    <span className="text-v3d-text-muted">Klubber (sett)</span>
                    <span className="font-semibold text-v3d-forest">
                      {formatter.format(pricing.clubRental)} kr
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
