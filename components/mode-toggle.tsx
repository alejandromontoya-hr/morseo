"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { Tooltip } from "@/components/ui/tooltip";

export function ModeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const { t } = useI18n();

  return (
    <Tooltip label={t.theme.toggle} side="bottom">
      <Button
        variant="soft"
        size="icon"
        aria-label={t.theme.toggle}
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        className="relative"
      >
        <Sun className="scale-100 transition-transform dark:scale-0" />
        <Moon className="absolute scale-0 transition-transform dark:scale-100" />
      </Button>
    </Tooltip>
  );
}

/** Claro u oscuro, con su nombre: para la hoja de ajustes del celular. */
export function ThemeChoice() {
  const { setTheme, resolvedTheme } = useTheme();
  const { t } = useI18n();

  return (
    <Segmented
      value={resolvedTheme === "dark" ? "dark" : "light"}
      onChange={setTheme}
      ariaLabel={t.station.theme}
      className="settings-theme"
      options={[
        { value: "light", label: <><Sun aria-hidden />{t.station.themeLight}</> },
        { value: "dark", label: <><Moon aria-hidden />{t.station.themeDark}</> },
      ]}
    />
  );
}
