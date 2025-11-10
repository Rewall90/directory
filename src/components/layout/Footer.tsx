"use client";

import Link from "next/link";
import { CookieSettingsButton } from "@/components/cookie-consent";

export function Footer() {
  return (
    <footer className="border-border-default bg-background-elevated border-t">
      <div className="container mx-auto max-w-[1170px] px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* About Section */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase text-text-primary">
              Om golfkart.no
            </h3>
            <p className="text-sm text-text-secondary">Din komplette guide til golfbaner i Norge</p>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase text-text-primary">Navigasjon</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/regions" className="text-text-secondary hover:text-primary">
                  Fylke
                </Link>
              </li>
              <li>
                <Link href="/blogg" className="text-text-secondary hover:text-primary">
                  Blogg
                </Link>
              </li>
              <li>
                <Link href="/om-oss" className="text-text-secondary hover:text-primary">
                  Om oss
                </Link>
              </li>
              <li>
                <Link href="/kontakt-oss" className="text-text-secondary hover:text-primary">
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase text-text-primary">Juridisk</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/personvern" className="text-text-secondary hover:text-primary">
                  Personvern
                </Link>
              </li>
              <li>
                <Link href="/vilkar" className="text-text-secondary hover:text-primary">
                  Bruksvilkår
                </Link>
              </li>
              <li>
                <CookieSettingsButton />
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-border-subtle pt-6 text-center">
          <p className="text-sm text-text-tertiary">
            © {new Date().getFullYear()} golfkart.no. Alle rettigheter reservert.
          </p>
        </div>
      </div>
    </footer>
  );
}
