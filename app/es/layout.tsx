import { SiteShell, siteMetadata, siteViewport } from "@/components/site-shell";

// Raíz de las páginas en español: /es, /es/aprender y /es/al-aire.
export const metadata = siteMetadata;
export const viewport = siteViewport;

export default function SpanishLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell locale="es">{children}</SiteShell>;
}
