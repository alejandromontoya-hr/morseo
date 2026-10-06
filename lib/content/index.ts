import en, { type Content } from "@/lib/content/en";
import es from "@/lib/content/es";
import type { Locale } from "@/lib/i18n/config";

export type { Content };

/** Textos para buscadores e IA, por idioma. Solo se usan en el servidor. */
export const content: Record<Locale, Content> = { en, es };
