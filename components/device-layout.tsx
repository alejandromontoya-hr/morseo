"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowUp, CircleDot, Network, Radio } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { useIsMobile } from "@/lib/use-media";
import { Segmented } from "@/components/ui/segmented";
import { Sheet } from "@/components/ui/sheet";
import { Tooltip } from "@/components/ui/tooltip";
import { StationEmblem } from "@/components/station-emblem";
import { GitHubMark, LINKEDIN_URL, LinkedInMark, REPO_URL } from "@/components/github-link";

export type DeviceView = "key" | "tree";

/**
 * Página de estación: los controles a la izquierda y, a la derecha, lo que se
 * teclea a mano. Con `hand` ese lado tiene un interruptor fijo arriba: «Tecla»
 * muestra solo la tecla redonda y «Árbol morse» la cambia, en el mismo lugar,
 * por el aparato completo. Sin `hand` (Aprender) el aparato está siempre.
 * `about` es la guía de debajo (cómo se usa, alfabeto, preguntas frecuentes).
 *
 * En el celular la herramienta cabe en una pantalla: arriba lo de la página
 * (`mobileTop`) y abajo, fijo junto al pulgar, un panel con el muñeco, el
 * pulsador (`dockKey`) y un botón (`dockAction`, o el que abre el árbol en una
 * hoja). Al bajar a leer la guía, el panel se recoge.
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
  dockKey,
  dockReadout,
  dockAction,
  dockComposer,
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
  /** Celular: el pulsador del panel de abajo. */
  dockKey?: ReactNode;
  /** Celular: lo que muestra el globo del muñeco mientras suena o se teclea. */
  dockReadout?: ReactNode;
  /** Celular: el botón a la derecha del pulsador; sin él, con `hand`, abre el árbol. */
  dockAction?: ReactNode;
  /** Celular: la fila para escribir (Al aire), encima del pulsador. */
  dockComposer?: ReactNode;
  about?: ReactNode;
}) {
  const { t } = useI18n();
  const heading = t.station.headings[mode];
  const showTree = !hand || view === "tree";
  const isMobile = useIsMobile();
  // En el celular, con `hand`, el aparato no va al lado: se abre en una hoja.
  const treeInSheet = isMobile && !!hand;

  const [treeOpen, setTreeOpen] = useState(false);
  const openTree = () => {
    onViewChange?.("tree");
    setTreeOpen(true);
  };
  const closeTree = useCallback(() => {
    setTreeOpen(false);
    onViewChange?.("key");
  }, [onViewChange]);
  useEffect(() => {
    if (!treeInSheet) setTreeOpen(false);
  }, [treeInSheet]);

  // Leyendo la guía, el panel de abajo se recoge y queda un botón para volver.
  // Cuenta como leer cuando la herramienta ya salió casi toda de la pantalla:
  // que la guía asome debajo de una tarjeta corta (Al aire) no basta.
  const toolRef = useRef<HTMLDivElement>(null);
  const [reading, setReading] = useState(false);
  useEffect(() => {
    if (!isMobile) {
      setReading(false);
      return;
    }
    let raf = 0;
    const check = () => {
      raf = 0;
      const bottom = toolRef.current?.getBoundingClientRect().bottom ?? Infinity;
      setReading(!!about && bottom < window.innerHeight * 0.4);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [isMobile, about]);

  // El globo del muñeco: lo que dice en morse lo escribe él aquí, y mientras
  // habla esconde el texto de reposo.
  const sayRef = useRef<HTMLSpanElement>(null);
  const idleRef = useRef<HTMLSpanElement>(null);
  const readout = dockReadout != null && dockReadout !== false;

  // El alto del panel deja espacio al final de la página para que no tape nada.
  const dockRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const dock = dockRef.current;
    if (!dock) return;
    const root = document.documentElement;
    const measure = () => root.style.setProperty("--dock-h", `${dock.offsetHeight}px`);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(dock);
    return () => {
      ro.disconnect();
      root.style.removeProperty("--dock-h");
    };
  }, []);

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
      <div ref={toolRef} className="station-workspace">
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

      {dockKey && (
        <div ref={dockRef} className="station-dock" data-collapsed={reading ? "true" : undefined}>
          <div className="station-dock-tools">
            {dockComposer && <div className="station-dock-composer">{dockComposer}</div>}
            {/* El globo, con todo el ancho: lo que suena, lo que él dice o el texto de reposo */}
            <p className="dock-bubble" aria-hidden data-readout={readout ? "true" : undefined}>
              {readout && <span className="dock-readout">{dockReadout}</span>}
              <span ref={idleRef}>{t.station.dockIdle[mode]}</span>
              <span ref={sayRef} className="station-say" hidden />
            </p>
            <div className="station-dock-row">
              <StationEmblem variant="dock" words={t.station.emblemWords} sayRef={sayRef} idleRef={idleRef} />
              {dockKey}
              <div className="station-dock-action">
                {dockAction ??
                  (hand && (
                    <Tooltip label={t.station.view.treeTitle}>
                      <button type="button" className="station-dock-btn" onClick={openTree}>
                        <span><Network aria-hidden /></span>
                        {t.station.treeShort}
                      </button>
                    </Tooltip>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {reading && (
        <button
          type="button"
          className="station-back"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          {t.station.backToKey}
          <span><ArrowUp aria-hidden /></span>
        </button>
      )}
      {treeInSheet && (
        <Sheet
          open={treeOpen}
          onClose={closeTree}
          dark
          title={t.station.view.tree}
          hint={t.station.treeHint}
          closeLabel={t.station.close}
          className="sheet-tree"
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
