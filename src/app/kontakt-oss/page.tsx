export default function ContactPage() {
  return (
    <div className="container mx-auto max-w-[1170px] px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold text-text-primary">Kontakt oss</h1>

      <div className="max-w-2xl">
        <p className="mb-6 text-text-secondary">
          Har du spørsmål eller tilbakemeldinger? Vi vil gjerne høre fra deg!
        </p>

        <div className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-text-primary">Generelle henvendelser</h2>
          <p className="text-text-secondary">
            E-post:{" "}
            <a href="mailto:kontakt@golfkart.no" className="text-primary hover:underline">
              kontakt@golfkart.no
            </a>
          </p>
        </div>

        <div className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-text-primary">
            Legg til eller oppdater bane
          </h2>
          <p className="text-text-secondary">
            Eier du en golfbane eller har du oppdatert informasjon? Kontakt oss
            på:{" "}
            <a href="mailto:baner@golfkart.no" className="text-primary hover:underline">
              baner@golfkart.no
            </a>
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-xl font-semibold text-text-primary">Teknisk support</h2>
          <p className="text-text-secondary">
            E-post:{" "}
            <a href="mailto:support@golfkart.no" className="text-primary hover:underline">
              support@golfkart.no
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
