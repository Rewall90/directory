import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import Script from "next/script";

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
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-ZM0PFETJNE"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-ZM0PFETJNE');
          `}
        </Script>

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
