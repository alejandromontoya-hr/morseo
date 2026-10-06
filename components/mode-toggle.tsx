"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const { t } = useI18n();

  return (
    <Button
      variant="soft"
      size="icon"
      aria-label={t.theme.toggle}
      title={t.theme.toggle}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="relative"
    >
      <Sun className="scale-100 transition-transform dark:scale-0" />
      <Moon className="absolute scale-0 transition-transform dark:scale-100" />
    </Button>
  );
}
