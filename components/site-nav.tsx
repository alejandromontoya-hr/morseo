"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AudioLines, Ear, RadioTower } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import { ModeToggle } from "@/components/mode-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { GitHubButton } from "@/components/github-link";
import { Tooltip } from "@/components/ui/tooltip";

export function Logo({ className }: { className?: string }) {
  return <span aria-hidden className={cn("station-logo", className)}><i /><i /><i /></span>;
}

export function SiteNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  const links = [
    { href: "/", label: t.nav.translate, tip: t.tips.translate, icon: AudioLines },
    { href: "/learn", label: t.nav.learn, tip: t.tips.learn, icon: Ear },
    { href: "/radio", label: t.nav.radio, tip: t.tips.radio, icon: RadioTower },
  ];
  const active = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);
  return <>
    <header className="station-sidebar">
      <Tooltip label={t.tips.home} side="bottom">
        <Link href="/" aria-label={t.nav.home} className="station-brand"><Logo /><span>morseo</span></Link>
      </Tooltip>
      <p className="station-nav-caption">{t.station.personalStation}</p>
      <nav aria-label={t.nav.main} className="station-desktop-nav">
        {links.map(({ href, label, tip, icon: Icon }) => <Tooltip key={href} label={tip} side="bottom">
          <Link href={href} aria-current={active(href) ? "page" : undefined}>
            <Icon aria-hidden /><span>{label}</span>
          </Link>
        </Tooltip>)}
      </nav>
      <div className="station-preferences"><GitHubButton label={t.nav.repo} /><LanguageToggle /><ModeToggle /></div>
      <span className="station-sidebar-foot"><i aria-hidden />{t.station.footer}</span>
    </header>
    <nav aria-label={t.nav.main} className="station-mobile-nav">
      {links.map(({ href, label, tip, icon: Icon }) => <Tooltip key={href} label={tip}>
        <Link href={href} aria-current={active(href) ? "page" : undefined}>
          <Icon aria-hidden /><span>{label}</span>
        </Link>
      </Tooltip>)}
    </nav>
  </>;
}