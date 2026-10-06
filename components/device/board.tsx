import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * La placa de circuito que contiene el aparato (árbol y pulsador).
 * Arriba lleva la marca serigrafiada y, en la esquina, el agujero metalizado
 * de la argolla, como el llavero.
 */
export function Board({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("board px-4 pt-4 pb-5 sm:px-5", className)}>
      <span aria-hidden className="board-hole" />
      <div aria-hidden className="mb-3.5 flex h-[22px] items-center">
        <span className="silk text-[11px] tracking-[.3em]">Morseo</span>
      </div>
      {children}
    </div>
  );
}

/** LED de estado pequeño con su rótulo serigrafiado (TX, RX, PWR). */
export function StatusLed({
  label,
  on,
  color = "dot",
}: {
  label: string;
  on: boolean;
  color?: "dot" | "dash";
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden
        className="led-sm"
        data-on={on}
        style={{ "--led": `var(--${color})` } as CSSProperties}
      />
      <span className="silk text-[10px]">{label}</span>
    </span>
  );
}
