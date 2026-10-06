"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { decode } from "@/lib/morse";
import { useMorseAudio } from "@/lib/use-morse-audio";

type Track = { morse: string; id: string };

/**
 * Para cada tono (índice global del motor de audio): el código de su letra, la
 * posición del tono dentro de ella y el número de letra en el mensaje.
 */
function indexSymbols(morse: string) {
  const out: { code: string; k: number; letter: number }[] = [];
  let n = 0;
  for (const word of morse.trim().split(/\s*\/\s*/)) {
    for (const letter of word.split(/\s+/).filter(Boolean)) {
      for (let k = 0; k < letter.length; k++) out.push({ code: letter, k, letter: n });
      n++;
    }
  }
  return out;
}

/**
 * Devuelve solo las letras cuyo último tono ya sonó (índice ≤ toneIdx), en
 * morse. Sirve para revelar la traducción a medida que suena.
 */
function revealedMorse(morse: string, toneIdx: number): string {
  let idx = 0;
  const words: string[] = [];
  for (const word of morse.trim().split(/\s*\/\s*/)) {
    const kept: string[] = [];
    for (const letter of word.split(/\s+/).filter(Boolean)) {
      const lastTone = idx + letter.length - 1;
      idx += letter.length;
      if (lastTone <= toneIdx) kept.push(letter);
    }
    if (kept.length) words.push(kept.join(" "));
  }
  return words.join(" / ");
}

/**
 * Reproductor para el árbol: suena un mensaje en morse y, tono a tono, dice qué
 * tramo de la letra actual hay que encender (`prefix`) y qué parte del texto ya
 * sonó (`revealed`). Al terminar deja la última letra encendida un instante
 * (`linger`), como un LED que se apaga.
 */
export function useMorsePlayer() {
  const audio = useMorseAudio();
  const { playMorse, stopPlay, activeIdx, playing } = audio;
  const [track, setTrack] = useState<Track | null>(null);
  const [maxIdx, setMaxIdx] = useState(-1);
  const [linger, setLinger] = useState("");
  const lastPrefixRef = useRef("");
  const wasPlayingRef = useRef(false);

  // En los silencios activeIdx vuelve a null: conservamos el máximo alcanzado.
  useEffect(() => {
    if (activeIdx != null) setMaxIdx((m) => Math.max(m, activeIdx));
  }, [activeIdx]);

  const symbols = useMemo(() => (track ? indexSymbols(track.morse) : []), [track]);
  const current = playing && maxIdx >= 0 ? symbols[maxIdx] : undefined;
  const prefix = current ? current.code.slice(0, current.k + 1) : "";

  useEffect(() => {
    if (prefix) lastPrefixRef.current = prefix;
  }, [prefix]);

  useEffect(() => {
    if (playing) {
      wasPlayingRef.current = true;
      return;
    }
    if (!wasPlayingRef.current) return;
    wasPlayingRef.current = false;
    setLinger(lastPrefixRef.current);
    const tm = setTimeout(() => setLinger(""), 650);
    return () => clearTimeout(tm);
  }, [playing]);

  const play = useCallback(
    (morse: string, o: { id?: string; wpm?: number; onEnd?: () => void } = {}) => {
      if (!morse.trim()) return;
      setLinger("");
      setMaxIdx(-1);
      setTrack({ morse, id: o.id ?? "local" });
      playMorse(morse, o.onEnd, o.wpm);
    },
    [playMorse]
  );

  const stop = useCallback(() => {
    stopPlay();
    // Detenido a mano (p. ej. al teclear encima) no deja la letra encendida:
    // el árbol debe mostrar solo lo que estás tecleando.
    wasPlayingRef.current = false;
    setLinger("");
  }, [stopPlay]);

  const revealed =
    track && playing ? decode(revealedMorse(track.morse, maxIdx)) : "";

  return {
    audio,
    play,
    stop,
    playing,
    playingId: playing ? (track?.id ?? null) : null,
    prefix,
    /** Código completo de la letra que suena (el prefijo es lo que ya sonó). */
    letterCode: current ? current.code : "",
    /** Número de la letra que suena dentro del mensaje (desde 0). */
    letterIdx: current ? current.letter : null,
    linger,
    revealed,
  };
}

export type MorsePlayer = ReturnType<typeof useMorsePlayer>;
