"use client";

import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";

import { LOCALE_STORAGE_KEY, isLocale, type Locale } from "@/lib/i18n/config";
import { dictionaries, type Dict } from "@/lib/i18n";
import { localizedPath, pageOf } from "@/lib/i18n/routes";

type I18nValue = {
  locale: Locale;
  /** Lleva a la misma página en el otro idioma y recuerda la elección. */
  setLocale: (l: Locale) => void;
  /** Diccionario del idioma activo. */
  t: Dict;
};

const I18nContext = createContext<I18nValue | null>(null);

/** Guarda el idioma elegido para la próxima visita. */
export function rememberLocale(l: Locale) {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, l);
  } catch {
    /* sin persistencia: el cambio dura lo que la sesión */
  }
}

/**
 * El idioma lo decide la dirección: /es… es español y lo demás inglés. Así el
 * servidor entrega cada página ya traducida y Google ve los dos idiomas.
 */
export function LanguageProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Quien eligió el otro idioma en una visita anterior vuelve a verlo: se le
  // lleva a esta misma página en su idioma. Google no guarda preferencias, así
  // que siempre ve la página que pidió.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (isLocale(saved) && saved !== locale && pageOf(pathname)) {
        router.replace(localizedPath(pathname, saved));
      }
    } catch {
      /* localStorage no disponible: se queda en esta página */
    }
    // Solo al montar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLocale = useCallback(
    (l: Locale) => {
      rememberLocale(l);
      if (l !== locale) router.push(localizedPath(pathname, l));
    },
    [locale, pathname, router]
  );

  const value = useMemo<I18nValue>(
    () => ({ locale, setLocale, t: dictionaries[locale] }),
    [locale, setLocale]
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
