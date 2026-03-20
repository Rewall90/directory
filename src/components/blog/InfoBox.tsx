import { type ReactNode } from "react";

interface InfoBoxProps {
  type?: "tip" | "warning" | "info";
  children: ReactNode;
}

const config = {
  tip: {
    border: "border-success",
    bg: "bg-success/5",
    icon: (
      <svg className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
  },
  warning: {
    border: "border-warning",
    bg: "bg-warning/5",
    icon: (
      <svg className="h-5 w-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
  },
  info: {
    border: "border-info",
    bg: "bg-info/5",
    icon: (
      <svg className="h-5 w-5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
};

export function InfoBox({ type = "tip", children }: InfoBoxProps) {
  const { border, bg, icon } = config[type];

  return (
    <div className={`my-6 rounded-lg border-l-4 ${border} ${bg} p-4 pl-5`}>
      <div className="flex gap-3">
        <div className="mt-0.5 flex-shrink-0">{icon}</div>
        <div className="min-w-0 text-text-primary [&>p:last-child]:mb-0">{children}</div>
      </div>
    </div>
  );
}
