"use client";

import { useEffect, useRef, useState } from "react";

type Opts = {
  unitSec: () => number;
  onBeepOn: () => void;
  onBeepOff: () => void;
  onSymbol: (s: "." | "-") => void;
  onLetterGap: () => void;
  onWordGap: () => void;
};

/**
 * Tecla telegráfica adaptativa: toque corto = punto, pulsación larga = raya.
 * Estima la duración de un punto (dotLen) a partir de tu ritmo y, tras soltar,
 * agenda los separadores de letra (×2) y de palabra (×7).
 *
 * Mientras la tecla está abajo expone `pending`: empieza en punto y cambia a
 * raya en cuanto la pulsación pasa el umbral. Sirve para encender en el árbol,
 * en vivo, el símbolo que vas a soltar.
 */
export function useStraightKey(opts: Opts) {
  const [keyPressed, setKeyPressed] = useState(false);
  const [pending, setPending] = useState<"." | "-" | null>(null);

  const pressedRef = useRef(false);
  const pressStartRef = useRef(0);
  const dotLenRef = useRef(0);
  const letterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wordTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cbRef = useRef(opts);
  cbRef.current = opts;

  const dotLen = () => dotLenRef.current || cbRef.current.unitSec() * 1000;

  const cancelTimers = () => {
    if (letterTimerRef.current) clearTimeout(letterTimerRef.current);
    if (wordTimerRef.current) clearTimeout(wordTimerRef.current);
    if (dashTimerRef.current) clearTimeout(dashTimerRef.current);
  };

  const press = () => {
    if (pressedRef.current) return;
    cancelTimers();
    pressedRef.current = true;
    setKeyPressed(true);
    setPending(".");
    pressStartRef.current = performance.now();
    dashTimerRef.current = setTimeout(() => setPending("-"), dotLen() * 2);
    cbRef.current.onBeepOn();
  };

  const release = () => {
    if (!pressedRef.current) return;
    const dur = performance.now() - pressStartRef.current;
    pressedRef.current = false;
    setKeyPressed(false);
    setPending(null);
    if (dashTimerRef.current) clearTimeout(dashTimerRef.current);
    cbRef.current.onBeepOff();
    const current = dotLen();
    const isDot = dur < current * 2;
    const sample = isDot ? dur : dur / 3;
    dotLenRef.current = Math.max(40, current * 0.7 + sample * 0.3);
    cbRef.current.onSymbol(isDot ? "." : "-");
    const dl = dotLenRef.current;
    letterTimerRef.current = setTimeout(() => cbRef.current.onLetterGap(), dl * 2);
    // El espacio entre palabras exige la pausa completa (7 puntos): así quien
    // aprende y se toma su tiempo entre letras no recibe espacios de más.
    wordTimerRef.current = setTimeout(() => cbRef.current.onWordGap(), dl * 7);
  };

  const resetRhythm = () => {
    dotLenRef.current = 0;
  };

  /** Tu velocidad estimada en PPM (palabras por minuto, estándar PARIS). */
  const wpm = () => Math.round(1200 / dotLen());

  useEffect(() => () => cancelTimers(), []);

  return {
    keyPressed,
    pending,
    pressedRef,
    press,
    release,
    cancelTimers,
    resetRhythm,
    wpm,
  };
}
