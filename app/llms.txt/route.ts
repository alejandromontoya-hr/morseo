import { REPO_URL } from "@/components/github-link";
import { content } from "@/lib/content";
import { LOCALES } from "@/lib/i18n/config";
import { PAGES, ROUTES } from "@/lib/i18n/routes";
import { MORSE } from "@/lib/morse";
import { absoluteUrl } from "@/lib/seo";

// Resumen del sitio para asistentes de IA (formato llmstxt.org): qué es
// Morseo, datos concretos y las páginas de cada idioma. Se arma con los mismos
// textos de las páginas, así no se desactualiza.
export const dynamic = "force-static";

const SECTION_TITLE = { en: "English", es: "Español" } as const;

export function GET() {
  const pages = LOCALES.map((locale) => {
    const links = PAGES.map((page) => {
      const { title, description } = content[locale].meta[page];
      return `- [${title.split(" | ")[0]}](${absoluteUrl(ROUTES[locale][page])}): ${description}`;
    });
    return `## ${SECTION_TITLE[locale]}\n\n${links.join("\n")}`;
  });

  // Letras, luego números y luego signos (las claves numéricas de MORSE se
  // ordenarían primero).
  const chars = Object.keys(MORSE);
  const alphabet = [
    ...chars.filter((c) => /^[A-ZÑ]$/.test(c)),
    ...chars.filter((c) => /^[0-9]$/.test(c)),
    ...chars.filter((c) => !/^[A-ZÑ0-9]$/.test(c)),
  ]
    .map((c) => `${c} ${MORSE[c]}`)
    .join(" · ");

  const body = `# Morseo

> ${content.en.appDescription} Available in English and Spanish at ${absoluteUrl("/")}.

- Free, runs in the browser on a phone or a computer, with no sign-up and nothing to install.
- Translator: text to Morse code with sound (600 Hz tone at 8, 12 or 18 words per minute), and Morse code to text by keying it with a tap or the space bar.
- Morse tree: every letter lights up its path of dots and dashes from the antenna.
- Learning: by ear, a few letters at a time (Koch method), starting with E and T, with memory tricks for the harder letters.
- On air: 6 live channels to send Morse code to other people in real time; one person transmits at a time, in turns of up to 30 seconds. It works over the internet, so no radio or license is needed.
- Made by Alejandro Montoya. Source code: ${REPO_URL}

${pages.join("\n\n")}

## International Morse code

${alphabet}
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
