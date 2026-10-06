import type { MetadataRoute } from "next";

import { LOCALES } from "@/lib/i18n/config";
import { PAGES, ROUTES } from "@/lib/i18n/routes";
import { absoluteUrl, languageAlternates } from "@/lib/seo";

// Las 6 páginas (3 por idioma). Cada una lleva su par en el otro idioma para
// que Google sepa que son la misma página traducida y no contenido repetido.
export default function sitemap(): MetadataRoute.Sitemap {
  return LOCALES.flatMap((locale) =>
    PAGES.map((page) => ({
      url: absoluteUrl(ROUTES[locale][page]),
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: page === "translate" ? 1 : 0.8,
      alternates: { languages: languageAlternates(page) },
    }))
  );
}
