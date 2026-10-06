"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AudioLines, Ear, RadioTower } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import { ROUTES, pageOf } from "@/lib/i18n/routes";
import { ModeToggle } from "@/components/mode-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { GitHubButton } from "@/components/github-link";
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
      <span className="station-sidebar-foot"><i aria-hidden />{t.station.footer}</span>
    </header>
    <nav aria-label={t.nav.main} className="station-mobile-nav">
      {links.map(({ page, href, label, tip, icon: Icon }) => <Tooltip key={href} label={tip}>
        <Link href={href} aria-current={active(page) ? "page" : undefined}>
          <Icon aria-hidden /><span>{label}</span>
        </Link>
      </Tooltip>)}
    </nav>
  </>;
}