import type { Metadata } from "next";
import Link from "next/link";
import { setRequestLocale } from "next-intl/server";

export const metadata: Metadata = {
  title: "Om oss - golfkart.no",
  description:
    "Norges mest komplette oversikt over golfbaner. Over 160 golfbaner fra hele Norge, fordelt på alle fylker.",
  alternates: {
    canonical: "/about",
  },
};

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="border-b border-border-subtle bg-background-surface py-12 md:py-20">
        <div className="container mx-auto max-w-[1170px] px-4">
          <h1 className="mb-4 text-4xl font-bold text-text-primary md:text-5xl">Om golfkart.no</h1>
          <p className="text-xl text-text-secondary md:text-2xl">
            Norges mest komplette oversikt over golfbaner
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto max-w-[1170px] px-4">
          <div className="grid gap-12 lg:grid-cols-3">
            {/* Main Column */}
            <div className="space-y-8 lg:col-span-2">
              {/* Mission */}
              <div>
                <h2 className="mb-4 text-2xl font-semibold text-text-primary">Vår visjon</h2>
                <p className="mb-4 text-lg leading-relaxed text-text-secondary">
                  golfkart.no ble skapt med ett enkelt formål: å gjøre det lettere for golfere å
                  finne og oppdage golfbaner i Norge. Vi tror at golf skal være tilgjengelig for
                  alle, og at riktig informasjon kan hjelpe både nybegynnere og erfarne spillere med
                  å finne den perfekte banen for deres neste runde.
                </p>
              </div>

              {/* What We Offer */}
              <div>
                <h2 className="mb-6 text-2xl font-semibold text-text-primary">Hva vi tilbyr</h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-2xl text-white">
                        📍
                      </div>
                    </div>
                    <div>
                      <h3 className="mb-2 text-lg font-semibold text-text-primary">
                        Komplett oversikt
                      </h3>
                      <p className="text-text-secondary">
                        Over 160 golfbaner fra hele Norge, fordelt på alle fylker. Vi dekker alt fra
                        store mesterskapsbaner til lokale 9-hulls anlegg.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-2xl text-white">
                        📊
                      </div>
                    </div>
                    <div>
                      <h3 className="mb-2 text-lg font-semibold text-text-primary">
                        Detaljert informasjon
                      </h3>
                      <p className="text-text-secondary">
                        Hver bane har omfattende informasjon om hull, par, lengde, terreng,
                        designer, og åpningsår. Vi viser også course rating og slope for alle
                        tee-valg.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-2xl text-white">
                        💰
                      </div>
                    </div>
                    <div>
                      <h3 className="mb-2 text-lg font-semibold text-text-primary">
                        Oppdaterte priser
                      </h3>
                      <p className="text-text-secondary">
                        Se greenfees for ukedag, helg, senior og junior. Vi viser også priser for
                        leie av golfbil, tralle og klubber, samt eventuelle spesialtilbud.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-2xl text-white">
                        ⭐
                      </div>
                    </div>
                    <div>
                      <h3 className="mb-2 text-lg font-semibold text-text-primary">
                        Vurderinger fra golfere
                      </h3>
                      <p className="text-text-secondary">
                        Vi samler ratings fra flere plattformer som Hole19, 18Birdies, Google og
                        Facebook, og gir deg en samlet vurdering basert på tusenvis av anmeldelser.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-2xl text-white">
                        🏢
                      </div>
                    </div>
                    <div>
                      <h3 className="mb-2 text-lg font-semibold text-text-primary">
                        Fasiliteter og tjenester
                      </h3>
                      <p className="text-text-secondary">
                        Finn ut om banen har driving range, putting green, restaurant, pro shop,
                        simulator, golf-timer og mye mer før du besøker.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-2xl text-white">
                        ☀️
                      </div>
                    </div>
                    <div>
                      <h3 className="mb-2 text-lg font-semibold text-text-primary">
                        Værdata i sanntid
                      </h3>
                      <p className="text-text-secondary">
                        Værprognoser oppdateres to ganger daglig, slik at du alltid kan planlegge
                        din golfrunde under optimale forhold. Se temperatur, vind, nedbør og
                        UV-indeks.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-2xl text-white">
                        🗺️
                      </div>
                    </div>
                    <div>
                      <h3 className="mb-2 text-lg font-semibold text-text-primary">
                        Interaktivt kart og navigasjon
                      </h3>
                      <p className="text-text-secondary">
                        Utforsk golfbaner via vårt interaktive Norge-kart, eller finn baner nær deg
                        med vår «Baner i nærheten»-funksjon. Få veibeskrivelse direkte i Google
                        Maps.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Why Us */}
              <div>
                <h2 className="mb-4 text-2xl font-semibold text-text-primary">
                  Hvorfor golfkart.no?
                </h2>
                <div className="space-y-4">
                  <p className="text-lg leading-relaxed text-text-secondary">
                    Det finnes mange måter å finne golfbaner på, men få steder samler all
                    informasjonen du trenger på ett sted. golfkart.no er bygget av golfere, for
                    golfere, med fokus på norske forhold og norske baner.
                  </p>
                  <p className="text-lg leading-relaxed text-text-secondary">
                    Vi oppdaterer kontinuerlig vår database med ny informasjon, og jobber tett med
                    golfklubber over hele landet for å sikre at informasjonen er korrekt og
                    oppdatert. Vår ambisjon er å være det første stedet norske golfere går når de
                    skal finne sin neste favorittbane.
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stats Card */}
              <div className="rounded-lg bg-background-surface p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-text-primary">golfkart.no i tall</h3>
                <div className="space-y-4">
                  <div className="border-b border-border-subtle pb-3">
                    <div className="text-3xl font-bold text-primary">162</div>
                    <div className="text-sm text-text-secondary">Golfbaner registrert</div>
                  </div>
                  <div className="border-b border-border-subtle pb-3">
                    <div className="text-3xl font-bold text-primary">15</div>
                    <div className="text-sm text-text-secondary">Fylker dekket</div>
                  </div>
                  <div className="border-b border-border-subtle pb-3">
                    <div className="text-3xl font-bold text-primary">2x</div>
                    <div className="text-sm text-text-secondary">Daglige væroppdateringer</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary">100%</div>
                    <div className="text-sm text-text-secondary">Norsk innhold</div>
                  </div>
                </div>
              </div>

              {/* Contact CTA */}
              <div className="rounded-lg bg-primary p-6 text-white shadow-sm">
                <h3 className="mb-2 text-lg font-semibold">Savner du en bane?</h3>
                <p className="mb-4 text-sm text-primary-content">
                  Vi jobber kontinuerlig med å legge til flere baner. Ta kontakt hvis du mangler
                  informasjon om en spesifikk bane.
                </p>
                <Link
                  href="/contact"
                  className="hover:bg-background-elevated inline-block rounded-lg bg-white px-4 py-2 text-sm font-semibold text-primary transition-colors"
                >
                  Kontakt oss
                </Link>
              </div>

              {/* Features Card */}
              <div className="rounded-lg bg-background-surface p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-text-primary">Kommer snart</h3>
                <ul className="space-y-3 text-sm text-text-secondary">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">→</span>
                    <span>Avansert søk og filtrering</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">→</span>
                    <span>Brukeranmeldelser</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">→</span>
                    <span>Favorittlister</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">→</span>
                    <span>Baneanbefalinger</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
