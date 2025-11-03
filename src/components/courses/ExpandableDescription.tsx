"use client";

import { useState } from "react";

interface ExpandableDescriptionProps {
  description: string;
  signatureHole?: string | null;
  scenicHole?: string | null;
  terrain?: string | null;
}

export function ExpandableDescription({
  description,
  signatureHole,
  scenicHole,
  terrain,
}: ExpandableDescriptionProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="border-b border-border-subtle bg-background py-12">
      <div className="container mx-auto max-w-[1170px] px-4">
        <h2 className="mb-6 text-2xl font-semibold text-text-primary">Om Banen</h2>

        {/* Main Description */}
        <div className="rounded-lg bg-background-surface p-6 shadow-sm">
          <p className={`leading-relaxed text-text-secondary ${!expanded && "line-clamp-3"}`}>
            {description}
          </p>
          {description.length > 200 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-3 text-sm font-medium text-primary hover:underline"
            >
              {expanded ? "Vis mindre ▲" : "Les mer ▼"}
            </button>
          )}
        </div>

        {/* Additional Information Grid */}
        {(signatureHole || scenicHole || terrain) && (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {signatureHole && (
              <div className="rounded-lg bg-background-surface p-5 shadow-sm">
                <h3 className="mb-2 font-semibold text-text-primary">Signatur Hull</h3>
                <p className="leading-relaxed text-text-secondary">{signatureHole}</p>
              </div>
            )}
            {scenicHole && (
              <div className="rounded-lg bg-background-surface p-5 shadow-sm">
                <h3 className="mb-2 font-semibold text-text-primary">Naturskjønne Hull</h3>
                <p className="leading-relaxed text-text-secondary">{scenicHole}</p>
              </div>
            )}
            {terrain && (
              <div
                className={`rounded-lg bg-background-surface p-5 shadow-sm ${!signatureHole && !scenicHole ? "md:col-span-2" : signatureHole && scenicHole ? "md:col-span-2" : ""}`}
              >
                <h3 className="mb-2 font-semibold text-text-primary">Terreng</h3>
                <p className="leading-relaxed text-text-secondary">{terrain}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
