"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Selector de pocas opciones, todas a la vista (velocidad, nivel, canal).
 * Una sola decisión y un solo clic, sin menús desplegables.
 */
export function Segmented<T extends string | number>({
  value,
  onChange,
  options,
  ariaLabel,
  disabled = false,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: ReactNode; title?: string }[];
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "grid auto-cols-fr grid-flow-col gap-1 rounded-full bg-surface p-1",
        disabled && "opacity-45",
        className
      )}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            disabled={disabled}
            aria-pressed={active}
            title={o.title}
            onClick={() => onChange(o.value)}
            className={cn(
              "h-9 min-w-0 truncate rounded-full px-2 text-[15px] font-semibold transition-colors",
              active
                ? "bg-lime text-graphite"
                : "text-muted hover:text-text"
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
