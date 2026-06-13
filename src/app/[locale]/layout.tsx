import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Manrope, Playfair_Display, Outfit } from "next/font/google";
import Script from "next/script";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import {
  CookieConsentProvider,
  CookieConsentBanner,
  CookieConsentModal,
} from "@/components/cookie-consent";
import { routing } from "@/i18n/routing";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["200", "300", "400", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate the locale
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      data-theme="golf"
      className={`${manrope.variable} ${playfair.variable} ${outfit.variable} bg-background text-text-primary`}
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
            // Consent default must be queued before config so the first
            // page_view respects stored (or absent) consent.
            var consent = null;
            try {
              consent = JSON.parse(localStorage.getItem('golfkart-cookie-consent'));
            } catch (e) {}
            var analyticsGranted = !!(consent && consent.categories && consent.categories.analytics);
            gtag('consent', 'default', {
              analytics_storage: analyticsGranted ? 'granted' : 'denied',
              ad_storage: 'denied',
              functionality_storage: 'denied',
              personalization_storage: 'denied',
              security_storage: 'granted'
            });
            gtag('js', new Date());
            gtag('config', 'G-ZM0PFETJNE');
          `}
        </Script>

        <NextIntlClientProvider>
          <CookieConsentProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1 bg-background text-text-primary">{children}</main>
              <Footer />
            </div>
            <CookieConsentBanner />
            <CookieConsentModal />
          </CookieConsentProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
