import en, { type Dict } from "@/lib/i18n/en";
import es from "@/lib/i18n/es";
import type { Locale } from "@/lib/i18n/config";

export type { Dict };
export * from "@/lib/i18n/config";

/** Todos los diccionarios, indexados por idioma. */
export const dictionaries: Record<Locale, Dict> = { en, es };
