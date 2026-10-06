"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Check, Play, Radio, RotateCcw, SkipForward, X } from "lucide-react";

import { isOnControl, isTyping } from "@/lib/dom";
import { MORSE, REV } from "@/lib/morse";
import { learnGroups, mnemonics } from "@/lib/morse-learn";
import { TREE_LETTERS } from "@/lib/morse-tree";
import { useI18n } from "@/lib/i18n/context";
import { useBootSweep } from "@/lib/use-boot-sweep";
import { useKeyer } from "@/lib/use-keyer";
import { useIsMobile } from "@/lib/use-media";
import { useMorsePlayer } from "@/lib/use-morse-player";
import { Board } from "@/components/device/board";
import { KeyButton } from "@/components/device/key-button";
import { MorseTree } from "@/components/device/morse-tree";
import { DeviceLayout, FieldLabel } from "@/components/device-layout";
import { MorseGlyphs } from "@/components/morse-glyphs";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { Tooltip } from "@/components/ui/tooltip";

type Phase = "idle" | "asking" | "right" | "wrong";

// Velocidad de los caracteres al practicar: rápida para que suene como ritmo
// (así se aprende de oído) y no como puntos sueltos que haya que contar.
const LEARN_WPM = 15;

/**
 * Práctica de escucha: suena una letra y se responde tocándola en el árbol,
 * oprimiéndola en el teclado o tecleándola. Al responder, el árbol enciende el
 * camino correcto mientras vuelve a sonar. Si acertaste, sigue sola.
 */
export default function LearnApp({ about }: { about?: ReactNode }) {
  const { t, locale } = useI18n();
  const l = t.learn;
  const player = useMorsePlayer();
  const { setSpeed: setAudioSpeed } = player.audio;
  const boot = useBootSweep();

  // Los niveles son los grupos del orden de aprendizaje (solo letras del árbol).
  const groups = useMemo(() => learnGroups(locale).slice(0, 4), [locale]);
  const tips = useMemo(
    () => new Map(mnemonics(locale).map((m) => [m.letter, m.tip])),
    [locale]
  );

  const [level, setLevel] = useState(1);
  const [target, setTarget] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState({ right: 0, total: 0, streak: 0 });
  // Celular: responder con la tecla abre el aparato a pantalla completa.
  const [telegraph, setTelegraph] = useState(false);
  const isMobile = useIsMobile();
  const nextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pool = useMemo(
    () =>
      groups
        .slice(0, level)
        .flatMap((g) => g.chars)
        .filter((c) => TREE_LETTERS.has(c)),
    [groups, level]
  );
  const newLetters = useMemo(
    () => new Set(groups[level - 1]?.chars ?? []),
    [groups, level]
  );

  const keyer = useKeyer({
    player,
    onLetter: (letter) => {
      if (phase === "asking") answer(letter);
    },
  });

  useEffect(() => {
    setAudioSpeed(LEARN_WPM);
  }, [setAudioSpeed]);

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

  function ask() {
    clearNext();
    const options = pool.filter((c) => c !== target);
    const next = options[Math.floor(Math.random() * options.length)] ?? pool[0];
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
    setPhase(ok ? "right" : "wrong");
    setPicked(letter);
    setScore((s) => ({
      right: s.right + (ok ? 1 : 0),
      total: s.total + 1,
      streak: ok ? s.streak + 1 : 0,
    }));
    keyer.reset();
    player.play(MORSE[target], {
      id: "reveal",
      onEnd: ok
        ? () => {
            nextTimerRef.current = setTimeout(() => askRef.current(), 700);
          }
        : undefined,
    });
  }

  function changeLevel(n: number) {
    clearNext();
    player.stop();
    keyer.reset();
    setLevel(n);
    setTarget(null);
    setPhase("idle");
    setPicked(null);
  }

  // Teclado: una letra responde; Enter pide la siguiente (o repite el sonido).
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || isTyping()) return;
      if (e.key === "Enter") {
        if (isOnControl()) return;
        e.preventDefault();
        if (phase === "asking") replay();
        else ask();
        return;
      }
      if (phase === "asking" && /^[a-z]$/i.test(e.key)) {
        e.preventDefault();
        answer(e.key.toUpperCase());
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  });

  // Mientras se pregunta, el árbol y el pulsador no delatan la letra que suena:
  // solo muestran lo que tú teclees. Al responder, se enciende su camino.
  const answered = phase === "right" || phase === "wrong";
  const showPlayback = player.playing && player.playingId !== "target";
  const keying = keyer.seq + (keyer.pending ?? "");
  let treeCode = keyer.seq || keyer.held;
  if (showPlayback) treeCode = player.prefix;
  else if (answered && target && !player.playing) treeCode = MORSE[target];
  else if (!treeCode && phase !== "asking") treeCode = player.linger;
  const liveCode = showPlayback ? player.prefix : keying || keyer.held;
  const liveLetter =
    showPlayback && player.prefix !== player.letterCode ? undefined : REV[liveCode];

  const tip = target ? tips.get(target) : undefined;

  // Con pantalla táctil no hay teclado ni barra espaciadora que mencionar.
  const howTo = (
    <p className="mt-4 max-w-[46ch] text-[16px] leading-snug text-muted">
      <span className="[@media(pointer:coarse)]:hidden">{l.howTo}</span>
      <span className="hidden [@media(pointer:coarse)]:inline">{l.howToTouch}</span>
    </p>
  );

  // Lo que dice si acertó o no: en la pantalla del aparato en el celular, en la tarjeta en las demás.
  const verdict =
    phase === "right" ? l.right(target ?? "") : picked ? l.wrong(target ?? "", picked) : l.wrongUnknown(target ?? "");

  // Celular: la parte de arriba del aparato hace de pantalla. Siempre tiene dos
  // líneas, así el árbol no salta al responder.
  const display = (
    <div className="learn-display" aria-live="polite">
      <p className="learn-display-main">
        {answered && target ? (
          <>
            {phase === "right" ? <Check aria-hidden /> : <X aria-hidden />}
            {verdict}
          </>
        ) : phase === "asking" ? (
          l.ask
        ) : (
          l.idleTitle
        )}
      </p>
      {score.total > 0 && <span className="learn-display-score">{l.scoreShort(score.right, score.total)}</span>}
      <p className="learn-display-sub">
        {answered && target ? (
          <>
            <MorseGlyphs morse={MORSE[target]} size={6} tone="led" />
            {tip && <span><b>{l.trick}:</b> {tip}</span>}
          </>
        ) : phase === "asking" ? (
          l.howToTouch
        ) : (
          l.idleLetters(pool.join(" "))
        )}
      </p>
    </div>
  );

  const board = (
    <Board>
      {display}
      <MorseTree
        code={treeCode}
        pending={player.playing ? null : keyer.pending}
        sweep={boot}
        onPick={(n) => {
          if (phase === "asking") {
            answer(n.letter);
          } else {
            clearNext();
            player.play(n.code, { id: "letter" });
          }
        }}
        words={t.device.words}
        ariaLabel={t.device.treeAria}
        nodeLabel={(n) => t.device.nodeLabel(n.letter, n.code)}
        compact={isMobile}
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

  // El paso siguiente del ejercicio: escuchar, oír de nuevo o pasar a la siguiente.
  const step =
    phase === "asking"
      ? { icon: <RotateCcw />, label: l.replay, tip: t.tips.replay, run: replay }
      : phase === "idle"
        ? { icon: <Play />, label: l.start, tip: t.tips.start, run: ask }
        : { icon: <SkipForward />, label: l.next, tip: t.tips.next, run: ask };

  // Celular: abajo, junto al pulgar, un solo botón que cambia y, a su lado,
  // responder con la tecla (mientras pregunta) u oír de nuevo (ya respondida).
  const mobileBar = (
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

  // Celular: los niveles en fichas, encima del aparato.
  const mobileTop = (
    <div role="group" aria-label={l.levelLabel} className="learn-chips">
      {groups.map((g, i) => (
        <button
          key={g.title}
          type="button"
          aria-pressed={level === i + 1}
          onClick={() => changeLevel(i + 1)}
        >
          {i + 1} · {g.chars.join(" ")}
        </button>
      ))}
    </div>
  );

  return (
    <DeviceLayout mode="learn" title={l.title} lead={l.lead} board={board} about={about}
      mobileTop={mobileTop}
      mobileBar={mobileBar}
      telegraph={{
        open: telegraph,
        onOpenChange: (open) => {
          keyer.reset();
          setTelegraph(open);
        },
        // Responder con la tecla: arriba la pregunta (o el resultado) y el paso siguiente
        top: (
          <div className="telegraph-learn">
            <div className="telegraph-msg telegraph-text">{answered && target ? verdict : l.ask}</div>
            <button type="button" className="telegraph-step" aria-label={step.label} onClick={step.run}>
              {step.icon}
            </button>
          </div>
        ),
      }}
      mobileAction={<Tooltip label={phase === "asking" ? t.tips.replay : phase === "idle" ? t.tips.start : t.tips.next}><Button variant="primary" onClick={phase === "asking" ? replay : ask}>
        {phase === "asking" ? <RotateCcw /> : <Play />}
        {phase === "asking" ? l.replay : phase === "idle" ? l.start : l.next}
      </Button></Tooltip>}
    >
      {/* En el celular esto va arriba (mobileTop); aquí queda para las pantallas grandes */}
      <div className="learn-main">
        <FieldLabel>{l.levelLabel}</FieldLabel>
        <Segmented
          value={level}
          onChange={changeLevel}
          ariaLabel={l.levelLabel}
          className="max-w-[320px]"
          options={groups.map((g, i) => ({
            value: i + 1,
            label: String(i + 1),
            // El nombre del nivel y sus letras, p. ej. «Palabras completas: S O R U D K»
            title: `${g.title.replace(/^\d+\s·\s/, "")}: ${g.chars.join(" ")}`,
          }))}
        />
        {/* Las letras del nivel: las nuevas resaltadas, las ya vistas atenuadas */}
        <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[19px] font-semibold">
          {pool.map((c) => (
            <span key={c} className={newLetters.has(c) ? "text-text" : "text-muted/70"}>
              {c}
            </span>
          ))}
        </p>

        <div className="mt-8 min-h-[168px]">
          {phase === "idle" && (
            <>
              <Tooltip label={t.tips.start}>
                <Button variant="primary" onClick={ask}>
                  <Play />
                  {l.start}
                </Button>
              </Tooltip>
              {howTo}
            </>
          )}

          {phase === "asking" && (
            <>
              <Tooltip label={t.tips.replay}>
                <Button onClick={replay}>
                  <RotateCcw />
                  {l.replay}
                </Button>
              </Tooltip>
              {howTo}
            </>
          )}

          {answered && target && (
            <>
              <div className="flex items-start gap-4">
                <span className="w-12 shrink-0 text-center text-[56px] leading-[0.9] font-bold">
                  {target}
                </span>
                <div className="min-w-0 pt-1">
                  <p className="flex items-center gap-2 text-[19px] leading-snug font-semibold">
                    {phase === "right" ? (
                      <Check aria-hidden className="size-5 shrink-0" />
                    ) : (
                      <X aria-hidden className="size-5 shrink-0" />
                    )}
                    {verdict}
                  </p>
                  <MorseGlyphs morse={MORSE[target]} size={9} tone="led" className="mt-2.5" />
                  {tip && (
                    <p className="mt-2.5 text-[15px] leading-snug text-muted">
                      <span className="font-semibold text-text">{l.trick}:</span> {tip}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <Tooltip label={t.tips.next}>
                  <Button variant="primary" onClick={ask}>
                    <SkipForward />
                    {l.next}
                  </Button>
                </Tooltip>
                <Tooltip label={t.tips.replay}>
                  <Button onClick={replay}>
                    <RotateCcw />
                    {l.replay}
                  </Button>
                </Tooltip>
              </div>
            </>
          )}
        </div>

        {score.total > 0 && (
          <p className="mt-6 flex flex-wrap gap-x-5 text-[15px] text-muted">
            <span>{l.score(score.right, score.total)}</span>
            {score.streak >= 2 && <span>{l.streak(score.streak)}</span>}
          </p>
        )}
      </div>

      <section className="mt-10 border-t border-line pt-6">
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
