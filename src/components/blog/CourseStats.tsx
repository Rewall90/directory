interface StatItem {
  label: string;
  value: string;
}

interface CourseStatsProps {
  items: StatItem[];
}

export function CourseStats({ items = [] }: CourseStatsProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="my-6 grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map((item, index) => (
        <div
          key={index}
          className="rounded-lg border border-border-subtle bg-background-surface p-4 text-center shadow-sm"
        >
          <div className="text-2xl font-bold text-primary">{item.value}</div>
          <div className="mt-1 text-sm text-text-secondary">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
