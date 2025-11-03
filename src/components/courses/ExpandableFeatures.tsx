"use client";

import { useState } from "react";

interface Feature {
  id: string;
  feature: string;
  description: string | null;
}

interface ExpandableFeaturesProps {
  features: Feature[];
}

export function ExpandableFeatures({ features }: ExpandableFeaturesProps) {
  const [expanded, setExpanded] = useState(false);
  const displayFeatures = expanded ? features : features.slice(0, 5);
  const hasMore = features.length > 5;

  return (
    <div className="rounded-lg bg-background-surface p-6 shadow-sm">
      <h2 className="mb-6 text-2xl font-semibold text-text-primary">Verdt å vite</h2>
      <ul className="space-y-3 text-text-secondary">
        {displayFeatures.map((feature) => (
          <li key={feature.id} className="flex gap-3">
            <span className="text-primary flex-shrink-0 mt-0.5">•</span>
            <div>
              <div className="font-medium text-text-primary">{feature.feature}</div>
              {feature.description && (
                <div className="mt-1 text-sm leading-relaxed whitespace-pre-line">
                  {feature.description}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 text-sm font-medium text-primary hover:underline"
        >
          {expanded ? "Vis mindre ▲" : "Les mer ▼"}
        </button>
      )}
    </div>
  );
}
