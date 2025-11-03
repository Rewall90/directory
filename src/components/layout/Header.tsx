import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="absolute left-0 right-0 top-0 z-20">
      <nav className="container mx-auto flex max-w-[1170px] items-center justify-between px-4 py-6">
        <Link href="/" className="text-2xl font-bold text-white md:text-3xl">
          golfkart.no
        </Link>

        <div className="flex items-center gap-8">
          <Link
            href="/search"
            className="text-base font-medium text-green-100 transition-colors hover:text-yellow-400 md:text-lg"
          >
            Søk
          </Link>
          <Link
            href="/regions"
            className="text-base font-medium text-green-100 transition-colors hover:text-yellow-400 md:text-lg"
          >
            Regioner
          </Link>
          <Link
            href="/om-oss"
            className="text-base font-medium text-green-100 transition-colors hover:text-yellow-400 md:text-lg"
          >
            Om oss
          </Link>
          <Link
            href="/kontakt-oss"
            className="text-base font-medium text-green-100 transition-colors hover:text-yellow-400 md:text-lg"
          >
            Kontakt
          </Link>

          {/* Theme Toggle */}
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </header>
  );
}
