"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Eraser, Play, Square } from "lucide-react";

import { isTyping } from "@/lib/dom";
import { MORSE, REV, encode, normalize } from "@/lib/morse";
import { useI18n } from "@/lib/i18n/context";
import { useKeyer } from "@/lib/use-keyer";
import { useMorsePlayer } from "@/lib/use-morse-player";
import { Board } from "@/components/device/board";
import { HandKey } from "@/components/device/hand-key";
import { KeyButton } from "@/components/device/key-button";
import { MorseTree } from "@/components/device/morse-tree";
import { DeviceLayout, FieldLabel, type DeviceView } from "@/components/device-layout";
import { MorseGlyphs } from "@/components/morse-glyphs";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { SignalMonitor } from "@/components/signal-monitor";

const SPEEDS = { slow: 8, medium: 12, fast: 18 } as const;
type Speed = keyof typeof SPEEDS;
const MAX_LEN = 250;

/**
 * Traductor: un solo mensaje que se arma escribiendo o con la tecla. El árbol
 * muestra la letra que tecleas o la que suena, y abajo sale el mensaje entero
 * en morse.
 */
export default function TranslateApp() {
  const { t } = useI18n();
  const tr = t.translate;
  const player = useMorsePlayer();
  const { setSpeed: setAudioSpeed } = player.audio;
  const [text, setText] = useState("");
  const [view, setView] = useState<DeviceView>("key");
  // Onda de luces en el árbol cada vez que se pasa a él.
  const [sweep, setSweep] = useState(0);
  const [speed, setSpeed] = useState<Speed>("medium");
  const [copied, setCopied] = useState(false);
  const [notLetter, setNotLetter] = useState(false);
  const flashRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const keyer = useKeyer({
    player,
    onLetter: (letter) => {
      if (!letter) {
        setNotLetter(true);
        if (flashRef.current) clearTimeout(flashRef.current);
        flashRef.current = setTimeout(() => setNotLetter(false), 1100);
        return;
      }
      setText((v) => (v + letter).slice(0, MAX_LEN));
    },
    onWordGap: () => setText((v) => (v && !v.endsWith(" ") ? v + " " : v)),
  });

  useEffect(() => {
    setAudioSpeed(SPEEDS[speed]);
  }, [speed, setAudioSpeed]);

  // Retroceso fuera del campo de texto: borra la última letra tecleada.
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key !== "Backspace" || isTyping()) return;
      e.preventDefault();
      setText((v) => v.slice(0, -1));
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(
    () => () => {
      if (flashRef.current) clearTimeout(flashRef.current);
    },
    []
  );

  const morse = encode(text);
  const skipped = useMemo(() => {
    const chars = new Set<string>();
    for (const c of normalize(text).toUpperCase()) {
      if (c.trim() && !MORSE[c]) chars.add(c);
    }
    return [...chars].join(" ");
  }, [text]);

  const msgPlaying = player.playingId === "msg";

  // Lo que muestra el árbol: lo que suena manda; si no, lo que tecleas.
  const keying = keyer.seq + (keyer.pending ?? "");
  const liveCode = player.playing ? player.prefix : keying || keyer.held || player.linger;
  // Mientras suena, la letra se escribe cuando termina: la O (– – –) no se
  // anuncia como T ni como M a mitad de camino.
  const liveLetter =
    player.playing && player.prefix !== player.letterCode ? undefined : REV[liveCode];

  function togglePlay() {
    if (msgPlaying) {
      player.stop();
      return;
    }
    keyer.reset();
    player.play(morse, { id: "msg" });
  }

  function clear() {
    player.stop();
    keyer.reset();
    setText("");
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(morse);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* sin permiso de portapapeles: no hay nada que hacer */
    }
  }

  const board = (
    <Board>
      <MorseTree
        code={player.playing ? player.prefix : keyer.seq || keyer.held || player.linger}
        pending={player.playing ? null : keyer.pending}
        sweep={sweep}
        onPick={(n) => {
          keyer.reset();
          player.play(n.code, { id: "letter" });
        }}
        words={t.device.words}
        ariaLabel={t.device.treeAria}
        nodeLabel={(n) => t.device.nodeLabel(n.letter, n.code)}
      />
      <div className="mt-4">
        <KeyButton
          keyer={keyer}
          code={liveCode}
          letter={liveLetter}
          notice={notLetter ? t.device.notALetter : undefined}
          ariaLabel={t.device.keyAria}
          label={t.device.key}
          shortLabel={t.device.short}
          longLabel={t.device.long}
          txLabel={t.device.tx}
        />
      </div>
    </Board>
  );

  return (
    <DeviceLayout
      mode="translate" title={tr.title} lead={tr.lead} board={board}
      hand={
        <HandKey
          keyer={keyer}
          notice={notLetter ? t.device.notALetter : undefined}
          ariaLabel={t.device.keyAria}
          {...t.station.hand}
        />
      }
      view={view}
      onViewChange={(v) => {
        keyer.reset();
        if (v === "tree") setSweep((s) => s + 1);
        setView(v);
      }}
      monitor={<SignalMonitor morse={morse} wpm={SPEEDS[speed]} active={player.playing} />}
    >
      <FieldLabel htmlFor="message">{tr.messageLabel}</FieldLabel>
      <textarea
        id="message"
        value={text}
        rows={3}
        maxLength={MAX_LEN}
        placeholder={tr.placeholder}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          // El morse no tiene saltos de línea: Enter reproduce el mensaje.
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (morse) togglePlay();
          }
        }}
        className="station-message"
      />
      <div className="station-input-meta"><span>{t.station.editorHint}</span><span>{text.length} / {MAX_LEN}</span></div>

      <div className="mt-6 mb-2 flex items-center justify-between gap-3">
        <span className="text-[15px] font-semibold">{tr.morseLabel}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={copy}
          disabled={!morse}
          aria-label={tr.copyAria}
        >
          {copied ? <Check /> : <Copy />}
          {copied ? tr.copied : tr.copy}
        </Button>
      </div>
      <div className="station-morse-output">
        {morse ? (
          <>
            <MorseGlyphs
              morse={morse}
              size={10}
              tone="ink"
              active={msgPlaying ? player.letterIdx : null}
            />
            <span className="sr-only">{morse}</span>
          </>
        ) : (
          <p className="text-[15px] text-muted">{tr.morseEmpty}</p>
        )}
      </div>
      {skipped && <p className="mt-2 text-sm text-muted">{tr.skipped(skipped)}</p>}

      <div className="mt-5 flex flex-wrap gap-2.5">
        <Button variant="primary" onClick={togglePlay} disabled={!morse}>
          {msgPlaying ? <Square /> : <Play />}
          {msgPlaying ? tr.stop : tr.play}
        </Button>
        <Button onClick={clear} disabled={!text}>
          <Eraser />
          {tr.clear}
        </Button>
      </div>

      <div className="mt-8 max-w-[380px]">
        <FieldLabel>{tr.speed}</FieldLabel>
        <Segmented
          value={speed}
          onChange={setSpeed}
          ariaLabel={tr.speed}
          options={(Object.keys(SPEEDS) as Speed[]).map((s) => ({
            value: s,
            label: tr.speeds[s],
            title: t.common.wpm(SPEEDS[s]),
          }))}
        />
      </div>

    </DeviceLayout>
  );
}
