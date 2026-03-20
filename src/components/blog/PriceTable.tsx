interface PriceTableProps {
  title: string;
  headers: string[];
  rows: string[][];
}

export function PriceTable({ title, headers, rows }: PriceTableProps) {
  if (!title || !rows || rows.length === 0) {
    return null;
  }

  return (
    <div className="my-6 overflow-hidden rounded-lg border border-border-subtle bg-background-surface shadow-sm">
      <div className="bg-primary/10 px-5 py-3">
        <h4 className="text-base font-semibold text-primary">{title}</h4>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          {headers && headers.length > 0 && (
            <thead>
              <tr className="bg-base-200/50 border-b border-border-subtle">
                {headers.map((header, i) => (
                  <th
                    key={i}
                    className="px-5 py-2.5 text-left text-sm font-semibold text-text-primary"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={i < rows.length - 1 ? "border-b border-border-subtle" : ""}>
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className={`px-5 py-2.5 text-sm ${
                      j === 0 ? "text-text-primary" : "font-medium text-text-secondary"
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
