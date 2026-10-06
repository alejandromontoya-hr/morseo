// Configuración de idioma de la app. Solo dos idiomas: inglés (por defecto) y
// español. Todo el sistema de traducción se apoya en este tipo `Locale`.

export const LOCALES = ["en", "es"] as const;

export type Locale = (typeof LOCALES)[number];

/** Idioma por defecto de la aplicación. */
export const DEFAULT_LOCALE: Locale = "en";

/** Clave de `localStorage` donde se recuerda la preferencia del visitante. */
export const LOCALE_STORAGE_KEY = "morseo:lang";

/** Nombre nativo de cada idioma, para el selector. */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  es: "Español",
};

/** Etiqueta corta (2 letras) para el botón compacto. */
export const LOCALE_SHORT: Record<Locale, string> = {
  en: "EN",
  es: "ES",
};

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "es";
}
