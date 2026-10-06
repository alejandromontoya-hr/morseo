"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { toneNow } from "@/lib/tone";

type Player = {
  osc: OscillatorNode;
  gain: GainNode;
  timer: ReturnType<typeof setTimeout> | null;
  i: number;
  cancelled: boolean;
};

type Step = { tone: boolean; units: number; idx?: number };

/**
 * Motor de audio morse compartido: reproducción con resaltado de cinta
 * (playMorse), reproducción de audio suelto sin UI (playClip) y el bip
 * sostenido de la tecla telegráfica (beepOn/beepOff). Tono senoidal de 600 Hz,
 * temporización PARIS según la velocidad en PPM.
 */
export function useMorseAudio() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const playerRef = useRef<Player | null>(null);
  const clipOscRef = useRef<OscillatorNode | null>(null);
  const beepRef = useRef<{ osc: OscillatorNode; gain: GainNode } | null>(null);
  const speedRef = useRef(8);
  // true mientras suena un tono (reproducción o tecla): alimenta la línea de
  // señal y, por `toneNow`, al muñeco del emblema.
  const toneOnRef = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  // El navegador no deja sonar nada hasta que la persona toca la página o una
  // tecla. Mientras tanto la reproducción sigue en silencio (luces y texto) y
  // `blocked` lo avisa; el primer toque o tecla enciende el sonido.
  const [blocked, setBlocked] = useState(false);

  const ctx = useCallback((): AudioContext => {
    if (!audioCtxRef.current) {
      // iOS trata el tono generado como sonido de fondo y lo calla con el
      // celular en silencio; como "playback" suena igual que un video.
      const session = (navigator as { audioSession?: { type: string } }).audioSession;
      if (session) session.type = "playback";
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ac = new AC();
      ac.onstatechange = () => {
        if (ac.state === "running") setBlocked(false);
      };
      audioCtxRef.current = ac;
    }
    return audioCtxRef.current;
  }, []);

  /** Pide sonar; si al rato sigue en pausa, el navegador espera un gesto. */
  const wake = useCallback((ac: AudioContext) => {
    if (ac.state === "running") return;
    ac.resume().catch(() => {});
    setTimeout(() => {
      if (ac.state === "suspended") setBlocked(true);
    }, 300);
  }, []);

  const unlock = useCallback(() => {
    audioCtxRef.current?.resume().catch(() => {});
  }, []);

  useEffect(() => {
    if (!blocked) return;
    const events = ["pointerdown", "pointerup", "keydown", "touchend"];
    events.forEach((ev) => window.addEventListener(ev, unlock, true));
    return () => events.forEach((ev) => window.removeEventListener(ev, unlock, true));
  }, [blocked, unlock]);

  const unitSec = useCallback(() => 1200 / speedRef.current / 1000, []);
  const setSpeed = useCallback((n: number) => {
    speedRef.current = n;
  }, []);

  const stopPlay = useCallback(() => {
    const p = playerRef.current;
    if (p) {
      p.cancelled = true;
      if (p.timer) clearTimeout(p.timer);
      try {
        p.gain.gain.cancelScheduledValues(audioCtxRef.current!.currentTime);
      } catch {}
      try {
        p.osc.stop();
      } catch {}
      playerRef.current = null;
    }
    toneOnRef.current = toneNow.on = false;
    setActiveIdx(null);
    setPlaying(false);
  }, []);

  const playMorse = useCallback(
    (morse: string, onEnd?: () => void, wpm?: number) => {
      stopPlay();
      if (!morse.trim()) return;
      setPlaying(true);
      setActiveIdx(null);
      // La velocidad del emisor manda si viene; si no, se lee en cada tono, así
      // cambiar la velocidad a mitad de la reproducción se nota en el siguiente.
      const unit = () => (wpm && wpm > 0 ? 1200 / wpm / 1000 : unitSec());

      const ac = ctx();
      wake(ac);
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = "sine";
      osc.frequency.value = 600;
      gain.gain.value = 0.0001;
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start();

      const steps: Step[] = [];
      let idx = 0;
      const words = morse.trim().split(/\s*\/\s*/);
      words.forEach((word, wi) => {
        const letters = word.split(/\s+/).filter(Boolean);
        letters.forEach((letter, li) => {
          [...letter].forEach((s, si) => {
            steps.push({ tone: true, units: s === "-" ? 3 : 1, idx: idx++ });
            if (si < letter.length - 1) steps.push({ tone: false, units: 1 });
          });
          if (li < letters.length - 1) steps.push({ tone: false, units: 3 });
        });
        if (wi < words.length - 1) steps.push({ tone: false, units: 7 });
      });

      const player: Player = { osc, gain, timer: null, i: 0, cancelled: false };
      playerRef.current = player;

      const step = () => {
        if (player.cancelled) return;
        if (player.i >= steps.length) {
          toneOnRef.current = toneNow.on = false;
          setActiveIdx(null);
          try {
            osc.stop();
          } catch {}
          playerRef.current = null;
          setPlaying(false);
          onEnd?.();
          return;
        }
        const st = steps[player.i++];
        const d = st.units * unit();
        const now = ac.currentTime;
        gain.gain.cancelScheduledValues(now);
        if (st.tone) {
          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.exponentialRampToValueAtTime(
            0.3,
            now + Math.min(0.006, d / 3)
          );
          gain.gain.setValueAtTime(0.3, now + Math.max(0.007, d - 0.006));
          gain.gain.exponentialRampToValueAtTime(0.0001, now + d);
          toneOnRef.current = toneNow.on = true;
          setActiveIdx(st.idx ?? null);
        } else {
          gain.gain.setValueAtTime(0.0001, now);
          toneOnRef.current = toneNow.on = false;
          setActiveIdx(null);
        }
        player.timer = setTimeout(step, d * 1000);
      };
      step();
    },
    [ctx, wake, stopPlay, unitSec]
  );

  // Reproduce un fragmento entero programándolo de una vez, sin estado de UI.
  const playClip = useCallback(
    (morse: string) => {
      if (!morse.trim()) return;
      try {
        clipOscRef.current?.stop();
      } catch {}
      const ac = ctx();
      wake(ac);
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = "sine";
      osc.frequency.value = 600;
      gain.gain.value = 0.0001;
      osc.connect(gain);
      gain.connect(ac.destination);
      const u = unitSec();
      let t = ac.currentTime;
      const words = morse.trim().split(/\s*\/\s*/);
      words.forEach((word, wi) => {
        const letters = word.split(/\s+/).filter(Boolean);
        letters.forEach((letter, li) => {
          [...letter].forEach((s, si) => {
            const d = (s === "-" ? 3 : 1) * u;
            gain.gain.setValueAtTime(0.0001, t);
            gain.gain.exponentialRampToValueAtTime(0.3, t + Math.min(0.006, d / 3));
            gain.gain.setValueAtTime(0.3, t + Math.max(0.007, d - 0.006));
            gain.gain.exponentialRampToValueAtTime(0.0001, t + d);
            t += d;
            if (si < letter.length - 1) t += u;
          });
          if (li < letters.length - 1) t += 3 * u;
        });
        if (wi < words.length - 1) t += 7 * u;
      });
      osc.start();
      osc.stop(t + 0.05);
      clipOscRef.current = osc;
    },
    [ctx, wake, unitSec]
  );

  const beepOn = useCallback(() => {
    const ac = ctx();
    wake(ac);
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "sine";
    osc.frequency.value = 600;
    gain.gain.value = 0.0001;
    osc.connect(gain);
    gain.connect(ac.destination);
    const n = ac.currentTime;
    gain.gain.setValueAtTime(0.0001, n);
    gain.gain.exponentialRampToValueAtTime(0.3, n + 0.006);
    osc.start();
    toneOnRef.current = toneNow.on = true;
    beepRef.current = { osc, gain };
  }, [ctx, wake]);

  const beepOff = useCallback(() => {
    toneOnRef.current = toneNow.on = false;
    const b = beepRef.current;
    if (!b) return;
    const n = ctx().currentTime;
    try {
      b.gain.gain.exponentialRampToValueAtTime(0.0001, n + 0.02);
      b.osc.stop(n + 0.05);
    } catch {}
    beepRef.current = null;
  }, [ctx]);

  useEffect(
    () => () => {
      toneNow.on = false;
      const p = playerRef.current;
      if (p) {
        p.cancelled = true;
        if (p.timer) clearTimeout(p.timer);
        try {
          p.osc.stop();
        } catch {}
      }
      try {
        clipOscRef.current?.stop();
      } catch {}
      try {
        beepRef.current?.osc.stop();
      } catch {}
      audioCtxRef.current?.close().catch(() => {});
    },
    []
  );

  return {
    playing,
    activeIdx,
    /** El navegador tiene el sonido en pausa hasta un toque o una tecla. */
    blocked,
    unlock,
    playMorse,
    stopPlay,
    playClip,
    beepOn,
    beepOff,
    setSpeed,
    unitSec,
    toneOnRef,
  };
}
