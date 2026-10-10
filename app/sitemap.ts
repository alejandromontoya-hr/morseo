import type { MetadataRoute } from "next";

import { LOCALES } from "@/lib/i18n/config";
import { PAGES, ROUTES, type PageKey } from "@/lib/i18n/routes";
import { absoluteUrl } from "@/lib/seo";

/**
 * Fecha del último cambio de contenido de cada página (AAAA-MM-DD), la misma
 * en los dos idiomas. Al cambiar una página se actualiza aquí; si la fecha
 * cambiara en cada despliegue, Google dejaría de creerle.
 */
const UPDATED: Record<PageKey, string> = {
  translate: "2026-10-06",
  learn: "2026-10-07",
  radio: "2026-10-06",
};

// Las 6 páginas (3 por idioma). El par en el otro idioma no va aquí: cada
// página ya lo declara en su <head> (hreflang), y repetirlo en el sitemap hace
// que el navegador lo muestre como texto corrido en vez del árbol de XML.
export default function sitemap(): MetadataRoute.Sitemap {
  return LOCALES.flatMap((locale) =>
    PAGES.map((page) => ({
      url: absoluteUrl(ROUTES[locale][page]),
      lastModified: new Date(`${UPDATED[page]}T00:00:00Z`),
      changeFrequency: "monthly" as const,
      priority: page === "translate" ? 1 : 0.8,
    }))
  );
}
