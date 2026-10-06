"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LOCALES, LOCALE_LABELS, LOCALE_SHORT } from "@/lib/i18n/config";
import { rememberLocale, useI18n } from "@/lib/i18n/context";
import { localizedPath } from "@/lib/i18n/routes";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/tooltip";

/**
 * Los dos idiomas a la vista: se ve cuál está activo y se cambia de un toque.
 * Son enlaces a la misma página en el otro idioma, así Google también los sigue.
 */
export function LanguageToggle() {
  const { locale, t } = useI18n();
  const pathname = usePathname();

  return (
    <div
      role="group"
      aria-label={t.language.label}
      className="flex h-10 items-center gap-0.5 rounded-full bg-desk-raised p-1"
    >
      {LOCALES.map((l) => (
        <Tooltip key={l} label={LOCALE_LABELS[l]} side="bottom">
          <Link
            href={localizedPath(pathname, l)}
            hrefLang={l}
            lang={l}
            aria-current={locale === l ? "true" : undefined}
            onClick={() => rememberLocale(l)}
            className={cn(
              "grid h-full place-items-center rounded-full px-2.5 text-[13px] font-bold transition-colors",
              locale === l ? "bg-ink text-ink-fg" : "text-muted hover:text-text"
            )}
          >
            {LOCALE_SHORT[l]}
          </Link>
        </Tooltip>
      ))}
    </div>
  );
}
