import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/i18n/routes";

/** Buscadores con IA: se nombran para dejar explícito que pueden leer el sitio. */
const aiBots = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Amazonbot",
  "Meta-ExternalAgent",
  "CCBot",
  "cohere-ai",
  "MistralAI-User",
  "DuckAssistBot",
];

// Abierto para todos los buscadores y asistentes de IA. Solo se cierra /api/,
// que son los canales en vivo y no tienen nada que leer.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: "/api/" },
      { userAgent: aiBots, allow: "/", disallow: "/api/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
