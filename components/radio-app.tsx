"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Dices, RotateCcw, Send, Volume2 } from "lucide-react";

import { randomCallsign } from "@/lib/callsign";
import { isOnControl, isTyping } from "@/lib/dom";
import { REV, encode, normalize } from "@/lib/morse";
import { useI18n } from "@/lib/i18n/context";
import type { Locale } from "@/lib/i18n/config";
import { useKeyer } from "@/lib/use-keyer";
import { useMorsePlayer } from "@/lib/use-morse-player";
import { Board, StatusLed } from "@/components/device/board";
import { HandKey } from "@/components/device/hand-key";
import { KeyButton } from "@/components/device/key-button";
import { MorseTree } from "@/components/device/morse-tree";
import { DeviceLayout, FieldLabel, type DeviceView } from "@/components/device-layout";
import { MorseGlyphs } from "@/components/morse-glyphs";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { Tooltip } from "@/components/ui/tooltip";
import { OnAirIcon } from "@/components/on-air-icon";

type Msg = {
  id: string;
  channel: number;
  from: string;
  user: string;
  morse: string;
  text: string;
  wpm?: number;
  /** Transmisión en directo a la que pertenece (sus letras llegan sueltas). */
  tx?: string;
  ts: number;
};

type TxMode = "direct" | "button";

type Presence = { count: number; users: { id: string; user: string }[] };

const CHANNELS = [1, 2, 3, 4, 5, 6];
const FEED_MAX = 20;
const SEND_WPM = 13;
const MAX_LEN = 120;
const CALLSIGN_KEY = "morseo:callsign";
const TX_MODE_KEY = "morseo:txmode";
// En directo, una pausa más larga que esto cierra la transmisión: la siguiente
// letra abre una entrada nueva en la lista.
const TX_IDLE_MS = 3000;
const LED_DOT = { "--led": "var(--dot)" } as CSSProperties;
const LED_DASH = { "--led": "var(--dash)" } as CSSProperties;

/**
 * Suma un mensaje a la lista. Una letra en directo se agrega a la entrada de
 * su transmisión («S» → «SO» → «SOS»); lo demás entra arriba como nuevo.
 */
function mergeMsg(list: Msg[], msg: Msg): Msg[] {
  if (msg.tx) {
    const i = list.findIndex((x) => x.tx === msg.tx);
    if (i >= 0) {
      const cur = list[i];
      const next = { ...cur, morse: `${cur.morse} ${msg.morse}`.trim(), text: cur.text + msg.text };
      return list.map((x, j) => (j === i ? next : x));
    }
  }
  return [msg, ...list.filter((x) => x.id !== msg.id)].slice(0, FEED_MAX);
}

function fmtTime(ts: number, locale: Locale): string {
  try {
    return new Date(ts).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

// randomUUID solo existe en contextos seguros (https o localhost); desde otra
// máquina de la red local se entra por http, así que hace falta un respaldo.
function newId(): string {
  return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

const inputClass =
  "h-11 min-w-0 flex-1 rounded-full border border-transparent bg-surface px-4 text-[17px] placeholder:text-muted/80 focus:border-text/40 focus:outline-none disabled:opacity-45";

/**
 * Telégrafo en vivo: al entrar ya estás escuchando el canal. Se transmite
 * escribiendo o con la tecla; lo que llega suena en orden y se ve pasar por el
 * árbol del aparato.
 */
export default function RadioApp() {
  const { t, locale } = useI18n();
  const r = t.radio;
  const player = useMorsePlayer();
  const { play } = player;

  const [clientId, setClientId] = useState<string | null>(null);
  const [callsignInput, setCallsignInput] = useState("");
  const [callsign, setCallsign] = useState("");
  const [channel, setChannel] = useState(1);
  const [view, setView] = useState<DeviceView>("key");
  const [link, setLink] = useState<"tuning" | "open" | "lost">("tuning");
  const [presence, setPresence] = useState<Presence>({ count: 0, users: [] });
  const [messages, setMessages] = useState<Msg[]>([]);
  const [queue, setQueue] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [txMode, setTxMode] = useState<TxMode>("direct");
  // Lo que llevas transmitido en directo (se borra tras la pausa de cierre).
  const [liveText, setLiveText] = useState("");
  // Onda de luces en el árbol cada vez que se pasa a él.
  const [sweep, setSweep] = useState(0);
  // ¿El mensaje se armó con la tecla? Entonces ya lo oíste al teclearlo.
  const keyedRef = useRef(false);
  // Transmisión en directo en curso: su id, cuándo salió la última letra y si
  // la próxima empieza palabra.
  const txRef = useRef<{ id: string; last: number; space: boolean } | null>(null);
  // Última transmisión que sonó, para encadenar sus letras sin pausa extra.
  const lastTxRef = useRef<string | null>(null);

  const keyer = useKeyer({
    player,
    onLetter: (letter, code) => {
      if (!letter) return;
      if (txMode === "direct") {
        sendLetter(letter, code);
        return;
      }
      keyedRef.current = true;
      setText((v) => (v + letter).slice(0, MAX_LEN));
    },
    onWordGap: () => {
      if (txMode === "direct") {
        if (txRef.current) txRef.current.space = true;
        return;
      }
      setText((v) => (v && !v.endsWith(" ") ? v + " " : v));
    },
  });

  // La forma de transmitir se recuerda entre visitas.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(TX_MODE_KEY);
      if (saved === "direct" || saved === "button") setTxMode(saved);
    } catch {
      /* sin almacenamiento: directo */
    }
  }, []);

  function changeTxMode(mode: TxMode) {
    keyer.reset();
    setTxMode(mode);
    try {
      localStorage.setItem(TX_MODE_KEY, mode);
    } catch {
      /* sin almacenamiento */
    }
  }

  // Identidad: un id por pestaña y un indicativo recordado entre visitas.
  useEffect(() => {
    setClientId(newId());
    let c: string | null = null;
    try {
      c = localStorage.getItem(CALLSIGN_KEY);
    } catch {
      /* sin almacenamiento: indicativo nuevo en cada visita */
    }
    if (!c) c = randomCallsign();
    setCallsignInput(c);
    setCallsign(c);
  }, []);

  // El indicativo se aplica al dejar de escribir, no con cada tecla (cambiarlo
  // reconecta al canal).
  useEffect(() => {
    const v = callsignInput.trim();
    if (!v || v === callsign) return;
    const tm = setTimeout(() => setCallsign(v), 700);
    return () => clearTimeout(tm);
  }, [callsignInput, callsign]);

  useEffect(() => {
    if (!callsign) return;
    try {
      localStorage.setItem(CALLSIGN_KEY, callsign);
    } catch {
      /* sin almacenamiento */
    }
  }, [callsign]);

  // Conexión al canal (SSE): historial reciente, presencia y mensajes en vivo.
  useEffect(() => {
    setLink("tuning");
    setPresence({ count: 0, users: [] });
    setMessages([]);
    setQueue([]);
    txRef.current = null;
    setLiveText("");
    if (!clientId || !callsign) return;
    const es = new EventSource(
      `/api/broadcast/stream?band=morse&channel=${channel}&user=${encodeURIComponent(
        callsign
      )}&id=${clientId}`
    );
    es.onopen = () => setLink("open");
    es.onmessage = (e) => {
      let d: {
        type?: string;
        messages?: Msg[];
        message?: Msg;
        count?: number;
        users?: { id: string; user: string }[];
      };
      try {
        d = JSON.parse(e.data);
      } catch {
        return;
      }
      if (d.type === "hello") {
        setLink("open");
      } else if (d.type === "presence") {
        setPresence({ count: d.count ?? 0, users: d.users ?? [] });
      } else if (d.type === "history" && Array.isArray(d.messages)) {
        setMessages(d.messages.slice(-FEED_MAX).reverse());
      } else if (d.type === "message" && d.message) {
        const msg = d.message;
        setMessages((m) => mergeMsg(m, msg));
        // Lo propio ya sonó al teclearlo o al enviarlo.
        if (msg.from !== clientId) setQueue((q) => [...q, msg].slice(-40));
      }
    };
    es.onerror = () => setLink("lost");
    return () => es.close();
  }, [clientId, callsign, channel]);

  // Lo que llega suena en orden, cuando no estás tecleando. Las letras de una
  // transmisión en directo van seguidas, separadas por el silencio entre
  // letras del emisor (el de palabra ya viene en la letra); un mensaje nuevo
  // espera medio segundo.
  useEffect(() => {
    if (player.playing || keyer.pressed || keyer.seq || queue.length === 0) return;
    const [next, ...rest] = queue;
    const chained = !!next.tx && next.tx === lastTxRef.current;
    const unitMs = 1200 / (next.wpm || SEND_WPM);
    const delay = !chained ? 500 : next.morse.trim().startsWith("/") ? 0 : 3 * unitMs;
    const tm = setTimeout(() => {
      setQueue(rest);
      lastTxRef.current = next.tx ?? null;
      play(next.morse, { id: next.tx ?? next.id, wpm: next.wpm });
    }, delay);
    return () => clearTimeout(tm);
  }, [player.playing, keyer.pressed, keyer.seq, queue, play]);

  // La línea «Transmitiendo» se apaga cuando la transmisión se cierra.
  useEffect(() => {
    if (!liveText) return;
    const tm = setTimeout(() => setLiveText(""), TX_IDLE_MS);
    return () => clearTimeout(tm);
  }, [liveText]);

  function post(body: Record<string, unknown>) {
    return fetch("/api/broadcast/send", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        band: "morse",
        channel,
        user: callsign,
        from: clientId,
        kind: "morse",
        ...body,
      }),
    }).catch(() => {
      /* sin conexión: el aviso de «sin conexión» ya lo indica */
    });
  }

  /** En directo: la letra recién tecleada sale ya al canal. */
  function sendLetter(letter: string, code: string) {
    if (!clientId) return;
    const now = Date.now();
    let tx = txRef.current;
    if (!tx || now - tx.last > TX_IDLE_MS) {
      tx = { id: newId(), last: now, space: false };
      setLiveText("");
    }
    const space = tx.space;
    tx.last = now;
    tx.space = false;
    txRef.current = tx;
    setLiveText((v) => (space ? v + " " : v) + letter);
    post({
      tx: tx.id,
      // Una letra que empieza palabra lleva antes el silencio de palabra.
      morse: (space ? "/ " : "") + code,
      text: (space ? " " : "") + letter,
      wpm: Math.min(26, Math.max(5, keyer.wpm())),
    });
  }

  async function transmit() {
    const clean = normalize(text).toUpperCase().trim();
    const morse = encode(clean);
    if (!morse || !clientId) return;
    const keyed = keyedRef.current;
    const wpm = keyed ? Math.min(26, Math.max(5, keyer.wpm())) : SEND_WPM;
    keyedRef.current = false;
    setText("");
    // Lo escrito se oye al salir; lo tecleado ya sonó mientras lo armabas.
    if (!keyed) play(morse, { id: "tx", wpm });
    await post({ morse, text: clean, wpm });
  }

  // Enter fuera de los campos transmite lo que armaste con la tecla.
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || isTyping() || isOnControl()) return;
      if (txMode !== "button" || !text.trim()) return;
      e.preventDefault();
      transmit();
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  });

  const rxPlaying =
    player.playing && player.playingId !== "tx" && player.playingId !== "letter";
  const txActive = keyer.pressed || player.playingId === "tx";
  const keying = keyer.seq + (keyer.pending ?? "");
  const liveCode = player.playing ? player.prefix : keying || keyer.held || player.linger;
  const liveLetter =
    player.playing && player.prefix !== player.letterCode ? undefined : REV[liveCode];
  const others = presence.users.filter((u) => u.id !== clientId);
  const connected = link === "open";

  const board = (
    <Board>
      <div className="flex items-center gap-5 px-1">
        <StatusLed label={t.device.pwr} on={connected} tip={t.tips.pwr} />
        <StatusLed label={t.device.rx} on={rxPlaying} tip={t.tips.rx} />
      </div>
      <MorseTree
        className="mt-3"
        code={player.playing ? player.prefix : keyer.seq || keyer.held || player.linger}
        pending={player.playing ? null : keyer.pending}
        sweep={sweep}
        onPick={(n) => play(n.code, { id: "letter" })}
        words={t.device.words}
        ariaLabel={t.device.treeAria}
        nodeLabel={(n) => t.device.nodeLabel(n.letter, n.code)}
      />
      <div className="mt-4">
        <KeyButton
          keyer={keyer}
          txOn={txActive}
          code={liveCode}
          letter={liveLetter}
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
    <DeviceLayout mode="radio" title={r.title} lead={r.lead} board={board}
      hand={
        <HandKey
          keyer={keyer}
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
    >
      <div className="flex min-h-11 flex-wrap items-center gap-x-4 gap-y-2">
        <p className="flex items-center gap-2.5 text-[15px]" aria-live="polite">
          <OnAirIcon state={link} />
          <span className="font-semibold">
            {link === "open" ? r.listening : link === "tuning" ? r.tuning : r.offline}
          </span>
          {connected && <span className="text-muted">{r.presence(presence.count)}</span>}
        </p>
        {/* El navegador calla el audio hasta un toque: lo que llega ya pasa por
            la lista y el árbol, y con este toque (o cualquier otro) se oye. */}
        {player.audio.blocked && (
          <Tooltip label={t.tips.soundBlocked}>
            <Button variant="primary" size="sm" onClick={player.audio.unlock}>
              <Volume2 />
              {r.soundBlocked}
            </Button>
          </Tooltip>
        )}
      </div>
      {connected && others.length > 0 && (
        <p className="mt-2 text-[15px] text-muted">
          {others.map((u) => u.user || r.operator).join(", ")}
        </p>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <FieldLabel>{r.channelLabel}</FieldLabel>
          <Segmented
            value={channel}
            onChange={setChannel}
            ariaLabel={r.channelLabel}
            options={CHANNELS.map((n) => ({
              value: n,
              label: String(n),
              title: r.channels[n - 1],
            }))}
          />
          <p className="mt-2 text-[15px] text-muted">{r.channels[channel - 1]}</p>
        </div>
        <div>
          <FieldLabel htmlFor="callsign">{r.callsignLabel}</FieldLabel>
          <div className="flex gap-2">
            <input
              id="callsign"
              value={callsignInput}
              maxLength={24}
              autoComplete="off"
              spellCheck={false}
              onChange={(e) => setCallsignInput(e.target.value)}
              className={inputClass}
            />
            <Tooltip label={t.tips.newCallsign}>
              <Button
                size="icon"
                className="size-11"
                aria-label={r.newCallsign}
                onClick={() => setCallsignInput(randomCallsign())}
              >
                <Dices />
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <FieldLabel>{r.modeLabel}</FieldLabel>
        <Segmented
          value={txMode}
          onChange={changeTxMode}
          ariaLabel={r.modeLabel}
          className="max-w-[320px]"
          options={(["direct", "button"] as const).map((m) => ({
            value: m,
            label: r.modes[m],
            title: r.modeTitles[m],
          }))}
        />
        <p className="mt-2 max-w-[52ch] text-[15px] leading-snug text-muted">{r.modeHelp[txMode]}</p>
        {txMode === "direct" && liveText && (
          <p className="mt-3 flex items-center gap-2.5 text-[15px]" aria-live="polite">
            <span aria-hidden className="led-sm" data-on style={LED_DASH} />
            <span className="text-muted">{r.sending}</span>
            <span className="font-semibold tracking-[.05em] break-all uppercase">{liveText}</span>
          </p>
        )}
      </div>

      <div className="mt-6">
        <FieldLabel htmlFor="radio-message">{r.messageLabel}</FieldLabel>
        <div className="flex gap-2">
          <input
            id="radio-message"
            value={text}
            maxLength={MAX_LEN}
            autoComplete="off"
            placeholder={txMode === "direct" ? r.placeholderDirect : r.placeholder}
            onChange={(e) => {
              // Si lo reescribes a mano, ya no es un mensaje hecho con la tecla.
              keyedRef.current = false;
              setText(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                transmit();
              }
            }}
            className={inputClass}
          />
          <Tooltip label={t.tips.transmit} disabledLabel={text.trim() ? t.tips.noMorse : t.tips.needMessage}>
            <Button variant="primary" onClick={transmit} disabled={!encode(text)}>
              <Send />
              {r.send}
            </Button>
          </Tooltip>
        </div>
      </div>

      <section className="mt-9">
        <h2 className="text-[15px] font-semibold">{r.feedLabel}</h2>
        {messages.length === 0 ? (
          <p className="mt-2 max-w-[48ch] text-[15px] leading-snug text-muted">{r.feedEmpty}</p>
        ) : (
          <ul className="mt-1 max-h-[360px] divide-y divide-line overflow-y-auto pr-1">
            {messages.map((m) => {
              const mine = m.from === clientId;
              const playingThis = player.playingId === (m.tx ?? m.id);
              return (
                <li key={m.id} className="flex items-start gap-3 py-3">
                  <span aria-hidden className="led-sm mt-[7px] shrink-0" data-on={playingThis} style={LED_DOT} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2 text-[15px]">
                      <span className="truncate font-semibold">{m.user || r.operator}</span>
                      {mine && <span className="shrink-0 text-muted">({r.you})</span>}
                      <span className="ml-auto shrink-0 text-sm text-muted tabular-nums">
                        {fmtTime(m.ts, locale)}
                      </span>
                    </div>
                    {m.text && (
                      <p className="mt-0.5 text-[18px] font-semibold tracking-[.05em] break-words uppercase">
                        {m.text}
                      </p>
                    )}
                    <MorseGlyphs
                      morse={m.morse}
                      size={6}
                      tone="led"
                      className="mt-2"
                      active={playingThis && !m.tx ? player.letterIdx : null}
                    />
                  </div>
                  <Tooltip label={t.tips.replayMessage}>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={r.replay}
                      onClick={() => play(m.morse, { id: m.id, wpm: m.wpm })}
                    >
                      <RotateCcw />
                    </Button>
                  </Tooltip>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <p className="mt-9 max-w-[56ch] text-sm leading-snug text-muted">{r.serverNote}</p>
    </DeviceLayout>
  );
}
