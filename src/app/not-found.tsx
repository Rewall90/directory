import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Side ikke funnet | golfkart.no",
  description: "Siden du leter etter finnes ikke.",
};

export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[60vh] max-w-[1170px] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-8 text-9xl font-bold text-primary">404</div>

      <h1 className="mb-4 text-3xl font-bold text-text-primary md:text-4xl">
        Siden ble ikke funnet
      </h1>

      <p className="mb-8 max-w-md text-lg text-text-secondary">
        Beklager, vi kunne ikke finne siden du leter etter. Den kan ha blitt flyttet eller slettet.
      </p>

      <div className="flex flex-wrap gap-4">
        <Link href="/" className="btn-primary">
          Gå til forsiden
        </Link>
        <Link href="/regions" className="btn-secondary">
          Se alle fylker
        </Link>
      </div>
    </div>
  );
}
