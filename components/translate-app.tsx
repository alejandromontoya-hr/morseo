"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown, Copy, Delete, Eraser, Play, Radio, Square, X } from "lucide-react";

import { isTyping } from "@/lib/dom";
import { MORSE, REV, encode, normalize } from "@/lib/morse";
import { useI18n } from "@/lib/i18n/context";
import { useKeyer } from "@/lib/use-keyer";
import { useMorsePlayer } from "@/lib/use-morse-player";
import { Board } from "@/components/device/board";
import { HandKey } from "@/components/device/hand-key";
import { KeyButton, PadKey } from "@/components/device/key-button";
import { PadButton } from "@/components/device/morse-pad";
import { MorseTree } from "@/components/device/morse-tree";
import { DeviceLayout, FieldLabel, type DeviceView } from "@/components/device-layout";
import { MorseGlyphs } from "@/components/morse-glyphs";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { Tooltip } from "@/components/ui/tooltip";
import { SignalMonitor } from "@/components/signal-monitor";

const SPEEDS = { slow: 8, medium: 12, fast: 18 } as const;
type Speed = keyof typeof SPEEDS;
const MAX_LEN = 250;

/**
 * Traductor: un solo mensaje que se arma escribiendo o con la tecla. El árbol
 * muestra la letra que tecleas o la que suena, y abajo sale el mensaje entero
 * en morse.
 */
export default function TranslateApp({ about }: { about?: ReactNode }) {
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
  // Celular: el teclado morse (en lugar del teclado) y el árbol a pantalla completa.
  const [padOpen, setPadOpen] = useState(false);
  const [telegraph, setTelegraph] = useState(false);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // Al abrir el teclado morse la página sube lo justo para que el morse quede
  // a la vista encima de él, como cuando sale el teclado del celular.
  useEffect(() => {
    if (!padOpen) return;
    const raf = requestAnimationFrame(() => {
      const pad = document.querySelector<HTMLElement>(".morse-pad");
      const out = outputRef.current;
      if (!pad || !out) return;
      const hidden = out.getBoundingClientRect().bottom - (window.innerHeight - pad.offsetHeight) + 12;
      if (hidden > 0) window.scrollBy({ top: hidden, behavior: "smooth" });
    });
    return () => cancelAnimationFrame(raf);
  }, [padOpen]);

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
  // Por qué Reproducir y Copiar se apagan: no hay mensaje, o no tiene morse.
  const whyNoMorse = text.trim() ? t.tips.noMorse : t.tips.needMessage;

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

  // El teclado morse reemplaza al del celular: al abrirlo se cierra el otro.
  function openPad() {
    (document.activeElement as HTMLElement | null)?.blur();
    setPadOpen(true);
  }

  // «Teclado»: el foco en el mensaje abre el teclado del celular (y cierra este).
  function backToKeyboard() {
    keyer.reset();
    messageRef.current?.focus();
    setPadOpen(false);
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
          keyTip={t.tips.key}
          txTip={t.tips.tx}
        />
      </div>
    </Board>
  );

  return (
    <DeviceLayout
      mode="translate" title={tr.title} lead={tr.lead} board={board} about={about}
      hand={
        <HandKey
          keyer={keyer}
          notice={notLetter ? t.device.notALetter : undefined}
          ariaLabel={t.device.keyAria}
          tip={t.tips.key}
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
      pad={{
        open: padOpen,
        onKeyboard: backToKeyboard,
        idle: t.station.pad.idle.translate,
        keyEl: <PadKey keyer={keyer} ariaLabel={t.device.keyAria} tip={t.tips.key} />,
        readout: notLetter ? (
          t.device.notALetter
        ) : liveCode ? (
          <>
            <MorseGlyphs morse={liveCode} size={8} />
            {liveLetter && <b>{liveLetter}</b>}
          </>
        ) : undefined,
        side: (
          <PadButton
            icon={<Delete />}
            label={t.station.pad.erase}
            ariaLabel={t.station.pad.eraseAria}
            disabled={!text}
            onClick={() => setText((v) => v.slice(0, -1))}
          />
        ),
      }}
      telegraph={{
        open: telegraph,
        onOpenChange: (open) => {
          keyer.reset();
          if (open) setSweep((s) => s + 1);
          setTelegraph(open);
        },
        // Lo último del mensaje, para ver la palabra mientras se teclea en el árbol
        top: (
          <div className="telegraph-msg">
            {text ? (text.length > 22 ? "…" + text.slice(-21) : text) : <span>{tr.messageLabel}</span>}
            <i aria-hidden className="telegraph-caret" />
          </div>
        ),
      }}
    >
      <FieldLabel htmlFor="message">{tr.messageLabel}</FieldLabel>
      <div className="translate-input">
        <textarea
          ref={messageRef}
          id="message"
          value={text}
          rows={3}
          maxLength={MAX_LEN}
          placeholder={tr.placeholder}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setPadOpen(false)}
          onKeyDown={(e) => {
            // El morse no tiene saltos de línea: Enter reproduce el mensaje.
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (morse) togglePlay();
            }
          }}
          className="station-message"
        />
        {/* Celular: borrar todo va dentro del cuadro */}
        {text && (
          <button type="button" className="translate-clear" aria-label={tr.clear} onClick={clear}>
            <X aria-hidden />
          </button>
        )}
      </div>
      <div className="station-input-meta">
        <span>{t.station.editorHint}</span>
        <span>{text.length} / {MAX_LEN}</span>
        {/* Celular: abre el teclado morse en lugar del teclado */}
        <button type="button" className="translate-key-btn" onClick={openPad}>
          <span><Radio aria-hidden /></span>
          {t.station.pad.open}
        </button>
      </div>

      <div className="translate-morse-head mt-6 mb-2 flex items-center justify-between gap-3">
        <span className="text-[15px] font-semibold">{tr.morseLabel}</span>
        <span className="translate-wide">
          <Tooltip label={t.tips.copy} disabledLabel={whyNoMorse}>
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
          </Tooltip>
        </span>
      </div>
      {/* Celular: la señal va aquí, dentro de la tarjeta */}
      <div className="translate-signal">
        <SignalMonitor morse={morse} wpm={SPEEDS[speed]} active={player.playing} />
      </div>
      <div ref={outputRef} className="station-morse-output">
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

      <div className="translate-actions mt-5 flex flex-wrap gap-2.5">
        <Tooltip label={msgPlaying ? t.tips.stop : t.tips.play} disabledLabel={whyNoMorse}>
          <Button variant="primary" onClick={togglePlay} disabled={!morse}>
            {msgPlaying ? <Square /> : <Play />}
            {msgPlaying ? tr.stop : tr.play}
          </Button>
        </Tooltip>
        <span className="translate-wide">
          <Tooltip label={t.tips.clear} disabledLabel={t.tips.nothingToClear}>
            <Button onClick={clear} disabled={!text}>
              <Eraser />
              {tr.clear}
            </Button>
          </Tooltip>
        </span>
        {/* Celular: Copiar y la velocidad, en la misma fila que Reproducir */}
        <Button className="translate-phone translate-copy" onClick={copy} disabled={!morse} aria-label={tr.copyAria}>
          {copied ? <Check /> : <Copy />}
          {copied ? tr.copied : tr.copy}
        </Button>
        <label className="translate-phone translate-speed-pick">
          <span className="sr-only">{tr.speed}</span>
          <select value={speed} onChange={(e) => setSpeed(e.target.value as Speed)}>
            {(Object.keys(SPEEDS) as Speed[]).map((s) => (
              <option key={s} value={s}>
                {tr.speeds[s]}
              </option>
            ))}
          </select>
          <ChevronDown aria-hidden />
        </label>
      </div>

      <div className="translate-speed mt-8 max-w-[380px]">
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
