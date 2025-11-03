export interface CookieDetail {
  name: string;
  duration: string;
  description: string;
  provider?: string;
}

export interface CookieCategory {
  id: string;
  name: string;
  description: string;
  required: boolean;
  cookies?: CookieDetail[];
}

export interface CookieConsent {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  performance: boolean;
  advertising: boolean;
}

export interface CookiePreferences {
  consentGiven: boolean;
  consentDate: string;
  categories: CookieConsent;
}

export interface CookieConsentContextType {
  preferences: CookiePreferences | null;
  hasConsent: (category: keyof CookieConsent) => boolean;
  updateConsent: (categories: Partial<CookieConsent>) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  showBanner: boolean;
  showModal: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export const COOKIE_CATEGORIES: CookieCategory[] = [
  {
    id: "necessary",
    name: "Nødvendig",
    description:
      "Nødvendige informasjonskapsler er avgjørende for grunnleggende funksjoner på nettstedet, og nettstedet fungerer ikke på den tiltenkte måten uten dem. Disse informasjonskapslene lagrer ikke personlig identifiserbare data.",
    required: true,
    cookies: [
      {
        name: "golfkart-cookie-consent",
        duration: "1 år",
        description: "Lagrer dine informasjonskapselpreferanser og samtykke.",
        provider: "golfkart.no",
      },
    ],
  },
  {
    id: "functional",
    name: "Funksjonell",
    description:
      "Funksjonelle informasjonskapsler hjelper deg med å utføre visse funksjoner som å dele innholdet på nettstedet på sosiale medieplattformer, samle tilbakemeldinger og andre tredjepartsfunksjoner.",
    required: false,
    cookies: [
      {
        name: "golfkart-location-preferences",
        duration: "Økt",
        description: 'Lagrer din valgte lokasjon når du bruker "Se baner nær meg" funksjonen.',
        provider: "golfkart.no",
      },
    ],
  },
  {
    id: "analytics",
    name: "Analytics",
    description:
      "Analytiske informasjonskapsler brukes til å forstå hvordan besøkende samhandler med nettstedet. Disse informasjonskapslene hjelper med å gi informasjon om antall besøkende, fluktfrekvens, trafikkilde osv.",
    required: false,
    cookies: [
      {
        name: "_ga",
        duration: "1 år 1 måned 4 dager",
        description:
          "Google Analytics setter denne informasjonskapselen for å lagre og telle sidevisninger.",
        provider: "Google Analytics",
      },
      {
        name: "_ga_*",
        duration: "1 år 1 måned 4 dager",
        description:
          "Google Analytics oppretter denne informasjonskapselen for å beregne data for besøkende, økter og kampanjer og spore bruk av siden for sine analyserapporter. Denne informasjonskapselen lagrer informasjon anonymt og tildeler et tilfeldig generert nummer for å gjenkjenne unike brukere.",
        provider: "Google Analytics",
      },
    ],
  },
  {
    id: "performance",
    name: "Ytelse",
    description:
      "Ytelsesinfo rmasjonskapsler brukes til å forstå og analysere de viktigste ytelsesindeksene til nettstedet som hjelper til med å gi en bedre brukeropplevelse for de besøkende.",
    required: false,
    cookies: [],
  },
  {
    id: "advertising",
    name: "Annonse",
    description:
      "Annonseinformasjonskapsler brukes til å levere besøkende med tilpassede annonser basert på sidene de besøkte før og analysere effektiviteten av annonsekampanjen.",
    required: false,
    cookies: [],
  },
];
