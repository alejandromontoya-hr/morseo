"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";

import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  isLocale,
  type Locale,
} from "@/lib/i18n/config";
import { dictionaries, type Dict } from "@/lib/i18n";

type I18nValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  toggleLocale: () => void;
  /** Diccionario del idioma activo. */
  t: Dict;
};

const I18nContext = createContext<I18nValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // El primer render (servidor y cliente) usa siempre el idioma por defecto para
  // no provocar un desajuste de hidratación. La preferencia guardada se aplica
  // ya montado, en el efecto de abajo.
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const pathname = usePathname();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (isLocale(saved) && saved !== locale) setLocaleState(saved);
    } catch {
      /* localStorage no disponible: nos quedamos con el idioma por defecto */
    }
    // Solo al montar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mantiene el atributo lang del documento y el título de la pestaña en
  // sincronía con el idioma activo y la ruta actual.
  useEffect(() => {
    const { meta } = dictionaries[locale];
    document.documentElement.lang = locale;
    const title = pathname?.startsWith("/learn")
      ? meta.learnTitle
      : pathname?.startsWith("/radio")
        ? meta.radioTitle
        : meta.title;
    document.title = title;
    // Al navegar, Next.js vuelve a poner el título de la metadata (en inglés)
    // justo después; lo reafirmamos en el siguiente ciclo.
    const tm = setTimeout(() => {
      document.title = title;
    }, 80);
    return () => clearTimeout(tm);
  }, [locale, pathname]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, l);
    } catch {
      /* sin persistencia: el cambio dura lo que la sesión */
    }
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((prev) => {
      const next: Locale = prev === "en" ? "es" : "en";
      try {
        localStorage.setItem(LOCALE_STORAGE_KEY, next);
      } catch {
        /* sin persistencia */
      }
      return next;
    });
  }, []);

  const value = useMemo<I18nValue>(
    () => ({ locale, setLocale, toggleLocale, t: dictionaries[locale] }),
    [locale, setLocale, toggleLocale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n debe usarse dentro de <LanguageProvider>");
  }
  return ctx;
}

/** Atajo cuando solo se necesita el diccionario del idioma activo. */
export function useT(): Dict {
  return useI18n().t;
}
