import type { Metadata, Viewport } from "next";
import { Barlow_Semi_Condensed, Doto, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "@/app/globals.css";

import { LINKEDIN_URL } from "@/components/github-link";
import { SiteNav } from "@/components/site-nav";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/lib/i18n/context";
import type { Locale } from "@/lib/i18n/config";
import { SITE_URL } from "@/lib/i18n/routes";

// Barlow: letra de rotulado industrial, como la de los paneles de equipos.
const barlow = Barlow_Semi_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-barlow",
});

// Inter: la letra de la interfaz; con el eje óptico, los títulos grandes se
// ven más cerrados y los textos chicos más abiertos.
const inter = Inter({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-inter",
});

// Doto: matriz de puntos para la pantalla del aparato.
const doto = Doto({
  subsets: ["latin"],
  axes: ["ROND"],
  variable: "--font-doto",
});

/** Lo que comparten las páginas de los dos idiomas; cada una pone su título. */
export const siteMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "Morseo",
  authors: [{ name: "Alejandro Montoya", url: LINKEDIN_URL }],
  creator: "Alejandro Montoya",
};

export const siteViewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f4f6" },
    { media: "(prefers-color-scheme: dark)", color: "#161617" },
  ],
};

/**
 * El documento completo de una página. Hay una raíz por idioma (app/(en) y
 * app/es) para que el servidor entregue `<html lang>` y los textos ya en el
 * idioma de la dirección.
 */
export function SiteShell({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${inter.variable} ${barlow.variable} ${doto.variable}`}
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <TooltipProvider>
            <LanguageProvider locale={locale}>
              <SiteNav />
              <main className="station-main">
                {children}
              </main>
            </LanguageProvider>
          </TooltipProvider>
        </ThemeProvider>
        {/* Visitas por página, país, equipo y de dónde llegan: solo se ven en el panel de Vercel */}
        <Analytics />
      </body>
    </html>
  );
}
