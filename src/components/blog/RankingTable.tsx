"use client";

import Link from "next/link";

interface RankingTableRow {
  rank: number;
  name: string;
  region: string;
  rating: number;
  reviewCount: number;
  score: number;
  courseSlug: string;
  regionSlug: string;
}

interface RankingTableProps {
  courses: RankingTableRow[];
}

export function RankingTable({ courses }: RankingTableProps) {
  const getRankBadge = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };

  const getRankColor = (rank: number) => {
    if (rank <= 3) return "bg-yellow-50 border-yellow-200";
    return "bg-background-surface hover:bg-background-elevated";
  };

  return (
    <div className="my-8">
      {/* Desktop Table View */}
      <div className="hidden overflow-x-auto rounded-lg border border-border-subtle shadow-sm md:block">
        <table className="w-full">
          <thead>
            <tr className="bg-primary/10 border-b border-border-subtle">
              <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Plass</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                Golfbane
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                Region
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-text-primary">
                Rating
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-text-primary">
                Anmeldelser
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-text-primary">
                Score
              </th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course, index) => (
              <tr
                key={index}
                className={`border-b border-border-subtle transition-colors last:border-0 ${getRankColor(
                  course.rank,
                )}`}
              >
                <td className="px-4 py-4 text-center">
                  <span className="text-xl font-bold text-primary">
                    {getRankBadge(course.rank)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <Link
                    href={`/${course.regionSlug}/${course.courseSlug}`}
                    className="font-semibold text-text-primary transition-colors hover:text-primary hover:underline"
                  >
                    {course.name}
                  </Link>
                </td>
                <td className="px-4 py-4">
                  <Link
                    href={`/${course.regionSlug}`}
                    className="text-text-secondary transition-colors hover:text-primary hover:underline"
                  >
                    {course.region}
                  </Link>
                </td>
                <td className="px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-semibold text-text-primary">{course.rating}</span>
                    <span className="text-yellow-500">⭐</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="text-text-secondary">{course.reviewCount}</span>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="bg-primary/10 rounded-full px-3 py-1 text-sm font-semibold text-primary">
                    {course.score}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="space-y-4 md:hidden">
        {courses.map((course, index) => (
          <div
            key={index}
            className={`rounded-lg border border-border-subtle p-4 shadow-sm ${getRankColor(
              course.rank,
            )}`}
          >
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold">{getRankBadge(course.rank)}</span>
                <div>
                  <Link
                    href={`/${course.regionSlug}/${course.courseSlug}`}
                    className="font-semibold text-text-primary transition-colors hover:text-primary hover:underline"
                  >
                    <h3>{course.name}</h3>
                  </Link>
                  <Link
                    href={`/${course.regionSlug}`}
                    className="text-sm text-text-secondary transition-colors hover:text-primary hover:underline"
                  >
                    <p>{course.region}</p>
                  </Link>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 border-t border-border-subtle pt-3">
              <div className="text-center">
                <div className="mb-1 text-xs uppercase text-text-tertiary">Rating</div>
                <div className="flex items-center justify-center gap-1">
                  <span className="font-semibold text-text-primary">{course.rating}</span>
                  <span className="text-sm text-yellow-500">⭐</span>
                </div>
              </div>
              <div className="text-center">
                <div className="mb-1 text-xs uppercase text-text-tertiary">Anmeldelser</div>
                <div className="font-medium text-text-secondary">{course.reviewCount}</div>
              </div>
              <div className="text-center">
                <div className="mb-1 text-xs uppercase text-text-tertiary">Score</div>
                <div className="bg-primary/10 inline-block rounded-full px-2 py-1 text-sm font-semibold text-primary">
                  {course.score}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
