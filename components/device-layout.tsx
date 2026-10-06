"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { CircleDot, Network, Radio } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { useIsMobile } from "@/lib/use-media";
import { Segmented } from "@/components/ui/segmented";
import { Sheet } from "@/components/ui/sheet";
import { Tooltip } from "@/components/ui/tooltip";
import { StationEmblem } from "@/components/station-emblem";
import { MorsePad } from "@/components/device/morse-pad";
import { GitHubMark, LINKEDIN_URL, LinkedInMark, REPO_URL } from "@/components/github-link";

export type DeviceView = "key" | "tree";

/** Celular: el teclado morse, que sale donde sale el teclado del celular. */
export type PadProps = {
  open: boolean;
  /** «Teclado»: vuelve al teclado del celular. */
  onKeyboard: () => void;
  /** El pulsador (`PadKey`). */
  keyEl: ReactNode;
  /** Lo que se teclea o suena ahora, en el globo del muñeco. */
  readout?: ReactNode;
  /** Lo que dice el globo cuando no suena nada. */
  idle: string;
  /** A la derecha del pulsador: borrar, o la luz de «al aire». */
  side?: ReactNode;
};

/** Celular: el aparato a pantalla completa, con tu mensaje arriba. */
export type TelegraphProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Arriba, junto a cerrar: el mensaje, lo último que llegó o la pregunta. */
  top: ReactNode;
};

/**
 * Página de estación: los controles a la izquierda y, a la derecha, lo que se
 * teclea a mano. Con `hand` ese lado tiene un interruptor fijo arriba: «Tecla»
 * muestra solo la tecla redonda y «Árbol morse» la cambia, en el mismo lugar,
 * por el aparato completo. Sin `hand` (Aprender) el aparato está siempre.
 * `about` es la guía de debajo (cómo se usa, alfabeto, preguntas frecuentes).
 *
 * En el celular cada página se ve completa y el pulsador funciona como un
 * teclado: `pad` lo abre donde sale el teclado del celular, y mientras está
 * abierto la cápsula de páginas se esconde. Su botón «Árbol» abre `telegraph`,
 * el aparato a pantalla completa. `mobileBar` es una fila fija encima de la
 * cápsula (escribir en Al aire, el botón del ejercicio en Aprender).
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
  mobileTop,
  mobileBar,
  pad,
  telegraph,
  about,
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
  /** Tableta: la acción principal encima del aparato. */
  mobileAction?: ReactNode;
  /** Celular: lo que va arriba de la herramienta. */
  mobileTop?: ReactNode;
  /** Celular: la fila fija encima de la cápsula de páginas. */
  mobileBar?: ReactNode;
  pad?: PadProps;
  telegraph?: TelegraphProps;
  about?: ReactNode;
}) {
  const { t } = useI18n();
  const heading = t.station.headings[mode];
  const showTree = !hand || view === "tree";
  const isMobile = useIsMobile();
  // En el celular, con `hand`, el aparato no va al lado: se abre a pantalla completa.
  const treeInSheet = isMobile && !!hand;
  const padOpen = isMobile && !!pad?.open;
  const hasBar = isMobile && !!mobileBar;

  // Con el teclado morse abierto la cápsula de páginas se esconde, como con el
  // teclado del celular, y el final de la página deja libre su alto.
  const padRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!padOpen) return;
    const root = document.documentElement;
    root.dataset.pad = "open";
    const el = padRef.current;
    const measure = () => el && root.style.setProperty("--pad-h", `${el.offsetHeight}px`);
    measure();
    const ro = new ResizeObserver(measure);
    if (el) ro.observe(el);
    return () => {
      ro.disconnect();
      delete root.dataset.pad;
      root.style.removeProperty("--pad-h");
    };
  }, [padOpen]);

  // Lo mismo con la fila fija de abajo: su alto queda libre al final de la página.
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = barRef.current;
    if (!hasBar || !el) return;
    const root = document.documentElement;
    const measure = () => root.style.setProperty("--bar-h", `${el.offsetHeight}px`);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.removeProperty("--bar-h");
    };
  }, [hasBar]);

  return (
    <div className="station-page" data-mode={mode} data-hand={hand ? "true" : undefined}>
      <header className="station-heading">
        <div>
          <p className="station-eyebrow">{t.station.mottos[mode]}</p>
          <h1>{heading[0]} <span>{heading[1]}</span></h1>
          <p className="station-lead">{lead}</p>
        </div>
        <StationEmblem label={`R / ${t.station.received}`} words={t.station.emblemWords} />
      </header>
      <div className="station-toolbar">
        <span className="station-section-label"><Radio aria-hidden />{title}</span>
      </div>
      {mobileTop && <div className="station-mobile-top">{mobileTop}</div>}
      {monitor}
      <div className="station-workspace">
        <section className="station-controls" aria-label={title}>{children}</section>
        {!treeInSheet && (
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
        )}
        {/* Fuera de la columna: así el borde que se iguala con la tarjeta es el del aparato */}
        {showTree && !treeInSheet && <p className="station-device-hint">{t.station.deviceHint}</p>}
      </div>
      {about && <div className="station-guide">{about}</div>}
      <footer className="station-footer">
        <span>MORSEO · {t.station.footer}</span>
        {/* Solo los logos: quien los conoce sabe a dónde llevan; el nombre va para lectores de pantalla */}
        <nav aria-label={t.station.links}>
          <Tooltip label={t.nav.repo}>
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer" aria-label={t.nav.repo}>
              <GitHubMark />
            </a>
          </Tooltip>
          {LINKEDIN_URL && (
            <Tooltip label={t.station.linkedin}>
              <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" aria-label={t.station.linkedin}>
                <LinkedInMark />
              </a>
            </Tooltip>
          )}
        </nav>
      </footer>

      {mobileBar && <div ref={barRef} className="station-bar">{mobileBar}</div>}
      {pad && padOpen && (
        <MorsePad
          sectionRef={padRef}
          keyEl={pad.keyEl}
          readout={pad.readout}
          idle={pad.idle}
          side={pad.side}
          onKeyboard={pad.onKeyboard}
          onTree={telegraph ? () => telegraph.onOpenChange(true) : undefined}
        />
      )}
      {telegraph && isMobile && (
        <Sheet
          open={telegraph.open}
          onClose={() => telegraph.onOpenChange(false)}
          dark
          title={t.station.view.tree}
          head={<div className="telegraph-top">{telegraph.top}</div>}
          closeLabel={t.station.close}
          className="sheet-tree sheet-telegraph"
        >
          {board}
        </Sheet>
      )}
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
