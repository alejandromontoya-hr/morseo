"use client";

import { useEffect, useRef } from "react";

import { NEUTRAL, createFace, faceShape } from "@/lib/emblem-face";

// Más lejos que esto, el puntero ya no tira más de los ojos (px).
const REACH_PX = 220;
// Un tirón del puntero más rápido que esto, cerca del muñeco, lo asusta (px/ms).
const STARTLE_SPEED = 4;
const STARTLE_NEAR_PX = 450;
const STARTLE_COOLDOWN_MS = 6000;

const rest = faceShape(NEUTRAL);

/**
 * El emblema de la estación: anillos y el disco lima con el muñeco. Sigue el
 * puntero con los ojos, parpadea, se sorprende, piensa y guiña. Pasar el
 * puntero por encima lo hace guiñar; un clic, sorprenderse. Con movimiento
 * reducido se queda quieto como la R en morse.
 */
export function StationEmblem({ label }: { label: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<SVGEllipseElement>(null);
  const rightRef = useRef<SVGEllipseElement>(null);
  const lidLRef = useRef<SVGPathElement>(null);
  const lidRRef = useRef<SVGPathElement>(null);
  const mouthRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const eyes = [leftRef.current, rightRef.current];
    const lids = [lidLRef.current, lidRRef.current];
    const mouth = mouthRef.current;
    if (!root || !eyes[0] || !eyes[1] || !lids[0] || !lids[1] || !mouth) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const face = createFace();
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
      const s = faceShape(
        face.frame(now, { lookX, lookY, idleMs: pointer.seen ? now - pointer.at : Infinity })
      );
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
      window.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerenter", onEnter);
      root.removeEventListener("pointerdown", onDown);
    };
  }, []);

  return (
    <div ref={rootRef} className="station-emblem" aria-hidden>
      <span />
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
      <small>{label}</small>
    </div>
  );
}
