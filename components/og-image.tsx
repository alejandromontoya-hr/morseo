import { ImageResponse } from "next/og";

import { content } from "@/lib/content";
import { dictionaries } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import type { PageKey } from "@/lib/i18n/routes";
import { MORSE } from "@/lib/morse";

// La tarjeta que sale al compartir un enlace (WhatsApp, LinkedIn, X): el logo,
// el título grande de la página y «MORSEO» escrito en puntos y rayas con los
// colores del árbol. Mismos colores del modo día de la app.
const MIST = "#f4f4f6";
const GRAPHITE = "#232325";
const LIME = "#cad77f";
const MUTED = "#6b6b71";

export const ogSize = { width: 1200, height: 630 };

function Glyph({ code, dot }: { code: string; dot: number }) {
  return (
    <div style={{ display: "flex", gap: dot * 0.45, alignItems: "center" }}>
      {[...code].map((s, i) =>
        s === "-" ? (
          <div key={i} style={{ width: dot * 3, height: dot, borderRadius: dot, background: GRAPHITE }} />
        ) : (
          <div key={i} style={{ width: dot, height: dot, borderRadius: dot, background: LIME, border: `3px solid ${GRAPHITE}` }} />
        )
      )}
    </div>
  );
}

export function ogImage(locale: Locale, page: PageKey) {
  const [first, second] = dictionaries[locale].station.headings[page];
  const { tagline } = content[locale].og[page];
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: MIST,
          color: GRAPHITE,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              width: 72,
              height: 72,
              borderRadius: 72,
              background: GRAPHITE,
            }}
          >
            <div style={{ width: 11, height: 11, borderRadius: 11, background: LIME }} />
            <div style={{ width: 24, height: 11, borderRadius: 11, background: LIME }} />
            <div style={{ width: 11, height: 11, borderRadius: 11, background: LIME }} />
          </div>
          <div style={{ fontSize: 46, fontWeight: 700, letterSpacing: -1.5 }}>morseo</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div style={{ display: "flex", flexWrap: "wrap", fontSize: 92, lineHeight: 1.05, letterSpacing: -3 }}>
            <span style={{ marginRight: 24 }}>{first}</span>
            <span style={{ background: LIME, padding: "0 10px" }}>{second}</span>
          </div>
          <div style={{ fontSize: 34, color: MUTED, maxWidth: 940, lineHeight: 1.35 }}>{tagline}</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 26 }}>
            {[..."MORSEO"].map((c, i) => (
              <Glyph key={i} code={MORSE[c]} dot={16} />
            ))}
          </div>
          <div style={{ fontSize: 30, color: MUTED }}>morseo.site</div>
        </div>
      </div>
    ),
    ogSize
  );
}
