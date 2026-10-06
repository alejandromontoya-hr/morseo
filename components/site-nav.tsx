"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AudioLines, Ear, Ellipsis, RadioTower } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import { ROUTES, pageOf } from "@/lib/i18n/routes";
import { ModeToggle, ThemeChoice } from "@/components/mode-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { GitHubButton, GitHubMark, LINKEDIN_URL, LinkedInMark, REPO_URL } from "@/components/github-link";
import { Sheet } from "@/components/ui/sheet";
import { Tooltip } from "@/components/ui/tooltip";

export function Logo({ className }: { className?: string }) {
  return <span aria-hidden className={cn("station-logo", className)}><i /><i /><i /></span>;
}

export function SiteNav() {
  const pathname = usePathname();
  const { locale, t } = useI18n();
  const routes = ROUTES[locale];
  const links = [
    { page: "translate", href: routes.translate, label: t.nav.translate, tip: t.tips.translate, icon: AudioLines },
    { page: "learn", href: routes.learn, label: t.nav.learn, tip: t.tips.learn, icon: Ear },
    { page: "radio", href: routes.radio, label: t.nav.radio, tip: t.tips.radio, icon: RadioTower },
  ] as const;
  const current = pageOf(pathname);
  const active = (page: string) => current === page;
  // Celular: idioma, tema y enlaces viven en una hoja detrás de «⋯».
  const [settingsOpen, setSettingsOpen] = useState(false);
  // Su alto real (cambia con el tamaño de letra del celular): el panel de abajo
  // lo usa para que el pulsador nunca quede encima de la cápsula.
  const mobileNavRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const nav = mobileNavRef.current;
    if (!nav) return;
    const root = document.documentElement;
    const measure = () => root.style.setProperty("--nav-h", `${nav.offsetHeight}px`);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(nav);
    return () => ro.disconnect();
  }, []);
  return <>
    <header className="station-sidebar">
      <Tooltip label={t.tips.home} side="bottom">
        <Link href={routes.translate} aria-label={t.nav.home} className="station-brand"><Logo /><span>morseo</span></Link>
      </Tooltip>
      <p className="station-nav-caption">{t.station.personalStation}</p>
      <nav aria-label={t.nav.main} className="station-desktop-nav">
        {links.map(({ page, href, label, tip, icon: Icon }) => <Tooltip key={href} label={tip} side="bottom">
          <Link href={href} aria-current={active(page) ? "page" : undefined}>
            <Icon aria-hidden /><span>{label}</span>
          </Link>
        </Tooltip>)}
      </nav>
      <div className="station-preferences"><GitHubButton label={t.nav.repo} /><LanguageToggle /><ModeToggle /></div>
      <button type="button" className="station-more" aria-label={t.station.more} onClick={() => setSettingsOpen(true)}>
        <Ellipsis aria-hidden />
      </button>
      <span className="station-sidebar-foot"><i aria-hidden />{t.station.footer}</span>
    </header>
    <Sheet open={settingsOpen} onClose={() => setSettingsOpen(false)} title={t.station.settings} closeLabel={t.station.close}>
      <div className="settings-row">
        <span>{t.language.label}</span>
        <LanguageToggle />
      </div>
      <div className="settings-row">
        <span>{t.station.theme}</span>
        <ThemeChoice />
      </div>
      <div className="settings-row settings-links">
        <span>{t.station.openSource}</span>
        <div>
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" aria-label={t.nav.repo}><GitHubMark /></a>
          {LINKEDIN_URL && (
            <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" aria-label={t.station.linkedin}><LinkedInMark /></a>
          )}
        </div>
      </div>
    </Sheet>
    <nav ref={mobileNavRef} aria-label={t.nav.main} className="station-mobile-nav">
      {links.map(({ page, href, label, tip, icon: Icon }) => <Tooltip key={href} label={tip}>
        <Link href={href} aria-current={active(page) ? "page" : undefined}>
          <Icon aria-hidden /><span>{label}</span>
        </Link>
      </Tooltip>)}
    </nav>
  </>;
}