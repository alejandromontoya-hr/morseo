import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/i18n/routes";

// Abierto para todos los buscadores y asistentes de IA (Google, Bing, ChatGPT,
// Claude, Perplexity…). Solo se cierra /api/, que son los canales en vivo y no
// tienen nada que leer.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: "/api/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
