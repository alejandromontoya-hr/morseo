"use client";

import { useEffect, useRef, useState, type ReactElement, type ReactNode } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

// Con el dedo no hay «mouse encima»: el globito sale al sostener el dedo.
const HOLD_MS = 450;
// Al soltar, sigue a la vista un momento para alcanzar a leerlo.
const LINGER_MS = 1500;
// Si el dedo se corre más que esto, es un scroll: no se muestra.
const SLOP_PX = 10;

/**
 * Ajusta el ancho del globito a su línea más larga. Con el texto repartido
 * parejo (text-wrap: balance) las líneas quedan cortas, pero la caja se queda
 * en su ancho máximo y sobra espacio a los lados; el CSS solo no lo encoge.
 */
function fitToLines(el: HTMLElement | null) {
  const text = el?.firstChild;
  if (!el || !text || text.nodeType !== Node.TEXT_NODE) return;
  el.style.width = "";
  const range = document.createRange();
  range.selectNodeContents(text);
  const lines = [...range.getClientRects()];
  if (lines.length < 2) return;
  // La entrada lleva una escala: se mide sin ella.
  const scale = el.getBoundingClientRect().width / el.offsetWidth || 1;
  const widest = Math.max(...lines.map((r) => r.width)) / scale;
  const css = getComputedStyle(el);
  el.style.width = `${Math.ceil(widest + parseFloat(css.paddingLeft) + parseFloat(css.paddingRight)) + 1}px`;
}

/** Va una vez arriba de todo: comparte la espera entre globitos vecinos. */
export function TooltipProvider({ children }: { children: ReactNode }) {
  return (
    <TooltipPrimitive.Provider delayDuration={300} skipDelayDuration={200}>
      {children}
    </TooltipPrimitive.Provider>
  );
}

/**
 * Globito con la estética de Morseo sobre un botón o enlace. Con mouse sale al
 * dejarlo encima; con teclado, al llegar con Tab; con el dedo, al sostenerlo.
 * Sostener no oprime el botón: al soltar no se dispara su clic. Con
 * `touch={false}` el dedo no lo abre: es para el pulsador, donde sostener es
 * la raya. Con `disabledLabel`, si el botón está apagado el globito dice por qué.
 */
export function Tooltip({
  label,
  disabledLabel,
  side = "top",
  touch = true,
  children,
}: {
  label?: ReactNode;
  /** Lo que dice cuando el botón está apagado, p. ej. «Escribe un mensaje primero». */
  disabledLabel?: ReactNode;
  side?: "top" | "bottom";
  touch?: boolean;
  children: ReactElement<{ disabled?: boolean }>;
}) {
  const [open, setOpen] = useState(false);
  const hold = useRef<{ timer?: ReturnType<typeof setTimeout>; x: number; y: number; shown: boolean }>({
    x: 0,
    y: 0,
    shown: false,
  });
  const linger = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const h = hold.current;
    return () => {
      clearTimeout(h.timer);
      clearTimeout(linger.current);
    };
  }, []);

  const off = Boolean(children.props.disabled) && disabledLabel != null;
  const text = off ? disabledLabel : label;
  if (!text) return children;

  const h = hold.current;
  const cancelHold = () => {
    clearTimeout(h.timer);
    h.timer = undefined;
  };

  return (
    <TooltipPrimitive.Root open={open} onOpenChange={setOpen}>
      <TooltipPrimitive.Trigger
        asChild
        data-tip=""
        onPointerDown={(e) => {
          // Cada toque nuevo empieza limpio: solo el clic que cierra un sostener se ignora.
          h.shown = false;
          // Oprimir cierra el globito (el pulsador frena el cierre de Radix).
          setOpen(false);
          if (e.pointerType !== "touch" || !touch) return;
          clearTimeout(linger.current);
          cancelHold();
          h.x = e.clientX;
          h.y = e.clientY;
          h.timer = setTimeout(() => {
            h.timer = undefined;
            h.shown = true;
            setOpen(true);
            navigator.vibrate?.(10);
          }, HOLD_MS);
        }}
        onPointerMove={(e) => {
          if (e.pointerType === "touch" && h.timer && Math.hypot(e.clientX - h.x, e.clientY - h.y) > SLOP_PX)
            cancelHold();
        }}
        onPointerUp={(e) => {
          if (e.pointerType !== "touch") return;
          cancelHold();
          if (h.shown) linger.current = setTimeout(() => setOpen(false), LINGER_MS);
        }}
        onPointerCancel={cancelHold}
        // Con Tab a un botón fuera de pantalla, el navegador baja la página y
        // Radix cierra el globito al verla moverse. Se abre después del scroll.
        onFocus={(e) => {
          e.preventDefault();
          // Con envoltura, el foco lo tiene el botón de adentro: se mira a él.
          if (!(e.target as Element).matches(":focus-visible")) return;
          const el = e.currentTarget;
          requestAnimationFrame(() =>
            requestAnimationFrame(() => {
              if (el.contains(document.activeElement)) setOpen(true);
            })
          );
        }}
        // Al levantar el dedo el navegador avisa que el puntero «salió»: con el
        // dedo eso no cierra el globito (lo cierra la espera de LINGER_MS).
        onPointerLeave={(e) => {
          if (e.pointerType === "touch") e.preventDefault();
        }}
        // Android abre su menú al sostener un enlace; iOS lo evita por CSS.
        onContextMenu={(e) => {
          if (h.timer || h.shown) e.preventDefault();
        }}
        onClickCapture={(e) => {
          if (!h.shown) return;
          h.shown = false;
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {disabledLabel != null ? (
          // Un botón apagado no recibe el mouse ni el foco: el globito va en una
          // envoltura que sí, y con Tab se llega a ella. Está siempre, apagado o
          // no, para que el elemento bajo el mouse no cambie al encenderse.
          <span className="tip-wrap" tabIndex={off ? 0 : undefined}>
            {children}
          </span>
        ) : (
          children
        )}
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        {/* El portal pinta el globito en una segunda pasada: se mide al aparecer */}
        <TooltipPrimitive.Content ref={fitToLines} side={side} sideOffset={8} collisionPadding={8} className="tip">
          {text}
          <TooltipPrimitive.Arrow className="tip-arrow" width={12} height={6} />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
