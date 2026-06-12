"use client";

import { Fragment, useState } from "react";
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
 */
export function VtgClubFilter({ groups, totalCount }: Props) {
  const t = useTranslations("vtg");
  const [query, setQuery] = useState("");

  const filtered = groups
    .map((group) => ({
      ...group,
      clubs: group.clubs.filter((club) => matchesClubQuery(club.searchText, query)),
    }))
    .filter((group) => group.clubs.length > 0);

  const shown = filtered.reduce((sum, group) => sum + group.clubs.length, 0);

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
      </div>

      {filtered.map((group) => (
        <section key={group.regionSlug} className="mb-10">
          {group.heading}
          <div className="space-y-2.5">
            {group.clubs.map((club) => (
              <Fragment key={club.slug}>{club.card}</Fragment>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
