"use client";

import { LOCALES, LOCALE_LABELS, LOCALE_SHORT } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

/** Los dos idiomas a la vista: se ve cuál está activo y se cambia de un toque. */
export function LanguageToggle() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t.language.label}
      className="flex h-10 items-center gap-0.5 rounded-full bg-desk-raised p-1"
    >
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={locale === l}
          title={LOCALE_LABELS[l]}
          onClick={() => setLocale(l)}
          className={cn(
            "h-full rounded-full px-2.5 text-[13px] font-bold transition-colors",
            locale === l ? "bg-ink text-ink-fg" : "text-muted hover:text-text"
          )}
        >
          {LOCALE_SHORT[l]}
        </button>
      ))}
    </div>
  );
}
