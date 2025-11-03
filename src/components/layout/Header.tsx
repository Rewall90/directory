"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <header
      className={isHomePage ? "absolute left-0 right-0 top-0 z-20" : "bg-green-800 shadow-md"}
    >
      <nav className="container mx-auto flex max-w-[1170px] items-center justify-between px-4 py-6">
        <Link href="/" className="flex items-center">
          <svg
            className={isHomePage ? "h-10 w-auto md:h-12" : "h-10 w-auto md:h-12"}
            viewBox="0 0 180 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Text: G */}
            <text
              x="0"
              y="15"
              fontFamily="Manrope, sans-serif"
              fontSize="26"
              fontWeight="700"
              fill="white"
              letterSpacing="-0.5"
              dominantBaseline="middle"
            >
              G
            </text>

            {/* Location Pin Icon replacing "O" in Golf */}
            <g transform="scale(1.3) translate(13, -1)">
              <path
                fill="hsl(192, 80%, 80%)"
                fillRule="evenodd"
                d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z"
                clipRule="evenodd"
              />
            </g>

            {/* Text: lfKart.no */}
            <text
              x="40"
              y="15"
              fontFamily="Manrope, sans-serif"
              fontSize="26"
              fontWeight="700"
              fill="white"
              letterSpacing="-0.5"
              dominantBaseline="middle"
            >
              lfKart.no
            </text>
          </svg>
        </Link>

        <div className="flex items-center gap-8">
          <Link
            href="/regions"
            className={
              isHomePage
                ? "text-base font-medium text-green-100 transition-colors hover:text-yellow-400 md:text-lg"
                : "text-base font-medium text-white transition-colors hover:text-yellow-400 md:text-lg"
            }
          >
            Fylke
          </Link>
          <Link
            href="/om-oss"
            className={
              isHomePage
                ? "text-base font-medium text-green-100 transition-colors hover:text-yellow-400 md:text-lg"
                : "text-base font-medium text-white transition-colors hover:text-yellow-400 md:text-lg"
            }
          >
            Om oss
          </Link>
          <Link
            href="/kontakt-oss"
            className={
              isHomePage
                ? "text-base font-medium text-green-100 transition-colors hover:text-yellow-400 md:text-lg"
                : "text-base font-medium text-white transition-colors hover:text-yellow-400 md:text-lg"
            }
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
