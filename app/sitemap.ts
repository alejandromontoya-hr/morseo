import type { MetadataRoute } from "next";

import { LOCALES } from "@/lib/i18n/config";
import { PAGES, ROUTES } from "@/lib/i18n/routes";
import { PAGE_UPDATED, absoluteUrl } from "@/lib/seo";

// Las 6 páginas (3 por idioma). El par en el otro idioma no va aquí: cada
// página ya lo declara en su <head> (hreflang), y repetirlo en el sitemap hace
// que el navegador lo muestre como texto corrido en vez del árbol de XML.
export default function sitemap(): MetadataRoute.Sitemap {
  return LOCALES.flatMap((locale) =>
    PAGES.map((page) => ({
      url: absoluteUrl(ROUTES[locale][page]),
      lastModified: new Date(`${PAGE_UPDATED[page]}T00:00:00Z`),
      changeFrequency: "monthly" as const,
      priority: page === "translate" ? 1 : 0.8,
    }))
  );
}
