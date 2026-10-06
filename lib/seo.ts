// Metadata y ficha estructurada (JSON-LD) de cada página. Cada página declara
// su dirección propia (canonical) y la de su par en el otro idioma (hreflang),
// así Google muestra a cada quien la versión de su idioma.

import type { Metadata } from "next";

import { LINKEDIN_URL, REPO_URL } from "@/components/github-link";
import { content } from "@/lib/content";
import { LOCALES, type Locale } from "@/lib/i18n/config";
import { ROUTES, SITE_URL, type PageKey } from "@/lib/i18n/routes";

/** Dirección completa de una ruta: "/" → https://www.morseo.site/ */
export function absoluteUrl(path: string): string {
  return SITE_URL + path;
}

/** Las dos versiones de una página; sin idioma reconocido, el inglés. */
export function languageAlternates(page: PageKey) {
  return {
    en: absoluteUrl(ROUTES.en[page]),
    es: absoluteUrl(ROUTES.es[page]),
    "x-default": absoluteUrl(ROUTES.en[page]),
  };
}

export function pageMetadata(locale: Locale, page: PageKey): Metadata {
  const c = content[locale];
  const { title, description } = c.meta[page];
  const url = absoluteUrl(ROUTES[locale][page]);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url, languages: languageAlternates(page) },
    openGraph: {
      type: "website",
      siteName: "Morseo",
      title,
      description,
      url,
      locale: c.ogLocale,
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => content[l].ogLocale),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

const AUTHOR_ID = `${SITE_URL}/#author`;
const WEBSITE_ID = `${SITE_URL}/#website`;

/** La ficha que leen Google y las IA: qué es Morseo, quién lo hizo y sus preguntas frecuentes. */
export function pageJsonLd(locale: Locale, page: PageKey, faq: { q: string; a: string }[]) {
  const c = content[locale];
  const home = absoluteUrl(ROUTES[locale].translate);
  const url = absoluteUrl(ROUTES[locale][page]);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": AUTHOR_ID,
        name: "Alejandro Montoya",
        url: LINKEDIN_URL,
        sameAs: [LINKEDIN_URL, "https://github.com/alejandromontoya-hr"],
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: absoluteUrl("/"),
        name: "Morseo",
        inLanguage: [...LOCALES],
        author: { "@id": AUTHOR_ID },
      },
      {
        "@type": "WebApplication",
        "@id": `${home}#app`,
        name: "Morseo",
        url: home,
        description: c.appDescription,
        applicationCategory: "EducationalApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript and a modern web browser",
        inLanguage: locale,
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        featureList: c.features,
        author: { "@id": AUTHOR_ID },
        sameAs: [REPO_URL],
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#page`,
        url,
        name: c.meta[page].title,
        description: c.meta[page].description,
        inLanguage: locale,
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": `${home}#app` },
        mainEntity: faq.map(({ q, a }) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      },
    ],
  };
}
