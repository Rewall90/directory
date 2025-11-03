import type { Metadata } from "next";
import { Manrope } from "next/font/google";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import {
  CookieConsentProvider,
  CookieConsentBanner,
  CookieConsentModal,
} from "@/components/cookie-consent";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["200", "300", "400", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://golfkart.no"),
  title: "golfkart.no | Golfbaner i Norge",
  description: "Finn og utforsk golfbaner i Norge med regionkart, beskrivelser og guider.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nb"
      data-theme="golf"
      className={`${manrope.variable} bg-background text-text-primary`}
    >
      <head>
        <meta charSet="utf-8" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <CookieConsentProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 bg-background text-text-primary">{children}</main>
            <Footer />
          </div>
          <CookieConsentBanner />
          <CookieConsentModal />
        </CookieConsentProvider>
      </body>
    </html>
  );
}
