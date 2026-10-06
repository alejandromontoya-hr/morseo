"use client";

import { useRef, type ReactNode, type RefObject } from "react";
import { Keyboard, Network } from "lucide-react";

import { useI18n } from "@/lib/i18n/context";
import { StationEmblem } from "@/components/station-emblem";

/**
 * El teclado morse del celular: sale donde sale el teclado del celular y ocupa
 * su lugar. Arriba, el muñeco con la letra que vas armando y el botón para
 * volver al teclado; al centro, el pulsador grande, con el árbol a la
 * izquierda y, a la derecha, lo de cada página (borrar, o la luz de «al aire»).
 */
export function MorsePad({
  sectionRef,
  keyEl,
  readout,
  idle,
  side,
  onKeyboard,
  onTree,
}: {
  sectionRef?: RefObject<HTMLElement | null>;
  /** El pulsador (`PadKey`). */
  keyEl: ReactNode;
  /** Lo que se teclea o suena ahora; sin nada, el globo dice `idle`. */
  readout?: ReactNode;
  idle: string;
  side?: ReactNode;
  onKeyboard: () => void;
  onTree?: () => void;
}) {
  const { t } = useI18n();
  const p = t.station.pad;
  // Lo que el muñeco dice en morse lo escribe él aquí, y mientras habla
  // esconde el texto de reposo.
  const sayRef = useRef<HTMLSpanElement>(null);
  const idleRef = useRef<HTMLSpanElement>(null);
  const reading = readout != null && readout !== false;

  return (
    <section ref={sectionRef} className="morse-pad" aria-label={p.label}>
      <div className="pad-top">
        <StationEmblem variant="dock" words={t.station.emblemWords} sayRef={sayRef} idleRef={idleRef} />
        <p className="pad-bubble" aria-hidden data-readout={reading ? "true" : undefined}>
          {reading && <span className="pad-readout">{readout}</span>}
          <span ref={idleRef}>{idle}</span>
          <span ref={sayRef} className="station-say" hidden />
        </p>
        <button type="button" className="pad-keyboard" aria-label={p.keyboardAria} onClick={onKeyboard}>
          <Keyboard aria-hidden />
          {p.keyboard}
        </button>
      </div>
      <div className="pad-main">
        {onTree ? <PadButton icon={<Network />} label={p.tree} ariaLabel={p.treeAria} onClick={onTree} /> : <span />}
        {keyEl}
        {side ?? <span />}
      </div>
      <p className="pad-hint" aria-hidden>
        <span><i className="pad-hint-dot" />{p.dot}</span>
        <span><i className="pad-hint-dash" />{p.dash}</span>
      </p>
    </section>
  );
}

/** Botón redondo a un lado del pulsador, con su nombre debajo. */
export function PadButton({
  icon,
  label,
  ariaLabel,
  onClick,
  disabled = false,
}: {
  icon: ReactNode;
  label: string;
  ariaLabel?: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button type="button" className="pad-side" aria-label={ariaLabel} onClick={onClick} disabled={disabled}>
      <span aria-hidden>{icon}</span>
      {label}
    </button>
  );
}

/** Luz a un lado del pulsador: roja al aire u ocupado, apagada si el canal está libre. */
export function PadLight({ state, label }: { state: "on" | "busy" | "free"; label: string }) {
  return (
    <div className="pad-side pad-light" data-state={state}>
      <span aria-hidden><i /></span>
      {label}
    </div>
  );
}
