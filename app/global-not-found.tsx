import type { Metadata } from "next";
import Link from "next/link";

import { SiteShell, siteMetadata, siteViewport } from "@/components/site-shell";
import { ROUTES } from "@/lib/i18n/routes";

// Dirección que no existe. Hay una raíz por idioma (app/(en) y app/es), así
// que este 404 va aparte, con la estación completa y en los dos idiomas.
export const metadata: Metadata = {
  ...siteMetadata,
  title: "404 · Morseo",
  robots: { index: false },
};
export const viewport = siteViewport;

export default function GlobalNotFound() {
  return (
    <SiteShell locale="en">
      <div className="station-page">
        <header className="station-heading">
          <div>
            <p className="station-eyebrow">404 · ... --- ...</p>
            <h1>
              Page not found. <span lang="es">Página no encontrada.</span>
            </h1>
            <p className="station-lead">
              This page doesn&apos;t exist. <span lang="es">Esta página no existe.</span>
            </p>
            <p className="station-lead">
              <Link href={ROUTES.en.translate} className="underline">Morse code translator</Link>
              {" · "}
              <Link href={ROUTES.es.translate} lang="es" className="underline">Traductor de código morse</Link>
            </p>
          </div>
        </header>
      </div>
    </SiteShell>
  );
}
