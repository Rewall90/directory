"use client";

// window.gtag is declared globally in src/components/cookie-consent/cookieManager.ts

interface Props {
  href: string;
  clubSlug: string;
  region: string;
  label: string;
  variant?: "primary" | "secondary";
}

export function VtgSignupButton({ href, clubSlug, region, label, variant = "primary" }: Props) {
  const handleClick = () => {
    window.gtag?.("event", "vtg_signup_click", {
      club_slug: clubSlug,
      region,
    });
  };

  const className =
    variant === "primary"
      ? "inline-block rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-content hover:bg-primary-dark"
      : "inline-block rounded-md border border-border px-4 py-2 text-sm text-primary hover:border-primary";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={className}
    >
      {label}
    </a>
  );
}
