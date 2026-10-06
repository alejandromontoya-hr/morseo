"use client";

import { type ReactNode } from "react";
import { CircleDot, Network, Radio } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { Segmented } from "@/components/ui/segmented";
import { StationEmblem } from "@/components/station-emblem";
import { GitHubMark, LINKEDIN_URL, LinkedInMark, REPO_URL } from "@/components/github-link";

export type DeviceView = "key" | "tree";

/**
 * Página de estación: los controles a la izquierda y, a la derecha, lo que se
 * teclea a mano. Con `hand` ese lado tiene un interruptor fijo arriba: «Tecla»
 * muestra solo la tecla redonda y «Árbol morse» la cambia, en el mismo lugar,
 * por el aparato completo. Sin `hand` (Aprender) el aparato está siempre.
 */
export function DeviceLayout({
  title,
  lead,
  board,
  children,
  mode,
  hand,
  view = "tree",
  onViewChange,
  monitor,
  mobileAction,
}: {
  title: string;
  lead: ReactNode;
  board: ReactNode;
  children: ReactNode;
  mode: "translate" | "learn" | "radio";
  hand?: ReactNode;
  view?: DeviceView;
  onViewChange?: (view: DeviceView) => void;
  monitor?: ReactNode;
  mobileAction?: ReactNode;
}) {
  const { t } = useI18n();
  const heading = t.station.headings[mode];
  const showTree = !hand || view === "tree";
  return (
    <div className="station-page" data-mode={mode}>
      <header className="station-heading">
        <div>
          <p className="station-eyebrow">{t.station.eyebrow} / {title}</p>
          <h1>{heading[0]} <span>{heading[1]}</span></h1>
          <p className="station-lead">{lead}</p>
        </div>
        <StationEmblem label={`R / ${t.station.received}`} />
      </header>
      <div className="station-toolbar">
        <span className="station-section-label"><Radio aria-hidden />{title}</span>
      </div>
      {monitor}
      <div className="station-workspace">
        <section className="station-controls" aria-label={title}>{children}</section>
        <div className="station-side">
          {hand && onViewChange && (
            <Segmented
              value={view}
              onChange={onViewChange}
              ariaLabel={t.station.view.label}
              className="station-view-switch"
              options={[
                {
                  value: "key",
                  label: <><CircleDot aria-hidden />{t.station.view.key}</>,
                  title: t.station.view.keyTitle,
                },
                {
                  value: "tree",
                  label: <><Network aria-hidden />{t.station.view.tree}</>,
                  title: t.station.view.treeTitle,
                },
              ]}
            />
          )}
          {/* La clave reinicia la animación de entrada en cada cambio */}
          <div key={showTree ? "tree" : "key"} className="station-swap">
            {showTree ? (
              <div className="station-device">
                {mobileAction && <div className="station-mobile-action">{mobileAction}</div>}
                {board}
                <p className="station-device-hint">{t.station.deviceHint}</p>
              </div>
            ) : (
              <>
                <div className="station-panel">{hand}</div>
                <div className="station-panel station-note">
                  <strong>{t.station.silenceTitle}</strong>
                  <p>{t.station.silenceBody}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <footer className="station-footer">
        <span>MORSEO · {t.station.footer}</span>
        {/* Solo los logos: quien los conoce sabe a dónde llevan; el nombre va para lectores de pantalla */}
        <nav aria-label={t.station.links}>
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" aria-label={t.nav.repo} title={t.nav.repo}>
            <GitHubMark />
          </a>
          {LINKEDIN_URL && (
            <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" aria-label={t.station.linkedin} title={t.station.linkedin}>
              <LinkedInMark />
            </a>
          )}
        </nav>
      </footer>
    </div>
  );
}

/** Rótulo de un grupo de controles. */
export function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-[15px] font-semibold text-text"
    >
      {children}
    </label>
  );
}
