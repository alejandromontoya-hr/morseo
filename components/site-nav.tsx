"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AudioLines, Ear, RadioTower } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import { ModeToggle } from "@/components/mode-toggle";
import { LanguageToggle } from "@/components/language-toggle";

export function Logo({ className }: { className?: string }) {
  return <span aria-hidden className={cn("station-logo", className)}><i /><i /><i /></span>;
}

export function SiteNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  const links = [
    { href: "/", label: t.nav.translate, icon: AudioLines },
    { href: "/learn", label: t.nav.learn, icon: Ear },
    { href: "/radio", label: t.nav.radio, icon: RadioTower },
  ];
  const active = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);
  return <>
    <header className="station-sidebar">
      <Link href="/" aria-label={t.nav.home} className="station-brand"><Logo /><span>morseo</span></Link>
      <p className="station-nav-caption">{t.station.personalStation}</p>
      <nav aria-label={t.nav.main} className="station-desktop-nav">
        {links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={active(href) ? "page" : undefined}>
          <Icon aria-hidden /><span>{label}</span>
        </Link>)}
      </nav>
      <div className="station-preferences"><LanguageToggle /><ModeToggle /></div>
      <span className="station-sidebar-foot"><i aria-hidden />{t.station.footer}</span>
    </header>
    <nav aria-label={t.nav.main} className="station-mobile-nav">
      {links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={active(href) ? "page" : undefined}>
        <Icon aria-hidden /><span>{label}</span>
      </Link>)}
    </nav>
  </>;
}