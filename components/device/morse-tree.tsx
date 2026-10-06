"use client";

import { useEffect, useId, useState, type CSSProperties, type ReactElement } from "react";

import {
  ROOT,
  TREE,
  TREE_COLS,
  TREE_ROWS,
  litCodes,
  parentOf,
  type TreeNode,
} from "@/lib/morse-tree";
import { cn } from "@/lib/utils";

const CELL = 44;
const PAD_X = 26;
const TOP = 60;
const W = PAD_X * 2 + (TREE_COLS - 1) * CELL;
const H = TOP + (TREE_ROWS - 1) * CELL + 30;

const X = (c: number) => PAD_X + c * CELL;
const Y = (r: number) => TOP + r * CELL;

const DOT_R = 8;
const DASH_LONG = 26;
const DASH_SHORT = 12;
const HIT = 42;
// Sin la serigrafía de arriba, el dibujo empieza aquí (las letras de la primera fila quedan).
const COMPACT_CUT = 26;

function geometry(n: TreeNode) {
  const isDash = n.code.endsWith("-");
  const p = parentOf(n);
  // La raya se orienta a lo largo de la pista que llega a ella.
  const horizontal = p.row === n.row;
  const w = isDash ? (horizontal ? DASH_LONG : DASH_SHORT) : DOT_R * 2;
  const h = isDash ? (horizontal ? DASH_SHORT : DASH_LONG) : DOT_R * 2;
  return { isDash, w, h, cx: X(n.col), cy: Y(n.row), px: X(p.col), py: Y(p.row) };
}

type Geo = ReturnType<typeof geometry>;

function labelPos(n: TreeNode, g: Geo) {
  const gap = 8;
  switch (n.label) {
    case "top":
      return { x: g.cx, y: g.cy - g.h / 2 - gap, anchor: "middle" as const };
    case "bottom":
      return { x: g.cx, y: g.cy + g.h / 2 + gap + 10, anchor: "middle" as const };
    case "left":
      return { x: g.cx - g.w / 2 - gap, y: g.cy + 4.6, anchor: "end" as const };
    case "right":
      return { x: g.cx + g.w / 2 + gap, y: g.cy + 4.6, anchor: "start" as const };
  }
}

type ShapeProps = {
  className?: string;
  filter?: string;
  strokeWidth?: number;
  "data-on"?: boolean;
};

function shape(g: Geo, grow: number, props: ShapeProps): ReactElement {
  return g.isDash ? (
    <rect
      x={g.cx - g.w / 2 - grow}
      y={g.cy - g.h / 2 - grow}
      width={g.w + grow * 2}
      height={g.h + grow * 2}
      rx={3.5 + grow / 2}
      {...props}
    />
  ) : (
    <circle cx={g.cx} cy={g.cy} r={DOT_R + grow} {...props} />
  );
}

function Lens({ g, on }: { g: Geo; on: boolean }) {
  if (!g.isDash) {
    return (
      <ellipse
        className="led-lens"
        data-on={on}
        cx={g.cx - 2.6}
        cy={g.cy - 3}
        rx={2.8}
        ry={1.9}
      />
    );
  }
  const horizontal = g.w > g.h;
  return horizontal ? (
    <rect
      className="led-lens"
      data-on={on}
      x={g.cx - g.w / 2 + 3.5}
      y={g.cy - g.h / 2 + 2.2}
      width={g.w - 7}
      height={2.4}
      rx={1.2}
    />
  ) : (
    <rect
      className="led-lens"
      data-on={on}
      x={g.cx - g.w / 2 + 2.2}
      y={g.cy - g.h / 2 + 3.5}
      width={2.4}
      height={g.h - 7}
      rx={1.2}
    />
  );
}

/**
 * El árbol del llavero: cada letra es un LED al final de su camino desde la
 * antena. Se encienden todos los tramos del código en curso (`code`) más el
 * símbolo que se esté sosteniendo en la tecla (`pending`). Con `onPick` cada
 * letra se vuelve un botón.
 *
 * Cada vez que cambia `sweep` (distinto de 0) una onda de luz sale de la antena
 * y recorre el árbol nivel por nivel: el arranque del aparato.
 *
 * `compact` quita la serigrafía de arriba (y su alto): en el celular, para
 * que el árbol quepa entero junto al botón del ejercicio.
 */
export function MorseTree({
  code,
  pending = null,
  onPick,
  sweep = 0,
  words,
  ariaLabel,
  nodeLabel,
  compact = false,
  className,
}: {
  code: string;
  pending?: "." | "-" | null;
  onPick?: (node: TreeNode) => void;
  sweep?: number;
  /** Serigrafía a los lados de la antena, p. ej. ["MORSE", "CODE"]. */
  words: [string, string];
  ariaLabel: string;
  nodeLabel: (node: TreeNode) => string;
  compact?: boolean;
  className?: string;
}) {
  const glowId = "glow" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
  // Nivel del árbol que ilumina la onda de arranque (0 = ninguno).
  const [wave, setWave] = useState(0);

  useEffect(() => {
    if (!sweep) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let depth = 0;
    const id = setInterval(() => {
      depth += 1;
      setWave(depth <= 4 ? depth : 0);
      if (depth > 4) clearInterval(id);
    }, 110);
    return () => {
      clearInterval(id);
      setWave(0);
    };
  }, [sweep]);

  const lit = litCodes(code + (pending ?? ""));
  if (wave) for (const n of TREE) if (n.code.length === wave) lit.add(n.code);
  const interactive = !!onPick;
  const rx = X(ROOT.col);
  const ry = Y(ROOT.row);

  return (
    <svg
      viewBox={compact ? `0 ${COMPACT_CUT} ${W} ${H - COMPACT_CUT}` : `0 0 ${W} ${H}`}
      role="group"
      aria-label={ariaLabel}
      className={cn("block h-auto w-full select-none", className)}
    >
      <defs>
        <filter id={glowId} x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur stdDeviation="4.5" />
        </filter>
      </defs>

      {!compact && <g className="fill-silk text-[15px] font-semibold tracking-[.18em]">
        <text x={X(1)} y={19} textAnchor="middle">
          {words[0]}
        </text>
        <text x={(X(4) + X(TREE_COLS - 1)) / 2} y={19} textAnchor="middle">
          {words[1]}
        </text>
      </g>}

      <g fill="none" strokeWidth={1.6} strokeLinecap="round">
        {TREE.map((n) => {
          const g = geometry(n);
          return (
            <line
              key={n.code}
              className="tree-trace"
              data-on={lit.has(n.code)}
              x1={g.px}
              y1={g.py}
              x2={g.cx}
              y2={g.cy}
            />
          );
        })}
      </g>

      {/* La antena: el punto de partida de todo código */}
      <path
        d={`M${rx} ${ry} V${ry - 13} M${rx - 9} ${ry - 26} H${rx + 9} L${rx} ${ry - 13} Z`}
        fill="none"
        stroke="var(--silk)"
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <circle cx={rx} cy={ry} r={4.8} fill="var(--gold)" />
      <circle cx={rx} cy={ry} r={1.9} fill="var(--board)" />

      {TREE.map((n) => {
        const g = geometry(n);
        const on = lit.has(n.code);
        const lp = labelPos(n, g);
        const style = { "--led": g.isDash ? "var(--dash)" : "var(--dot)" } as CSSProperties;
        return (
          <g
            key={n.code}
            style={style}
            className={interactive ? "tree-node" : undefined}
            role={interactive ? "button" : undefined}
            tabIndex={interactive ? 0 : undefined}
            aria-label={interactive ? nodeLabel(n) : undefined}
            // Sin foco al hacer clic: así la barra espaciadora sigue siendo la tecla.
            onPointerDown={interactive ? (e) => e.preventDefault() : undefined}
            onClick={interactive ? () => onPick?.(n) : undefined}
            onKeyDown={
              interactive
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      onPick?.(n);
                    }
                  }
                : undefined
            }
          >
            {interactive && (
              <rect
                x={g.cx - HIT / 2}
                y={g.cy - HIT / 2}
                width={HIT}
                height={HIT}
                fill="transparent"
              />
            )}
            {shape(g, 5, {
              className: "led-halo",
              "data-on": on,
              filter: `url(#${glowId})`,
            })}
            {shape(g, 0, { className: "led", "data-on": on, strokeWidth: 1.2 })}
            <Lens g={g} on={on} />
            {interactive && shape(g, 6, { className: "node-ring" })}
            <text
              x={lp.x}
              y={lp.y}
              textAnchor={lp.anchor}
              className="fill-silk text-[13.5px] font-semibold"
            >
              {n.letter}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
