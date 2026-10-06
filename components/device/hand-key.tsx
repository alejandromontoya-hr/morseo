"use client";

import { Radio } from "lucide-react";

import { REV } from "@/lib/morse";
import type { Keyer } from "@/lib/use-keyer";
import { keyHandlers } from "@/components/device/key-button";
import { MorseGlyphs } from "@/components/morse-glyphs";

/**
 * La tecla sola, sin el aparato: un botón redondo que se mantiene oprimido
 * como el pulsador. Debajo aparece en vivo la letra que vas armando y, al
 * hacer la pausa, la letra que resultó.
 */
export function HandKey({
  keyer,
  disabled = false,
  notice,
  ariaLabel,
  title,
  lead,
  short,
  long,
  spaceBar,
  pause,
}: {
  keyer: Keyer;
  disabled?: boolean;
  /** Aviso que reemplaza la lectura (p. ej. «no es letra» o «enciende el radio»). */
  notice?: string;
  ariaLabel: string;
  title: string;
  lead: string;
  short: string;
  long: string;
  spaceBar: string;
  pause: string;
}) {
  const keying = keyer.seq + (keyer.pending ?? "");
  const code = keying || keyer.held;
  // La letra se muestra solo cuando terminó: a mitad de camino no se adivina.
  const letter = !keying && keyer.held ? REV[keyer.held] : undefined;

  return (
    <div className="hand-key" data-disabled={disabled}>
      <h2>{title}</h2>
      <p className="hand-key-lead">{lead}</p>

      <button
        type="button"
        className="pulsador"
        disabled={disabled}
        aria-label={ariaLabel}
        {...keyHandlers(keyer, disabled)}
      >
        <Radio aria-hidden />
      </button>

      <div className="hand-key-readout" aria-live="polite">
        {notice ? (
          <span className="hand-key-notice">{notice}</span>
        ) : code ? (
          <>
            <MorseGlyphs morse={code} size={9} tone="led" />
            {letter && <span className="hand-key-letter">{letter}</span>}
          </>
        ) : (
          <MorseGlyphs morse=". -" size={7} tone="ink" className="hand-key-idle" />
        )}
      </div>

      <p className="hand-key-legend">
        <span><i aria-hidden className="bg-dot" />{short}</span>
        <span><i aria-hidden className="bg-dash" />{long}</span>
      </p>
      <p className="hand-key-help">
        {/* En pantallas táctiles no hay barra espaciadora: ese consejo sobra */}
        <span className="[@media(pointer:coarse)]:hidden">{spaceBar} </span>
        {pause}
      </p>
    </div>
  );
}
