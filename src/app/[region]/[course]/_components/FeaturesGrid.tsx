import type { Facilities } from "@/types/course";

interface FeaturesGridProps {
  facilities: Facilities | null;
  winterUse: string | null;
}

interface FeatureGroup {
  icon: string;
  title: string;
  items: string[];
}

function buildFeatureGroups(facilities: Facilities | null): FeatureGroup[] {
  if (!facilities) return [];

  const groups: FeatureGroup[] = [];

  // Training
  const training: string[] = [];
  if (facilities.drivingRange) {
    const length = facilities.drivingRangeLength ? ` (${facilities.drivingRangeLength} m)` : "";
    training.push(`Driving Range${length}`);
  }
  if (facilities.puttingGreen) training.push("Putting Green");
  if (facilities.chippingArea) training.push("Chipping Area");
  if (facilities.practiceBunker) training.push("Practice Bunker");
  if (training.length) {
    groups.push({ icon: "🏌️", title: "Treningsfasiliteter", items: training });
  }

  // Clubhouse
  const clubhouse: string[] = [];
  if (facilities.clubhouse) clubhouse.push(facilities.clubhouseName || "Klubbhus");
  if (facilities.proShop) clubhouse.push("Pro Shop");
  if (facilities.restaurant) {
    clubhouse.push(
      facilities.restaurantName ? `Restaurant – ${facilities.restaurantName}` : "Restaurant",
    );
  }
  if (facilities.lockerRooms) clubhouse.push("Garderoberom");
  if (facilities.conferenceRoom) clubhouse.push("Konferanserom");
  if (clubhouse.length) {
    groups.push({ icon: "🏠", title: "Klubbhus", items: clubhouse });
  }

  // Services
  const services: string[] = [];
  if (facilities.clubRental) services.push("Klubb-leie");
  if (facilities.cartRental) services.push("Golfbil-leie");
  if (facilities.pullCartRental) services.push("Tralle-leie");
  if (facilities.golfLessons) services.push("Golf-timer");
  if (facilities.teachingPro) services.push("Teaching Pro");
  if (facilities.simulator) {
    services.push(
      facilities.simulatorType ? `Simulator – ${facilities.simulatorType}` : "Simulator",
    );
  }
  if (services.length) {
    groups.push({ icon: "⛳", title: "Tjenester", items: services });
  }

  return groups;
}

export function FeaturesGrid({ facilities, winterUse }: FeaturesGridProps) {
  const groups = buildFeatureGroups(facilities);

  if (groups.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1200px] px-8 py-20">
      {/* Section Header */}
      <div className="mb-8 flex items-baseline gap-4">
        <span className="font-serif text-6xl font-normal text-v3d-accent">02</span>
        <h2 className="font-serif text-2xl font-medium text-v3d-text-dark">Fasiliteter</h2>
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
                  <span className="text-v3d-forest">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Winter Use Note */}
      {winterUse && (
        <div className="mt-8 border-t border-v3d-border pt-6">
          <h3 className="mb-3 font-semibold text-v3d-text-dark">Vinter</h3>
          <div className="flex gap-2 text-v3d-text-muted">
            <span className="text-v3d-forest">✓</span>
            <span>{winterUse}</span>
          </div>
        </div>
      )}
    </section>
  );
}
