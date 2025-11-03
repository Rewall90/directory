import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border-default bg-background-elevated">
      <div className="container mx-auto max-w-[1170px] px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* About Section */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase text-text-primary">
              Om golfkart.no
            </h3>
            <p className="text-sm text-text-secondary">
              Din komplette guide til golfbaner i Norge
            </p>
          </div>

          {/* Links Section */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase text-text-primary">
              Lenker
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/search" className="text-text-secondary hover:text-primary">
                  Søk
                </Link>
              </li>
              <li>
                <Link
                  href="/regions"
                  className="text-text-secondary hover:text-primary"
                >
                  Regioner
                </Link>
              </li>
              <li>
                <Link href="/om-oss" className="text-text-secondary hover:text-primary">
                  Om oss
                </Link>
              </li>
              <li>
                <Link
                  href="/kontakt-oss"
                  className="text-text-secondary hover:text-primary"
                >
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>

          {/* Attribution Section */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase text-text-primary">
              Teknologi
            </h3>
            <p className="text-sm text-text-secondary">Kart levert av amCharts</p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-border-subtle pt-6 text-center">
          <p className="text-sm text-text-tertiary">
            © {new Date().getFullYear()} golfkart.no. Alle rettigheter
            reservert.
          </p>
        </div>
      </div>
    </footer>
  );
}
