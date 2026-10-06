import type { Metadata, Viewport } from "next";
import { Barlow_Semi_Condensed, Doto, Inter } from "next/font/google";
import "./globals.css";

import { SiteNav } from "@/components/site-nav";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/lib/i18n/context";

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

// El idioma por defecto es inglés; la metadata renderizada en el servidor va en
// inglés y el título se ajusta al idioma elegido desde el cliente (ver
// LanguageProvider). Ver lib/i18n/en.ts para las cadenas.
export const metadata: Metadata = {
  title: "Morseo — Morse code translator",
  description:
    "Key or type Morse code and watch each letter light up its path on the Morse tree. Learn it by ear and send it live.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f4f6" },
    { media: "(prefers-color-scheme: dark)", color: "#161617" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
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
            <LanguageProvider>
              <SiteNav />
              <main className="station-main">
                {children}
              </main>
            </LanguageProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
