"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { isTyping } from "@/lib/dom";
import { REV } from "@/lib/morse";
import type { MorsePlayer } from "@/lib/use-morse-player";
import { useStraightKey } from "@/lib/use-straight-key";

/**
 * La tecla del aparato: botón en pantalla y barra espaciadora (salvo cuando
 * escribes en un campo). Va armando la letra en curso (`seq`), la entrega al
 * hacer la pausa entre letras y deja esa letra encendida un momento (`held`)
 * para que se alcance a ver en el árbol.
 */
export function useKeyer({
  player,
  enabled = true,
  onLetter,
  onWordGap,
}: {
  player: MorsePlayer;
  enabled?: boolean;
  /** Letra completada; `null` si la secuencia no corresponde a ninguna. */
  onLetter?: (letter: string | null, code: string) => void;
  onWordGap?: () => void;
}) {
  const [seq, setSeq] = useState("");
  const [held, setHeld] = useState("");
  const seqRef = useRef("");
  const heldTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cbRef = useRef({ onLetter, onWordGap });
  cbRef.current = { onLetter, onWordGap };
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const { audio, stop } = player;

  const key = useStraightKey({
    unitSec: audio.unitSec,
    onBeepOn: audio.beepOn,
    onBeepOff: audio.beepOff,
    onSymbol: (s) => {
      seqRef.current += s;
      setSeq(seqRef.current);
    },
    onLetterGap: () => {
      const code = seqRef.current;
      if (!code) return;
      seqRef.current = "";
      setSeq("");
      setHeld(code);
      if (heldTimerRef.current) clearTimeout(heldTimerRef.current);
      heldTimerRef.current = setTimeout(() => setHeld(""), 900);
      cbRef.current.onLetter?.(REV[code] ?? null, code);
    },
    onWordGap: () => cbRef.current.onWordGap?.(),
  });

  // Las funciones de la tecla trabajan con refs: cualquier versión sirve, así
  // que las guardamos en una ref para no volver a suscribir los eventos.
  const keyRef = useRef(key);
  keyRef.current = key;
  const { pressedRef } = key;

  const press = useCallback(() => {
    if (!enabledRef.current) return;
    stop();
    if (heldTimerRef.current) clearTimeout(heldTimerRef.current);
    setHeld("");
    keyRef.current.press();
  }, [stop]);

  const release = useCallback(() => keyRef.current.release(), []);

  /** Olvida la letra a medio armar (al borrar o cambiar de ejercicio). */
  const reset = useCallback(() => {
    keyRef.current.release();
    keyRef.current.cancelTimers();
    if (heldTimerRef.current) clearTimeout(heldTimerRef.current);
    seqRef.current = "";
    setSeq("");
    setHeld("");
  }, []);

  useEffect(() => {
    if (!enabled) reset();
  }, [enabled, reset]);

  // Barra espaciadora = tecla. Evita el desplazamiento de la página y que
  // active el último botón pulsado. Solo cede la barra a un botón al que
  // llegaste con Tab: tras un clic, la barra sigue siendo la tecla.
  useEffect(() => {
    let byPointer = false;
    let keyboardFocus = false;
    const pointer = () => {
      byPointer = true;
    };
    const focusIn = () => {
      keyboardFocus = !byPointer;
      byPointer = false;
    };
    const down = (e: KeyboardEvent) => {
      byPointer = false;
      if (e.code !== "Space" || e.ctrlKey || e.metaKey || e.altKey) return;
      if (!enabledRef.current || isTyping()) return;
      const target = e.target instanceof Element ? e.target : null;
      if (
        keyboardFocus &&
        target?.closest("button, a, summary, [role='button']") &&
        !target.closest("[data-morse-key]")
      )
        return;
      e.preventDefault();
      if (!e.repeat) press();
    };
    const up = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      if (pressedRef.current) {
        e.preventDefault();
        release();
      }
    };
    const blur = () => {
      if (pressedRef.current) release();
    };
    document.addEventListener("pointerdown", pointer, true);
    document.addEventListener("focusin", focusIn);
    document.addEventListener("keydown", down);
    document.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      document.removeEventListener("pointerdown", pointer, true);
      document.removeEventListener("focusin", focusIn);
      document.removeEventListener("keydown", down);
      document.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, [press, release, pressedRef]);

  useEffect(
    () => () => {
      if (heldTimerRef.current) clearTimeout(heldTimerRef.current);
    },
    []
  );

  return {
    /** Símbolos ya soltados de la letra en curso. */
    seq,
    /** Última letra completada, encendida un instante. */
    held,
    /** Símbolo que estás sosteniendo ahora mismo. */
    pending: key.pending,
    pressed: key.keyPressed,
    press,
    release,
    reset,
    wpm: key.wpm,
  };
}

export type Keyer = ReturnType<typeof useKeyer>;
