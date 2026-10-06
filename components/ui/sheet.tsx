"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Hoja que sube desde abajo, para el celular: el árbol morse, los ajustes o el
 * canal. Se cierra con la X, tocando el fondo o con Escape; mientras está
 * abierta la página de atrás no se desplaza.
 */
export function Sheet({
  open,
  onClose,
  title,
  hint,
  closeLabel,
  dark = false,
  className,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  hint?: string;
  closeLabel: string;
  /** Grafito, como la placa del aparato. */
  dark?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  // La página se vuelve a dibujar mientras está abierta (p. ej. al teclear):
  // cerrar va en una referencia para no repetir el foco y el bloqueo.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const before = document.activeElement as HTMLElement | null;
    const root = document.documentElement;
    const overflow = root.style.overflow;
    root.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      root.style.overflow = overflow;
      before?.focus?.();
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className="sheet-layer">
      <button type="button" className="sheet-scrim" aria-label={closeLabel} tabIndex={-1} onClick={onClose} />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn("sheet", dark && "sheet-dark", className)}
      >
        <span aria-hidden className="sheet-grip" />
        <header className="sheet-head">
          <div>
            <h2 id={titleId}>{title}</h2>
            {hint && <p>{hint}</p>}
          </div>
          <button ref={closeRef} type="button" className="sheet-close" aria-label={closeLabel} onClick={onClose}>
            <X aria-hidden />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
