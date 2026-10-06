import type { ReactNode } from "react";

import { MORSE } from "@/lib/morse";
import { MorseGlyphs } from "@/components/morse-glyphs";

/**
 * Piezas de la guía que va debajo de cada herramienta. Son componentes de
 * servidor: el texto llega en el HTML, que es lo que leen Google y las IA.
 */

export function GuideSection({
  title,
  lead,
  children,
}: {
  title: string;
  lead?: string;
  children: ReactNode;
}) {
  return (
    <section className="station-guide-section">
      <h2>{title}</h2>
      {lead && <p className="station-guide-lead">{lead}</p>}
      {children}
    </section>
  );
}

/** Pasos numerados. */
export function GuideSteps({ items }: { items: string[] }) {
  return (
    <ol className="station-guide-steps">
      {items.map((s) => (
        <li key={s}>{s}</li>
      ))}
    </ol>
  );
}

/** Preguntas frecuentes, todas abiertas: se leen de corrido sin tocar nada. */
export function GuideFaq({ title, items }: { title: string; items: { q: string; a: string }[] }) {
  return (
    <GuideSection title={title}>
      <div className="station-faq">
        {items.map(({ q, a }) => (
          <div key={q}>
            <h3>{q}</h3>
            <p>{a}</p>
          </div>
        ))}
      </div>
    </GuideSection>
  );
}

/** Tabla de signos: el carácter, su morse dibujado y su morse en texto para copiar. */
export function MorseTable({ chars, label }: { chars: string[]; label: string }) {
  return (
    <div className="station-alphabet-group">
      <h3>{label}</h3>
      <dl className="station-alphabet">
        {chars.map((c) => (
          <div key={c}>
            <dt>{c}</dt>
            <dd>
              <MorseGlyphs morse={MORSE[c]} size={6} />
              <code>{MORSE[c]}</code>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Ficha estructurada para buscadores. Escapa «<» para que el texto no cierre la etiqueta. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
