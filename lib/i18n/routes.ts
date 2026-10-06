// Dirección de cada página en cada idioma. El inglés vive en la raíz
// (morseo.site, /learn, /radio) y el español bajo /es con palabras en español
// (/es, /es/aprender, /es/al-aire), para que Google indexe las dos versiones.

import type { Locale } from "@/lib/i18n/config";

export const SITE_URL = "https://www.morseo.site";

export type PageKey = "translate" | "learn" | "radio";

export const PAGES: PageKey[] = ["translate", "learn", "radio"];

export const ROUTES: Record<Locale, Record<PageKey, string>> = {
  en: { translate: "/", learn: "/learn", radio: "/radio" },
  es: { translate: "/es", learn: "/es/aprender", radio: "/es/al-aire" },
};

/** Qué página es una ruta, en cualquiera de los dos idiomas. */
export function pageOf(pathname: string | null): PageKey | null {
  const path = pathname && pathname !== "/" ? pathname.replace(/\/+$/, "") : "/";
  for (const routes of Object.values(ROUTES)) {
    for (const page of PAGES) if (routes[page] === path) return page;
  }
  return null;
}

/** La misma página en otro idioma; si la ruta no es conocida, su inicio. */
export function localizedPath(pathname: string | null, to: Locale): string {
  return ROUTES[to][pageOf(pathname) ?? "translate"];
}
