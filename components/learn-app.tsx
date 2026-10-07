"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Check, Play, Radio, RotateCcw, SkipForward, Volume2, X } from "lucide-react";

import { isOnControl, isTyping } from "@/lib/dom";
import { MORSE, REV } from "@/lib/morse";
import { learnGroups, mnemonics, sung } from "@/lib/morse-learn";
import { TREE_LETTERS } from "@/lib/morse-tree";
import { useI18n } from "@/lib/i18n/context";
import { useBootSweep } from "@/lib/use-boot-sweep";
import { useKeyer } from "@/lib/use-keyer";
import { useIsMobile } from "@/lib/use-media";
import { useMorsePlayer } from "@/lib/use-morse-player";
import { Board } from "@/components/device/board";
import { KeyButton } from "@/components/device/key-button";
import { MorseTree } from "@/components/device/morse-tree";
import { DeviceLayout } from "@/components/device-layout";
import { MorseGlyphs } from "@/components/morse-glyphs";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";

type Phase = "idle" | "asking" | "right" | "wrong";
type Tab = "know" | "practice";

// Velocidad de los caracteres al practicar: rápida para que suene como ritmo
// (así se aprende de oído) y no como puntos sueltos que haya que contar.
const LEARN_WPM = 15;
// Un nivel queda dominado con 9 aciertos en los últimos 10 intentos.
const WINDOW = 10;
const TO_MASTER = 9;
// Lo que Morseo recuerda entre visitas: el nivel, sus últimos intentos y qué
// niveles ya se conocieron.
const STORE_KEY = "morseo:learn";

type Saved = { level: number; hist: Record<number, number[]>; known: Record<number, boolean> };

function loadSaved(): Saved | null {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY) ?? "null");
    if (typeof s?.level !== "number") return null;
    return { level: s.level, hist: s.hist ?? {}, known: s.known ?? {} };
  } catch {
    return null;
  }
}

/** Aciertos de una lista de intentos (1 = acierto). */
const sum = (r: number[]) => r.reduce((a, b) => a + b, 0);
const isMastered = (r: number[]) => r.length >= WINDOW && sum(r) >= TO_MASTER;

/** El truco sin el ritmo que lo acompaña: de «NO-ta» — dah-dit. queda «NO-ta». */
const phrase = (tip: string) => tip.split(" — ")[0];

/**
 * Aprender por niveles, en dos pasos. «Conoce»: las letras nuevas del nivel,
 * cada una con su sonido, su ritmo cantado y su camino en el árbol. «Practica»:
 * suena una letra y se elige entre los botones de las letras del nivel (o con
 * el teclado). Al fallar se marcan las dos y se pueden oír seguidas. Con 9 de
 * los últimos 10 el nivel queda dominado y se invita al siguiente.
 *
 * El árbol es la pizarra: enseña el camino de cada letra, nunca es donde se
 * responde (tocarlo solo hace sonar esa letra).
 */
export default function LearnApp({ about }: { about?: ReactNode }) {
  const { t, locale } = useI18n();
  const l = t.learn;
  const player = useMorsePlayer();
  const { setSpeed: setAudioSpeed } = player.audio;
  const boot = useBootSweep();
  const isMobile = useIsMobile();

  // Los niveles son los grupos del orden de aprendizaje (solo letras del árbol).
  const groups = useMemo(
    () =>
      learnGroups(locale)
        .slice(0, 4)
        .map((g) => ({ ...g, chars: g.chars.filter((c) => TREE_LETTERS.has(c)) })),
    [locale]
  );
  const tips = useMemo(
    () => new Map(mnemonics(locale).map((m) => [m.letter, m.tip])),
    [locale]
  );

  const [level, setLevel] = useState(1);
  const [tab, setTab] = useState<Tab>("know");
  const [hist, setHist] = useState<Record<number, number[]>>({});
  const [known, setKnown] = useState<Record<number, boolean>>({});
  const [ready, setReady] = useState(false);
  const [target, setTarget] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [picked, setPicked] = useState<string | null>(null);
  // Conoce: la letra que se tocó; su camino queda encendido en el árbol.
  const [focus, setFocus] = useState<string | null>(null);
  // Celular: el árbol a pantalla completa (ver por qué, o responder con la tecla).
  const [telegraph, setTelegraph] = useState(false);
  const nextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const levelsRef = useRef<HTMLDivElement>(null);

  // Al volver, sigue donde ibas: en Practica si ya conociste ese nivel.
  useEffect(() => {
    const s = loadSaved();
    if (s) {
      const lv = Math.min(Math.max(1, s.level), 4);
      setLevel(lv);
      setHist(s.hist);
      setKnown(s.known);
      setTab(s.known[lv] ? "practice" : "know");
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ level, hist, known }));
    } catch {
      /* sin almacenamiento: se empieza de cero en cada visita */
    }
  }, [ready, level, hist, known]);

  // Se practica con todo lo aprendido hasta el nivel; las letras nuevas, las del nivel.
  const pool = useMemo(() => groups.slice(0, level).flatMap((g) => g.chars), [groups, level]);
  const fresh = groups[level - 1]?.chars ?? [];
  const results = hist[level] ?? [];
  const hits = sum(results);
  const mastered = isMastered(results);
  const nextLevel = level < groups.length ? level + 1 : null;

  const keyer = useKeyer({
    player,
    onLetter: (letter) => {
      if (phase === "asking") answer(letter);
    },
  });

  useEffect(() => {
    setAudioSpeed(LEARN_WPM);
  }, [setAudioSpeed]);

  // En el celular la fila de niveles se desliza: que el elegido quede a la vista.
  useEffect(() => {
    const row = levelsRef.current;
    const chip = row?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!row || !chip || row.scrollWidth <= row.clientWidth) return;
    row.scrollTo({ left: chip.offsetLeft - 20 });
  }, [level, ready]);

  useEffect(
    () => () => {
      if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
    },
    []
  );

  function clearNext() {
    if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
    nextTimerRef.current = null;
  }

  /** Deja el ejercicio en reposo (al cambiar de nivel o de paso). */
  function rest() {
    clearNext();
    player.stop();
    keyer.reset();
    setTarget(null);
    setPhase("idle");
    setPicked(null);
  }

  function ask() {
    clearNext();
    // Desde el nivel 2, la mitad de las veces suena una letra nueva del nivel.
    const bag = level > 1 && Math.random() < 0.5 ? fresh : pool;
    const options = bag.filter((c) => c !== target);
    const next = options[Math.floor(Math.random() * options.length)] ?? pool[0];
    setTab("practice");
    setTarget(next);
    setPhase("asking");
    setPicked(null);
    keyer.reset();
    player.play(MORSE[next], { id: "target" });
  }

  // Referencia a la versión más reciente de ask(), para el avance automático.
  const askRef = useRef(ask);
  useEffect(() => {
    askRef.current = ask;
  });

  function replay() {
    if (!target) return;
    clearNext();
    // Antes de responder no se revela nada; después, suena con su camino.
    player.play(MORSE[target], { id: phase === "asking" ? "target" : "reveal" });
  }

  function answer(letter: string | null) {
    if (phase !== "asking" || !target) return;
    const ok = letter === target;
    const after = [...results, ok ? 1 : 0].slice(-WINDOW);
    // Si este acierto completa el dominio, no sigue sola: que se vea el logro.
    const justMastered = !mastered && isMastered(after);
    setPhase(ok ? "right" : "wrong");
    setPicked(letter);
    setHist((h) => ({ ...h, [level]: after }));
    keyer.reset();
    player.play(MORSE[target], {
      id: "reveal",
      onEnd:
        ok && !justMastered
          ? () => {
              nextTimerRef.current = setTimeout(() => askRef.current(), 700);
            }
          : undefined,
    });
  }

  /** Suena una letra con su camino en el árbol, para conocerla o compararla. */
  function hear(letter: string) {
    clearNext();
    setFocus(letter);
    player.play(MORSE[letter], { id: "letter" });
  }

  // Al fallar: primero la que sonó y después la que elegiste.
  function hearBoth() {
    if (!target || !picked || picked === target || !MORSE[picked]) return;
    clearNext();
    player.play(`${MORSE[target]} / ${MORSE[picked]}`, { id: "compare" });
  }

  // Las letras nuevas del nivel seguidas, con un silencio de palabra entre ellas.
  function hearFresh() {
    clearNext();
    player.play(fresh.map((c) => MORSE[c]).join(" / "), { id: "intro" });
  }

  function changeLevel(n: number) {
    rest();
    setFocus(null);
    setLevel(n);
    setTab(known[n] ? "practice" : "know");
  }

  function switchTab(next: Tab) {
    if (next === tab) return;
    rest();
    setTab(next);
  }

  function startPractice() {
    setKnown((k) => ({ ...k, [level]: true }));
    rest();
    ask();
  }

  // Teclado: una letra del nivel responde; Enter avanza (o repite el sonido).
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || isTyping()) return;
      if (e.key === "Enter") {
        if (isOnControl()) return;
        e.preventDefault();
        if (tab === "know") startPractice();
        else if (phase === "asking") replay();
        else ask();
        return;
      }
      const c = e.key.toUpperCase();
      if (tab === "practice" && phase === "asking" && pool.includes(c)) {
        e.preventDefault();
        answer(c);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  });

  // El árbol: mientras se pregunta no delata la letra; muestra lo que suena
  // fuera del ejercicio, el camino correcto al responder y, en Conoce, la letra
  // que se tocó. La que elegiste mal queda rodeada en rojo.
  const answered = phase === "right" || phase === "wrong";
  const showPlayback = player.playing && player.playingId !== "target";
  const keying = keyer.seq + (keyer.pending ?? "");
  let treeCode = keyer.seq || keyer.held;
  if (showPlayback) treeCode = player.prefix;
  else if (answered && target && !player.playing) treeCode = MORSE[target];
  else if (!treeCode && phase !== "asking")
    treeCode = player.linger || (tab === "know" && focus ? MORSE[focus] : "");
  const mark =
    phase === "wrong" && picked && picked !== target && !showPlayback ? MORSE[picked] : undefined;
  const liveCode = showPlayback ? player.prefix : keying || keyer.held;
  const liveLetter =
    showPlayback && player.prefix !== player.letterCode ? undefined : REV[liveCode];

  const tip = target ? tips.get(target) : undefined;
  const verdict =
    phase === "right" ? l.right(target ?? "") : picked ? l.wrong(target ?? "", picked) : l.wrongUnknown(target ?? "");

  const board = (
    <Board>
      <MorseTree
        code={treeCode}
        pending={player.playing ? null : keyer.pending}
        sweep={boot}
        onPick={(n) => hear(n.letter)}
        mark={mark}
        compact={isMobile}
        words={t.device.words}
        ariaLabel={t.device.treeAria}
        nodeLabel={(n) => t.device.nodeLabel(n.letter, n.code)}
      />
      <div className="mt-4">
        <KeyButton
          keyer={keyer}
          code={liveCode || (answered && target ? MORSE[target] : "")}
          letter={liveCode ? liveLetter : undefined}
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

  // El paso siguiente del ejercicio: escuchar, oír de nuevo, pasar a la
  // siguiente o, con el nivel dominado, ir al próximo.
  const step =
    phase === "asking"
      ? { icon: <RotateCcw />, label: l.replay, tip: t.tips.replay, run: replay }
      : phase === "idle"
        ? { icon: <Play />, label: l.start, tip: t.tips.start, run: ask }
        : mastered && nextLevel
          ? { icon: <SkipForward />, label: l.goNext(nextLevel), tip: undefined, run: () => changeLevel(nextLevel) }
          : { icon: <SkipForward />, label: l.next, tip: t.tips.next, run: ask };

  // Los últimos intentos del nivel como luces: lima si acertaste, roja si no.
  const lights = (
    <div className="learn-progress">
      <span aria-hidden className="learn-leds">
        {Array.from({ length: WINDOW }, (_, i) => (
          <i key={i} data-r={results[i] === 1 ? "y" : results[i] === 0 ? "n" : undefined} />
        ))}
      </span>
      <span>
        {mastered ? (
          <>
            <b>{l.mastered(level)}</b>
            {nextLevel && (
              <button type="button" className="learn-go-next" onClick={() => changeLevel(nextLevel)}>
                {l.goNext(nextLevel)}
              </button>
            )}
          </>
        ) : (
          <>
            {results.length > 0 && <b>{l.progress(hits, results.length, WINDOW)}. </b>}
            <span className="learn-goal">{l.goal(nextLevel, TO_MASTER, WINDOW)}</span>
          </>
        )}
      </span>
    </div>
  );

  // La rejilla de respuestas crece con el nivel: 6, 12, 18 y 26 letras.
  const n = pool.length;
  // En el celular, con las 26 letras, 9 por fila como el teclado del celular.
  const colsM = n <= 6 ? 3 : n <= 12 ? 4 : n <= 18 ? 6 : 9;
  const gridVars = {
    "--cols-d": n <= 12 ? 6 : 9,
    "--h-d": n <= 6 ? "76px" : n <= 12 ? "64px" : "54px",
    "--cols-m": colsM,
    "--rows-m": Math.ceil(n / colsM),
  } as CSSProperties;

  const know = (
    <div role="tabpanel" id="learn-know" aria-labelledby="learn-tab-know" className="learn-know">
      <p className="learn-intro">
        <b>{level} · {l.levelNames[level - 1]}.</b>{" "}
        <span className="learn-note">{groups[level - 1]?.note}</span>
        <span className="learn-note-short">{l.knowHint}</span>
      </p>
      <div className="learn-cards">
        {fresh.map((c, i) => {
          const on = player.playingId === "intro" ? player.letterIdx === i : focus === c;
          const cardTip = tips.get(c);
          return (
            <button
              key={c}
              type="button"
              className="learn-card"
              data-on={on || undefined}
              aria-label={l.playLetter(c)}
              onClick={() => hear(c)}
            >
              <b>{c}</b>
              <MorseGlyphs morse={MORSE[c]} size={8} />
              <span className="learn-sung">{sung(MORSE[c])}</span>
              {cardTip && <span className="learn-tip">{phrase(cardTip)}</span>}
              <span aria-hidden className="learn-card-play"><Play /></span>
            </button>
          );
        })}
      </div>
      <div className="learn-actions">
        <Button variant="primary" onClick={startPractice}>
          {l.practiceThese(fresh.length)}
          <SkipForward />
        </Button>
        <Button onClick={hearFresh}>
          <Volume2 />
          {l.hearAll(fresh.length)}
        </Button>
      </div>
    </div>
  );

  const practice = (
    <div role="tabpanel" id="learn-practice" aria-labelledby="learn-tab-practice" className="learn-practice">
      <div className="learn-ask" data-state={phase}>
        <Tooltip label={phase === "idle" ? t.tips.start : t.tips.replay}>
          <button
            type="button"
            className="learn-sound"
            aria-label={phase === "idle" ? l.start : l.replay}
            onClick={phase === "idle" ? ask : replay}
          >
            {phase === "idle" ? <Play aria-hidden /> : <RotateCcw aria-hidden />}
          </button>
        </Tooltip>
        <div className="learn-ask-body" aria-live="polite">
          <p className="learn-ask-title">
            {phase === "right" && <Check aria-hidden />}
            {phase === "wrong" && <X aria-hidden />}
            {answered ? verdict : phase === "asking" ? l.ask : l.ready}
          </p>
          {phase === "asking" && (
            <p className="learn-ask-hint">
              <span className="[@media(pointer:coarse)]:hidden">{l.answerHint}</span>
              <span className="hidden [@media(pointer:coarse)]:inline">{l.answerHintTouch}</span>
            </p>
          )}
          {answered && target && (
            <div className="learn-compare">
              <span>
                <MorseGlyphs morse={MORSE[target]} size={7} />
                <b>{target}</b>
                <span className="learn-sung-inline">{sung(MORSE[target])}</span>
              </span>
              {phase === "wrong" && picked && MORSE[picked] && (
                <>
                  <span className="learn-picked">
                    <MorseGlyphs morse={MORSE[picked]} size={7} />
                    <b>{picked}</b>
                    <span className="learn-sung-inline">{sung(MORSE[picked])}</span>
                  </span>
                  <button type="button" className="learn-both" onClick={hearBoth}>
                    <Volume2 aria-hidden />
                    {l.hearBoth}
                  </button>
                </>
              )}
            </div>
          )}
          {phase === "wrong" && (
            <p className="learn-ask-tip">
              {tip && (
                <>
                  <b>{l.trick}:</b> <span className="learn-tip-full">{tip}</span>
                  <span className="learn-tip-short">{phrase(tip)}.</span>{" "}
                </>
              )}
              <button type="button" className="learn-see-tree" onClick={() => setTelegraph(true)}>
                {l.seeTree}
              </button>
            </p>
          )}
          {mastered && answered && nextLevel && (
            <button type="button" className="learn-see-tree" onClick={ask}>
              {l.keepPracticing}
            </button>
          )}
          {lights}
        </div>
      </div>

      <div className="learn-answers" style={gridVars}>
        {pool.map((c) => {
          const state = answered ? (c === target ? "ok" : c === picked ? "bad" : undefined) : undefined;
          return (
            <button
              key={c}
              type="button"
              data-state={state}
              aria-label={phase === "asking" ? c : l.playLetter(c)}
              // Mientras pregunta, responde; si no, suena para comparar.
              onClick={() => (phase === "asking" ? answer(c) : hear(c))}
            >
              {c}
              {state === "bad" && <small>{l.you}</small>}
            </button>
          );
        })}
      </div>

      <div className="learn-actions">
        <Tooltip label={step.tip}>
          <Button variant={phase === "asking" ? "secondary" : "primary"} onClick={step.run}>
            {step.icon}
            {step.label}
          </Button>
        </Tooltip>
        {answered && (
          <Tooltip label={t.tips.replay}>
            <Button onClick={mastered && nextLevel ? ask : replay}>
              {mastered && nextLevel ? <SkipForward /> : <RotateCcw />}
              {mastered && nextLevel ? l.next : l.replay}
            </Button>
          </Tooltip>
        )}
      </div>
    </div>
  );

  // Celular: abajo, junto al pulgar, el paso siguiente y, a su lado, lo que lo acompaña.
  const mobileBar =
    tab === "know" ? (
      <div className="learn-bar">
        <Button variant="primary" className="learn-bar-main" onClick={startPractice}>
          {l.practice}
          <SkipForward />
        </Button>
        <Tooltip label={l.hearAll(fresh.length)}>
          <button type="button" className="station-round" aria-label={l.hearAll(fresh.length)} onClick={hearFresh}>
            <Volume2 aria-hidden />
          </button>
        </Tooltip>
      </div>
    ) : (
      <div className="learn-bar">
        <Button variant="primary" className="learn-bar-main" onClick={step.run}>
          {step.icon}
          {step.label}
        </Button>
        {phase === "asking" && (
          <Tooltip label={l.answerWithKey}>
            <button type="button" className="station-round" aria-label={l.answerWithKey} onClick={() => setTelegraph(true)}>
              <Radio aria-hidden />
            </button>
          </Tooltip>
        )}
        {answered && (
          <Tooltip label={t.tips.replay}>
            <button type="button" className="station-round" aria-label={l.replay} onClick={replay}>
              <RotateCcw aria-hidden />
            </button>
          </Tooltip>
        )}
      </div>
    );

  return (
    <DeviceLayout mode="learn" title={l.title} lead={l.lead} board={board} about={about}
      mobileBar={mobileBar}
      telegraph={{
        open: telegraph,
        onOpenChange: (open) => {
          keyer.reset();
          setTelegraph(open);
        },
        // Arriba la pregunta (o el resultado) y el paso siguiente
        top: (
          <div className="telegraph-learn">
            <div className="telegraph-msg telegraph-text">{answered && target ? verdict : l.ask}</div>
            <button type="button" className="telegraph-step" aria-label={step.label} onClick={step.run}>
              {step.icon}
            </button>
          </div>
        ),
      }}
    >
      <div className="learn-stage">
        <div ref={levelsRef} role="group" aria-label={l.levelLabel} className="learn-levels">
          {groups.map((g, i) => (
            <button
              key={g.title}
              type="button"
              aria-pressed={level === i + 1}
              onClick={() => changeLevel(i + 1)}
            >
              <span>
                {i + 1} · {l.levelNames[i]}
                {isMastered(hist[i + 1] ?? []) && <Check aria-hidden />}
              </span>
              <small>{g.chars.join(" ")}</small>
            </button>
          ))}
        </div>
        <div role="tablist" aria-label={l.stepsLabel} className="learn-tabs">
          <button
            type="button"
            role="tab"
            id="learn-tab-know"
            aria-controls="learn-know"
            aria-selected={tab === "know"}
            onClick={() => switchTab("know")}
          >
            <i aria-hidden>1</i>
            {l.tabs.know}
          </button>
          <button
            type="button"
            role="tab"
            id="learn-tab-practice"
            aria-controls="learn-practice"
            aria-selected={tab === "practice"}
            onClick={() => switchTab("practice")}
          >
            <i aria-hidden>2</i>
            {l.tabs.practice}
          </button>
        </div>
        {tab === "know" ? know : practice}
      </div>

      <section className="learn-guide mt-10 border-t border-line pt-6">
        <h2 className="text-[19px] font-bold">{l.guideTitle}</h2>
        <div className="mt-3 max-w-[56ch] space-y-2.5 text-[16px] leading-snug text-muted">
          {l.guide.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </section>
    </DeviceLayout>
  );
}
