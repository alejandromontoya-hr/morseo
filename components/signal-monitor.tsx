"use client";

import { useI18n } from "@/lib/i18n/context";
import { Tooltip } from "@/components/ui/tooltip";

/** Diagrama del mensaje actual con las duraciones morse 1:3:7. */
export function SignalMonitor({ morse, wpm, active = false }: { morse: string; wpm: number; active?: boolean }) {
  const { t } = useI18n();
  let x = 0;
  let path = "M0 42";
  for (const token of morse.trim().split(/\s+/).filter(Boolean).slice(0, 24)) {
    if (token === "/") { x += 4; path += ` H${x}`; continue; }
    for (const symbol of token) {
      const length = symbol === "-" ? 3 : 1;
      path += ` V16 H${x + length} V42 H${x + length + 1}`;
      x += length + 1;
    }
    x += 2;
    path += ` H${x}`;
  }
  const width = Math.max(80, x + 6);
  path += ` H${width}`;
  return <div className="station-monitor" data-active={active}>
    <div>
      <Tooltip label={t.tips.signal}><span>{t.station.signal}</span></Tooltip>
      <Tooltip label={t.tips.pitch}><span>600 Hz / {t.common.wpm(wpm)}</span></Tooltip>
    </div>
    <svg viewBox={`0 0 ${width} 58`} preserveAspectRatio="none" aria-hidden>
      <path className="monitor-grid" d={`M0 16H${width}M0 29H${width}M0 42H${width}`} />
      <path d={path} vectorEffect="non-scaling-stroke" />
    </svg>
  </div>;
}
