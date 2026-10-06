"use client";

import { useEffect, useRef, type RefObject } from "react";

import { NEUTRAL, createFace, faceShape } from "@/lib/emblem-face";
import { toneNow } from "@/lib/tone";

// Más lejos que esto, el puntero ya no tira más de los ojos (px).
const REACH_PX = 220;
// Un tirón del puntero más rápido que esto, cerca del muñeco, lo asusta (px/ms).
const STARTLE_SPEED = 4;
const STARTLE_NEAR_PX = 450;
const STARTLE_COOLDOWN_MS = 6000;

const rest = faceShape(NEUTRAL);

/**
 * El emblema de la estación: anillos y el disco lima con el muñeco. Sigue el
 * puntero con los ojos, parpadea, se sorprende, piensa, guiña y a veces dice
 * una palabra en morse en su letrero. Cuando suena morse en la página mira el
 * aparato y abre la boca con cada tono. Pasar el puntero por encima lo hace
 * guiñar; un clic, sorprenderse. Con movimiento reducido se queda quieto.
 *
 * `variant="dock"` es su versión del celular: solo la cara, junto al
 * pulsador. Su globo va aparte, encima, con todo el ancho del panel: lo que
 * dice en morse lo escribe en `sayRef` y mientras habla esconde `idleRef`.
 */
export function StationEmblem({
  label = "",
  words,
  variant = "emblem",
  sayRef: saySlot,
  idleRef: idleSlot,
}: {
  label?: string;
  words: string[];
  variant?: "emblem" | "dock";
  /** Celular: dónde escribe lo que dice en morse (el globo del panel). */
  sayRef?: RefObject<HTMLElement | null>;
  /** Celular: lo que se esconde mientras habla (el texto de reposo del globo). */
  idleRef?: RefObject<HTMLElement | null>;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<SVGEllipseElement>(null);
  const rightRef = useRef<SVGEllipseElement>(null);
  const lidLRef = useRef<SVGPathElement>(null);
  const lidRRef = useRef<SVGPathElement>(null);
  const mouthRef = useRef<SVGPathElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const sayRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const eyes = [leftRef.current, rightRef.current];
    const lids = [lidLRef.current, lidRRef.current];
    const mouth = mouthRef.current;
    const labelEl = idleSlot?.current ?? labelRef.current;
    const sayEl = saySlot?.current ?? sayRef.current;
    if (!root || !eyes[0] || !eyes[1] || !lids[0] || !lids[1] || !mouth || !labelEl || !sayEl) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const face = createFace(Math.random, words);
    let said: string | null = null;
    const pointer = { x: 0, y: 0, seen: false, at: 0 };
    let lastStartle = -Infinity;

    const center = () => {
      const box = root.getBoundingClientRect();
      return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
    };

    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      if (pointer.seen) {
        const speed =
          Math.hypot(e.clientX - pointer.x, e.clientY - pointer.y) / Math.max(8, now - pointer.at);
        const c = center();
        if (
          speed > STARTLE_SPEED &&
          now - lastStartle > STARTLE_COOLDOWN_MS &&
          Math.hypot(e.clientX - c.x, e.clientY - c.y) < STARTLE_NEAR_PX &&
          face.trigger("surprise", now)
        )
          lastStartle = now;
      }
      Object.assign(pointer, { x: e.clientX, y: e.clientY, seen: true, at: now });
    };
    // Hacia el aparato (el árbol o el panel del pulsador): ahí mira cuando suena.
    // En el celular el aparato es el pulsador que tiene al lado.
    const device = () => {
      const el =
        variant === "dock"
          ? document.querySelector(".station-dock .pulsador")
          : document.querySelector(".station-side .board") ??
            document.querySelector(".station-side .station-panel") ??
            document.querySelector(".station-side");
      if (!el) return { x: 0, y: 1 };
      const b = el.getBoundingClientRect();
      const c = center();
      const dx = b.left + b.width / 2 - c.x;
      const dy = b.top + b.height / 2 - c.y;
      const d = Math.hypot(dx, dy) || 1;
      return { x: dx / d, y: dy / d };
    };

    const onEnter = (e: PointerEvent) => {
      // Con el dedo no hay «pasar por encima»: el toque lo asusta (onDown).
      if (e.pointerType !== "mouse") return;
      face.trigger("wink", performance.now(), e.clientX < center().x ? -1 : 1);
    };
    const onDown = () => {
      if (face.trigger("surprise", performance.now())) lastStartle = performance.now();
    };

    // La función de cuadro: lee el puntero, pide la pose y la dibuja.
    let raf = 0;
    const frame = (now: number) => {
      let lookX = 0;
      let lookY = 0;
      if (pointer.seen) {
        const c = center();
        const dx = pointer.x - c.x;
        const dy = pointer.y - c.y;
        const d = Math.hypot(dx, dy) || 1;
        const pull = Math.min(1, d / REACH_PX);
        lookX = (dx / d) * pull;
        lookY = (dy / d) * pull;
      }
      const dev = device();
      const s = faceShape(
        face.frame(now, {
          lookX,
          lookY,
          idleMs: pointer.seen ? now - pointer.at : Infinity,
          tone: toneNow.on,
          deviceX: dev.x,
          deviceY: dev.y,
        })
      );
      // El letrero: lo que va diciendo en morse, o el de siempre.
      const next = face.say();
      if (next !== said) {
        said = next;
        sayEl.textContent = next ?? "";
        sayEl.hidden = next == null;
        labelEl.hidden = next != null;
      }
      [s.left, s.right].forEach((e, i) => {
        const el = eyes[i]!;
        el.setAttribute("cx", String(e.cx));
        el.setAttribute("cy", String(e.cy));
        el.setAttribute("rx", String(e.rx));
        el.setAttribute("ry", String(e.ry));
        el.setAttribute("opacity", String(e.opacity));
      });
      [s.lidL, s.lidR].forEach((l, i) => {
        const el = lids[i]!;
        el.setAttribute("d", l.d);
        el.setAttribute("stroke-width", String(l.strokeWidth));
        el.setAttribute("opacity", String(l.opacity));
      });
      mouth.setAttribute("d", s.mouth.d);
      mouth.setAttribute("stroke-width", String(s.mouth.strokeWidth));
      mouth.setAttribute("transform", s.mouth.transform);
      raf = requestAnimationFrame(frame);
    };

    // Solo se anima mientras se ve: fuera de pantalla no gasta nada.
    const seen = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      if (entry.isIntersecting) raf = requestAnimationFrame(frame);
    });
    seen.observe(root);
    window.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("pointerenter", onEnter);
    root.addEventListener("pointerdown", onDown);
    return () => {
      cancelAnimationFrame(raf);
      seen.disconnect();
      sayEl.hidden = true;
      labelEl.hidden = false;
      window.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerenter", onEnter);
      root.removeEventListener("pointerdown", onDown);
    };
  }, [words, variant, saySlot, idleSlot]);

  const face = (
    <svg viewBox="-50 -50 100 100" className="station-face">
      <ellipse ref={leftRef} {...rest.left} />
      <path
        ref={mouthRef}
        d={rest.mouth.d}
        strokeWidth={rest.mouth.strokeWidth}
        transform={rest.mouth.transform}
      />
      <ellipse ref={rightRef} {...rest.right} />
      <path ref={lidLRef} d={rest.lidL.d} strokeWidth={rest.lidL.strokeWidth} opacity={rest.lidL.opacity} />
      <path ref={lidRRef} d={rest.lidR.d} strokeWidth={rest.lidR.strokeWidth} opacity={rest.lidR.opacity} />
    </svg>
  );

  if (variant === "dock") {
    return (
      <div ref={rootRef} className="dock-face" aria-hidden>
        {face}
      </div>
    );
  }

  return (
    <div ref={rootRef} className="station-emblem" aria-hidden>
      <span />
      {face}
      <small>
        <span ref={labelRef}>{label}</span>
        <span ref={sayRef} className="station-say" hidden />
      </small>
    </div>
  );
}
