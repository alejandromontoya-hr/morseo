import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

/**
 * Morse dibujado con formas, no con caracteres: el punto es un círculo y la
 * raya una barra, igual que los LED del árbol. Recibe el formato de lib/morse
 * (letras separadas por espacio y palabras por " / ").
 *
 * Con `active` resalta la letra que está sonando y atenúa las que faltan, para
 * seguir la reproducción con la vista.
 */
export function MorseGlyphs({
  morse,
  size = 7,
  tone = "ink",
  active = null,
  className,
}: {
  morse: string;
  /** Diámetro del punto, en px. */
  size?: number;
  /** "led": lima y la raya encendida, como el árbol; "ink": el color del texto. */
  tone?: "led" | "ink";
  active?: number | null;
  className?: string;
}) {
  const words = morse.trim() ? morse.trim().split(/\s*\/\s*/) : [];
  let n = 0;
  return (
    <span
      aria-hidden
      data-tone={tone}
      className={cn("glyphs", className)}
      style={{ "--g": `${size}px` } as CSSProperties}
    >
      {words.map((word, wi) => (
        <span key={wi} className="glyph-word">
          {word
            .split(/\s+/)
            .filter(Boolean)
            .map((letter, li) => {
              const idx = n++;
              return (
                <span
                  key={li}
                  className={cn(
                    "glyph-letter transition-opacity duration-150",
                    active != null && idx > active && "opacity-30"
                  )}
                >
                  {[...letter].map((s, si) => (
                    <span key={si} className={s === "-" ? "g-dash" : "g-dot"} />
                  ))}
                </span>
              );
            })}
        </span>
      ))}
    </span>
  );
}
