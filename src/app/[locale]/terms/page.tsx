import type { Metadata } from "next";
import Link from "next/link";
import { setRequestLocale } from "next-intl/server";

export const metadata: Metadata = {
  title: "Bruksvilkår - golfkart.no",
  description: "Bruksvilkår for golfkart.no - regler og betingelser for bruk av nettstedet.",
};

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function TermsOfServicePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="bg-background">
      {/* Breadcrumb */}
      <nav className="container mx-auto max-w-[1170px] px-4 py-4 text-sm text-text-tertiary">
        <Link href="/" className="hover:text-primary">
          Hjem
        </Link>
        <span className="mx-2">/</span>
        <span className="text-text-primary">Bruksvilkår</span>
      </nav>

      <div className="container mx-auto max-w-[800px] px-4 py-16">
        <h1 className="mb-8 text-4xl font-bold text-text-primary">Bruksvilkår</h1>

        <div className="space-y-8 text-text-secondary">
          <p className="text-sm text-text-tertiary">
            Sist oppdatert:{" "}
            {new Date().toLocaleDateString("nb-NO", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">1. Aksept av vilkår</h2>
            <p className="leading-relaxed">
              Ved å få tilgang til og bruke golfkart.no («nettstedet», «tjenesten», «vi», «oss»),
              godtar du å være bundet av disse bruksvilkårene. Hvis du ikke godtar disse vilkårene,
              må du ikke bruke nettstedet. Vi forbeholder oss retten til å endre disse vilkårene når
              som helst uten forvarsel.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">
              2. Beskrivelse av tjenesten
            </h2>
            <p className="leading-relaxed">
              golfkart.no er en informasjonstjeneste som gir oversikt over golfbaner i Norge.
              Nettstedet tilbyr informasjon om baner, fasiliteter, priser, kontaktinformasjon og
              vurderinger. Vi bestreber oss på å holde informasjonen oppdatert og nøyaktig, men kan
              ikke garantere fullstendighet eller nøyaktighet til enhver tid.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">3. Tillatt bruk</h2>
            <p className="mb-3 leading-relaxed">Du har lov til å:</p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                Få tilgang til og se innholdet på nettstedet for personlig, ikke-kommersiell bruk
              </li>
              <li>Dele lenker til individuelle sider på nettstedet</li>
              <li>Bruke søkefunksjonen for å finne golfbaner</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">
              4. Forbudt bruk og restriksjoner
            </h2>
            <p className="mb-3 leading-relaxed">
              Du samtykker til <strong className="text-text-primary">IKKE</strong> å:
            </p>

            <div className="rounded-lg border-2 border-red-300 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950">
              <h3 className="mb-3 text-lg font-bold text-red-900 dark:text-red-200">
                🚫 Strengt forbudt aktivitet
              </h3>
              <ul className="ml-6 list-disc space-y-3 text-red-900 dark:text-red-200">
                <li>
                  <strong>Scraping og automatisk datainnsamling:</strong> Bruke roboter, spiders,
                  crawlers, scrapers eller andre automatiserte verktøy eller prosesser for å få
                  tilgang til, kopiere eller samle inn data fra nettstedet
                </li>
                <li>
                  <strong>Systematisk nedlasting:</strong> Laste ned betydelige deler av nettstedets
                  database eller innhold
                </li>
                <li>
                  <strong>API-misbruk:</strong> Bruke eller forsøke å bruke uautoriserte API-er
                  eller endpoints
                </li>
                <li>
                  <strong>Databasekopiering:</strong> Kopiere, reprodusere eller speile nettstedets
                  database eller innhold i sin helhet eller i betydelig grad
                </li>
                <li>
                  <strong>Konkurrerende tjenester:</strong> Bruke data fra nettstedet til å bygge en
                  konkurrerende tjeneste eller database
                </li>
                <li>
                  <strong>Omgåelse av sikkerhetstiltak:</strong> Omgå eller forsøke å omgå tekniske
                  begrensninger, rate limits eller sikkerhetstiltak
                </li>
                <li>
                  <strong>Reverse engineering:</strong> Dekompilere, reverse engineer eller forsøke
                  å få tilgang til kildekoden til nettstedet
                </li>
              </ul>
            </div>

            <h3 className="mb-2 mt-6 text-lg font-semibold text-text-primary">
              Andre forbudte handlinger
            </h3>
            <ul className="ml-6 list-disc space-y-2">
              <li>Bruke nettstedet til ulovlige formål eller i strid med gjeldende lover</li>
              <li>Publisere eller overføre spam, malware eller annet skadelig innhold</li>
              <li>Forstyrre eller skade nettstedets funksjonalitet eller infrastruktur</li>
              <li>Etterligne eller forfalske nettstedet eller dets innhold</li>
              <li>Bruke nettstedet for å trakassere, misbruke eller skade andre brukere</li>
              <li>Samle inn eller lagre personopplysninger om andre brukere</li>
              <li>
                Videreselge eller kommersialisere tilgang til nettstedet uten skriftlig tillatelse
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">
              5. Rettigheter til innhold
            </h2>
            <p className="mb-3 leading-relaxed">
              Alt innhold på golfkart.no, inkludert men ikke begrenset til tekst, grafikk, logoer,
              bilder, data, databasesamlinger og programvare, eies av eller er lisensiert til oss og
              er beskyttet av norsk og internasjonal lov om opphavsrett og immaterielle rettigheter.
            </p>
            <p className="leading-relaxed">
              Uautorisert bruk av innholdet kan utgjøre brudd på opphavsrett, varemerke eller andre
              lover.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">
              6. Ansvarsfraskrivelse
            </h2>
            <p className="mb-3 leading-relaxed">
              Nettstedet og alt innhold leveres «som det er» og «som tilgjengelig» uten garantier av
              noen art, verken uttrykkelige eller underforståtte, inkludert men ikke begrenset til:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>Nøyaktighet, pålitelighet eller fullstendighet av informasjonen</li>
              <li>At tjenesten vil være uavbrutt eller feilfri</li>
              <li>At eventuelle feil vil bli rettet</li>
            </ul>
            <p className="mt-4 leading-relaxed">
              Informasjon om priser, åpningstider, fasiliteter og andre detaljer kan endre seg uten
              varsel. Vi anbefaler alltid å kontakte golfbanene direkte for å bekrefte oppdatert
              informasjon.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">7. Ansvarsbegrensning</h2>
            <p className="leading-relaxed">
              I den grad loven tillater, skal golfkart.no, dets eiere, partnere eller leverandører
              ikke være ansvarlige for noen direkte, indirekte, tilfeldige, spesielle eller
              følgeskader som oppstår fra eller i forbindelse med din bruk av nettstedet, inkludert
              men ikke begrenset til:
            </p>
            <ul className="ml-6 mt-3 list-disc space-y-2">
              <li>Tap av data eller fortjeneste</li>
              <li>Avbrudd i virksomheten</li>
              <li>Feil eller mangler i innholdet</li>
              <li>Handlinger tatt basert på informasjon fra nettstedet</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">8. Tredjepartslenker</h2>
            <p className="leading-relaxed">
              Nettstedet kan inneholde lenker til tredjepartssider (f.eks. golfbanenes egne
              nettsider). Vi er ikke ansvarlige for innholdet, personvernpraksisen eller
              tilgjengeligheten til disse eksterne nettstedene. Lenker betyr ikke at vi godkjenner
              eller har noen tilknytning til disse nettstedene.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">
              9. Håndheving og konsekvenser ved brudd
            </h2>
            <p className="mb-3 leading-relaxed">
              Vi overvåker aktivt for brudd på disse vilkårene. Ved mistanke om eller påvist brudd,
              forbeholder vi oss retten til å:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>Umiddelbart blokkere din tilgang til nettstedet</li>
              <li>Rapportere aktiviteten til relevante myndigheter</li>
              <li>Iverksette juridiske skritt, inkludert krav om erstatning</li>
              <li>Dele informasjon om brudd med tredjeparter som loven tillater</li>
            </ul>
            <p className="mt-4 leading-relaxed">
              Automatisk dataskraping, systematisk nedlasting eller andre brudd kan utgjøre lovbrudd
              i henhold til norsk lov om opphavsrett og databeskyttelse.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">10. Gjeldende lov</h2>
            <p className="leading-relaxed">
              Disse vilkårene skal styres av og tolkes i samsvar med norsk lov. Eventuelle tvister
              skal løses av norske domstoler.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">
              11. Endringer i vilkårene
            </h2>
            <p className="leading-relaxed">
              Vi forbeholder oss retten til å endre disse bruksvilkårene når som helst. Endringer
              trer i kraft umiddelbart ved publisering på denne siden. Din fortsatte bruk av
              nettstedet etter endringer utgjør aksept av de nye vilkårene.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">12. Kontakt</h2>
            <p className="leading-relaxed">
              Hvis du har spørsmål om disse bruksvilkårene, ønsker tillatelse til spesiell bruk av
              innholdet, eller ønsker å rapportere mistenkelig aktivitet, vennligst kontakt oss via{" "}
              <Link href="/contact" className="text-primary hover:underline">
                kontaktskjemaet vårt
              </Link>
              .
            </p>
          </section>

          <section className="bg-primary/5 rounded-lg border border-primary p-6">
            <h3 className="mb-3 text-lg font-semibold text-text-primary">
              ⚖️ Juridisk varsel om scraping
            </h3>
            <p className="text-sm leading-relaxed">
              Automatisk dataskraping, systematisk nedlasting eller annen uautorisert massekopiering
              av innhold fra golfkart.no er strengt forbudt og kan medføre juridiske konsekvenser.
              Alle forsøk på slik aktivitet blir logget og overvåket. For legitim databruk eller
              API-tilgang, vennligst kontakt oss for tillatelse.
            </p>
          </section>

          <section className="border-t border-border-subtle pt-8">
            <p className="text-sm text-text-tertiary">
              Ved å bruke golfkart.no godtar du disse bruksvilkårene og vår{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                personvernerklæring
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
