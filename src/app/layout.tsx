import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://golfkart.no"),
  title: "Finn Golfbaner i Norge – Kart, Info og Brukeranmeldelser",
  description:
    "Søk og finn golfbaner i hele Norge. Se kart, les omtaler og få nyttig info om baner i ditt område.",
  icons: {
    icon: { url: "/favicon.svg", type: "image/svg+xml" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
