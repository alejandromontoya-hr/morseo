"use client";

import type { KeyboardEvent, MouseEvent, PointerEvent } from "react";
import { Radio } from "lucide-react";

import type { Keyer } from "@/lib/use-keyer";
import { StatusLed } from "@/components/device/board";
import { MorseGlyphs } from "@/components/morse-glyphs";
import { Tooltip } from "@/components/ui/tooltip";

/**
 * Lo que convierte un botón en tecla: baja al tocarlo y sube al soltarlo.
 * Captura el puntero al bajar, así un dedo que se corre un poco no corta la
 * raya. Con el foco puesto, Enter también teclea.
 */
export function keyHandlers(keyer: Keyer, disabled: boolean) {
  return {
    "data-morse-key": true,
    "data-pressed": keyer.pressed,
    onPointerDown: (e: PointerEvent<HTMLButtonElement>) => {
      if (disabled || e.button > 0) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      keyer.press();
    },
    onPointerUp: () => keyer.release(),
    onPointerCancel: () => keyer.release(),
    onLostPointerCapture: () => keyer.release(),
    onContextMenu: (e: MouseEvent) => e.preventDefault(),
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.repeat) {
        e.preventDefault();
        keyer.press();
      }
    },
    onKeyUp: (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        keyer.release();
      }
    },
    onBlur: () => keyer.release(),
  };
}

/**
 * El pulsador del aparato: el mismo botón redondo de la vista «Tecla», sobre
 * la placa. Debajo aparece en vivo el morse que vas armando con la letra que
 * resultó (o un aviso), y más abajo la leyenda y el LED de transmisión.
 */
export function KeyButton({
  keyer,
  disabled = false,
  txOn,
  code = "",
  letter,
  notice,
  ariaLabel,
  label,
  shortLabel,
  longLabel,
  txLabel,
  keyTip,
  txTip,
}: {
  keyer: Keyer;
  disabled?: boolean;
  /** LED de transmisión; por defecto, encendido mientras la tecla está abajo. */
  txOn?: boolean;
  /** Morse de la letra en curso (lo que se teclea o lo que suena). */
  code?: string;
  /** La letra que resultó, cuando ya terminó. */
  letter?: string;
  /** Aviso que reemplaza la lectura (p. ej. «no es letra»). */
  notice?: string;
  ariaLabel: string;
  label: string;
  shortLabel: string;
  longLabel: string;
  txLabel: string;
  /** Cómo se teclea, para el globito del pulsador (solo con mouse). */
  keyTip?: string;
  txTip?: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <Tooltip label={keyTip} touch={false}>
        <button
          type="button"
          className="pulsador"
          disabled={disabled}
          aria-label={ariaLabel}
          {...keyHandlers(keyer, disabled)}
        >
          <Radio aria-hidden />
        </button>
      </Tooltip>

      <div className="board-readout" aria-live="polite">
        {notice ? (
          <span className="silk opacity-75">{notice}</span>
        ) : code ? (
          <>
            <MorseGlyphs morse={code} size={9} tone="led" />
            {letter && <span className="board-readout-letter">{letter}</span>}
          </>
        ) : null}
      </div>

      <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-3">
        {/* Leyenda: el toque corto enciende círculos; el largo, barras */}
        <div className="flex flex-col items-start gap-2 justify-self-start pl-1">
          <span className="inline-flex items-center gap-2">
            <span aria-hidden className="size-[9px] rounded-full bg-dot" />
            <span className="silk text-[10px]">{shortLabel}</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span aria-hidden className="h-[9px] w-[22px] rounded-[3px] bg-dash" />
            <span className="silk text-[10px]">{longLabel}</span>
          </span>
        </div>
        <span className="silk text-[10px]">{label}</span>
        <div className="justify-self-end pr-1">
          <StatusLed label={txLabel} on={txOn ?? keyer.pressed} color="dash" tip={txTip} />
        </div>
      </div>
    </div>
  );
}
