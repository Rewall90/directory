"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { matchesClubQuery } from "@/lib/vtg";

/** A club card pre-rendered by the server, with its pre-lowercased search text */
export interface FilterableClub {
  slug: string;
  searchText: string;
  card: React.ReactNode;
}

/** A region group whose heading (h2 + subtitle + links) is server-authored */
export interface FilterableGroup {
  regionSlug: string;
  regionName: string;
  heading: React.ReactNode;
  clubs: FilterableClub[];
}

interface Props {
  groups: FilterableGroup[];
  totalCount: number;
}

/**
 * Client-side "find your club" filter for the VTG hub page.
 *
 * Pure client state (useState) — no URL/router involvement. All cards and
 * headings are rendered by the server and passed in as React nodes; this
 * component only decides which of them to show, so the initial/no-JS payload
 * always contains the full club list.
 *
 * Filtered-out cards/groups are CSS-hidden (`hidden` class) rather than
 * unmounted: the rendered DOM stays identical to the server HTML, region
 * heading anchors (h2 id) remain available for jump links mid-filter, and
 * cards don't remount as the query changes.
 */
export function VtgClubFilter({ groups, totalCount }: Props) {
  const t = useTranslations("vtg");
  const [query, setQuery] = useState("");

  const matches = groups.map((group) =>
    group.clubs.map((club) => matchesClubQuery(club.searchText, query)),
  );

  const shown = matches.reduce((sum, groupMatches) => sum + groupMatches.filter(Boolean).length, 0);

  return (
    <>
      <div className="mb-8 max-w-sm">
        <label htmlFor="vtg-club-filter" className="mb-1 block text-sm text-text-secondary">
          {t("filterLabel")}
        </label>
        <input
          id="vtg-club-filter"
          type="search"
          autoComplete="off"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("filterPlaceholder")}
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
        />
        <p aria-live="polite" className="mt-1 text-xs text-text-tertiary">
          {t("filterCount", { shown, total: totalCount })}
        </p>
        {shown === 0 && query.trim() !== "" && (
          <p className="mt-2 text-sm text-text-secondary">{t("filterEmpty", { query })}</p>
        )}
      </div>

      {groups.map((group, groupIndex) => {
        const groupMatches = matches[groupIndex];
        const groupHasMatch = groupMatches.some(Boolean);
        return (
          <section key={group.regionSlug} className={groupHasMatch ? "mb-10" : "mb-10 hidden"}>
            {group.heading}
            <div className="space-y-2.5">
              {group.clubs.map((club, clubIndex) => (
                <div key={club.slug} className={groupMatches[clubIndex] ? undefined : "hidden"}>
                  {club.card}
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
