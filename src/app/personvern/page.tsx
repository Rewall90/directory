import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Personvernerklæring - golfkart.no",
  description: "Personvernerklæring for golfkart.no - hvordan vi samler inn og bruker informasjon.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-background">
      {/* Breadcrumb */}
      <nav className="container mx-auto max-w-[1170px] px-4 py-4 text-sm text-text-tertiary">
        <Link href="/" className="hover:text-primary">
          Hjem
        </Link>
        <span className="mx-2">/</span>
        <span className="text-text-primary">Personvernerklæring</span>
      </nav>

      <div className="container mx-auto max-w-[800px] px-4 py-16">
        <h1 className="mb-8 text-4xl font-bold text-text-primary">Personvernerklæring</h1>

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
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">1. Innledning</h2>
            <p className="leading-relaxed">
              Denne personvernerklæringen beskriver hvordan golfkart.no ("vi", "oss" eller
              "nettstedet") samler inn, bruker og beskytter informasjon når du besøker vårt
              nettsted. Vi er forpliktet til å beskytte ditt personvern i samsvar med gjeldende
              personvernlovgivning, inkludert EUs personvernforordning (GDPR) og norsk
              personopplysningslov.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">
              2. Informasjon vi samler inn
            </h2>

            <h3 className="mb-2 mt-4 text-lg font-semibold text-text-primary">
              2.1 Automatisk innsamlet informasjon
            </h3>
            <p className="mb-3 leading-relaxed">
              Når du besøker nettstedet vårt, samler vi automatisk inn viss informasjon:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>IP-adresse</li>
              <li>Nettlesertype og versjon</li>
              <li>Operativsystem</li>
              <li>Tidspunkt for besøk</li>
              <li>Refererende nettside</li>
              <li>Sider du besøker på vårt nettsted</li>
            </ul>

            <h3 className="mb-2 mt-4 text-lg font-semibold text-text-primary">2.2 Lokasjonsdata</h3>
            <p className="leading-relaxed">
              Hvis du velger å bruke funksjonen "Se baner nær meg", vil vi be om tilgang til din
              geografiske posisjon. Denne informasjonen lagres kun midlertidig i nettleserens
              sessionStorage og deles ikke med tredjeparter.
            </p>

            <h3 className="mb-2 mt-4 text-lg font-semibold text-text-primary">
              2.3 Kontaktinformasjon
            </h3>
            <p className="leading-relaxed">
              Hvis du kontakter oss via e-post eller kontaktskjema, samler vi inn informasjonen du
              frivillig oppgir (navn, e-postadresse, melding).
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">
              3. Hvordan vi bruker informasjonen
            </h2>
            <p className="mb-3 leading-relaxed">
              Vi bruker innsamlet informasjon til følgende formål:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>Tilby og forbedre våre tjenester</li>
              <li>Vise relevant innhold basert på din lokasjon (hvis du har gitt tillatelse)</li>
              <li>Analysere bruksmønstre og optimalisere nettstedet</li>
              <li>Svare på henvendelser og gi kundeservice</li>
              <li>Beskytte mot misbruk og ulovlig aktivitet</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">
              4. Cookies og sporingsteknologi
            </h2>
            <p className="leading-relaxed">
              Vi bruker cookies og lignende teknologier for å forbedre din opplevelse på nettstedet.
              Cookies er små tekstfiler som lagres på enheten din. Du kan kontrollere og/eller
              slette cookies etter eget ønske gjennom nettleserinnstillingene dine.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">
              5. Deling av informasjon
            </h2>
            <p className="mb-3 leading-relaxed">
              Vi selger, handler eller leier ikke ut personopplysninger til tredjeparter. Vi kan
              dele informasjon i følgende tilfeller:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                Med tjenesteleverandører som hjelper oss med å drive nettstedet (f.eks. hosting)
              </li>
              <li>Når det er påkrevd ved lov eller for å beskytte våre juridiske rettigheter</li>
              <li>Med ditt samtykke eller på din forespørsel</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">6. Datasikkerhet</h2>
            <p className="leading-relaxed">
              Vi implementerer passende tekniske og organisatoriske sikkerhetstiltak for å beskytte
              dine personopplysninger mot uautorisert tilgang, endring, avsløring eller ødeleggelse.
              Ingen metode for overføring over Internett eller elektronisk lagring er imidlertid
              100% sikker, og vi kan ikke garantere absolutt sikkerhet.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">7. Dine rettigheter</h2>
            <p className="mb-3 leading-relaxed">
              I henhold til GDPR og norsk personopplysningslov har du følgende rettigheter:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>
                <strong>Rett til innsyn:</strong> Du kan be om en kopi av personopplysningene vi har
                om deg
              </li>
              <li>
                <strong>Rett til retting:</strong> Du kan be oss rette unøyaktige eller
                ufullstendige opplysninger
              </li>
              <li>
                <strong>Rett til sletting:</strong> Du kan be oss slette personopplysningene dine
              </li>
              <li>
                <strong>Rett til begrensning:</strong> Du kan be om at behandlingen av opplysningene
                dine begrenses
              </li>
              <li>
                <strong>Rett til dataportabilitet:</strong> Du kan be om å motta opplysningene i et
                strukturert format
              </li>
              <li>
                <strong>Rett til å protestere:</strong> Du kan protestere mot vår behandling av
                opplysningene dine
              </li>
            </ul>
            <p className="mt-4 leading-relaxed">
              For å utøve disse rettighetene, vennligst kontakt oss via{" "}
              <Link href="/kontakt-oss" className="text-primary hover:underline">
                kontaktskjemaet
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">
              8. Lenker til andre nettsteder
            </h2>
            <p className="leading-relaxed">
              Vårt nettsted inneholder lenker til eksterne nettsteder (f.eks. golfbanenes egne
              nettsider). Vi er ikke ansvarlige for personvernpraksisen eller innholdet på disse
              eksterne nettstedene. Vi oppfordrer deg til å lese personvernerklæringen til hvert
              nettsted du besøker.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">9. Barns personvern</h2>
            <p className="leading-relaxed">
              Vårt nettsted er ikke rettet mot barn under 16 år. Vi samler ikke bevisst inn
              personopplysninger fra barn under 16 år. Hvis du er forelder eller verge og er klar
              over at barnet ditt har gitt oss personopplysninger, vennligst kontakt oss.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">
              10. Endringer i personvernerklæringen
            </h2>
            <p className="leading-relaxed">
              Vi kan oppdatere denne personvernerklæringen fra tid til annen. Vi vil varsle deg om
              eventuelle endringer ved å legge ut den nye personvernerklæringen på denne siden og
              oppdatere "Sist oppdatert"-datoen. Vi oppfordrer deg til å gjennomgå denne
              personvernerklæringen regelmessig for eventuelle endringer.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">11. Kontakt oss</h2>
            <p className="leading-relaxed">
              Hvis du har spørsmål om denne personvernerklæringen, vennligst kontakt oss via{" "}
              <Link href="/kontakt-oss" className="text-primary hover:underline">
                kontaktskjemaet vårt
              </Link>
              .
            </p>
          </section>

          <section className="border-t border-border-subtle pt-8">
            <p className="text-sm text-text-tertiary">
              Ved å bruke golfkart.no godtar du denne personvernerklæringen og vår{" "}
              <Link href="/vilkar" className="text-primary hover:underline">
                bruksvilkår
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
