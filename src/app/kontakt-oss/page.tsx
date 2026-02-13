import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Kontakt oss - golfkart.no",
  description:
    "Ta kontakt med golfkart.no. Vi vil gjerne høre fra deg om spørsmål, tilbakemeldinger eller oppdatert informasjon om golfbaner.",
  alternates: {
    canonical: "/kontakt-oss",
  },
};

export default function ContactPage() {
  return (
    <div className="bg-background py-12">
      <div className="container mx-auto max-w-[1170px] px-4">
        <h1 className="mb-6 text-3xl font-bold text-text-primary">Kontakt oss</h1>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Contact Form */}
          <div className="rounded-lg bg-background-surface p-6 shadow-sm">
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">Send oss en melding</h2>
            <p className="mb-6 text-text-secondary">
              Fyll ut skjemaet nedenfor så tar vi kontakt med deg så snart som mulig.
            </p>
            <ContactForm />
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <div className="rounded-lg bg-background-surface p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-text-primary">Direkte kontakt</h2>
              <p className="mb-6 text-text-secondary">
                Du kan også kontakte oss direkte via e-post:
              </p>

              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 font-semibold text-text-primary">Generelle henvendelser</h3>
                  <a href="mailto:kontakt@golfkart.no" className="text-primary hover:underline">
                    kontakt@golfkart.no
                  </a>
                </div>

                <div>
                  <h3 className="mb-2 font-semibold text-text-primary">
                    Legg til eller oppdater bane
                  </h3>
                  <p className="mb-1 text-sm text-text-secondary">
                    Eier du en golfbane eller har oppdatert informasjon?
                  </p>
                  <a href="mailto:baner@golfkart.no" className="text-primary hover:underline">
                    baner@golfkart.no
                  </a>
                </div>

                <div>
                  <h3 className="mb-2 font-semibold text-text-primary">Teknisk support</h3>
                  <a href="mailto:support@golfkart.no" className="text-primary hover:underline">
                    support@golfkart.no
                  </a>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-background-surface p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-text-primary">Om golfkart.no</h2>
              <p className="text-text-secondary">
                Vi er Norges mest komplette oversikt over golfbaner. Vårt mål er å hjelpe golfere
                med å finne og utforske golfbaner i hele Norge.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
