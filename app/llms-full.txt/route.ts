import { content } from "@/lib/content";
import { LOCALES, type Locale } from "@/lib/i18n/config";
import { ROUTES } from "@/lib/i18n/routes";
import { MORSE } from "@/lib/morse";
import { cwAbbr, learnGroups, mnemonics, prosigns } from "@/lib/morse-learn";
import { absoluteUrl } from "@/lib/seo";

// Todo el texto de las guías y preguntas frecuentes de las 6 páginas en un
// solo archivo, para que un asistente de IA lo lea de una vez sin abrir cada
// página. Sale de los mismos textos de las páginas, así no se desactualiza.
export const dynamic = "force-static";

const LANGUAGE = { en: "English", es: "Español" } as const;

const steps = (items: string[]) => items.map((s, i) => `${i + 1}. ${s}`).join("\n");
const faq = (items: { q: string; a: string }[]) => items.map(({ q, a }) => `### ${q}\n\n${a}`).join("\n\n");
const morse = (chars: string[]) => chars.map((c) => `${c} ${MORSE[c]}`).join(" · ");

function pageHeading(locale: Locale, page: keyof typeof ROUTES.en) {
  const { title, description } = content[locale].meta[page];
  return `## ${title.split(" | ")[0]}\n\n${absoluteUrl(ROUTES[locale][page])}\n\n${description}`;
}

function guides(locale: Locale): string {
  const c = content[locale];
  // Mismo orden que la tabla de la página: la Ñ después de la N (solo en
  // español) y los números del 1 al 0, como en un teclado.
  const az = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const letters = locale === "es" ? [...az.slice(0, 14), "Ñ", ...az.slice(14)] : az;
  const numbers = "1234567890".split("");
  const punctuation = Object.keys(MORSE).filter((k) => !/^[A-ZÑ0-9]$/.test(k));
  const { groups } = c.translate;

  const translate = `${pageHeading(locale, "translate")}

### ${c.translate.howTitle}

${steps(c.translate.how)}

### ${c.translate.alphabetTitle}

${c.translate.alphabetLead}

- ${groups.letters}: ${morse(letters)}
- ${groups.numbers}: ${morse(numbers)}
- ${groups.punctuation}: ${morse(punctuation)}

${faq(c.translate.faq)}`;

  const learn = `${pageHeading(locale, "learn")}

### ${c.learn.orderTitle}

${c.learn.orderLead}

${learnGroups(locale)
  .map((g) => `- ${g.title}: ${morse(g.chars)}. ${g.note}`)
  .join("\n")}

### ${c.learn.tricksTitle}

${c.learn.tricksLead}

${mnemonics(locale)
  .map((m) => `- ${m.letter} (${MORSE[m.letter]}): ${m.tip}`)
  .join("\n")}

${faq(c.learn.faq)}`;

  const radio = `${pageHeading(locale, "radio")}

### ${c.radio.howTitle}

${steps(c.radio.how)}

### ${c.radio.abbrTitle}

${c.radio.abbrLead}

${cwAbbr(locale)
  .map((a) => `- ${a.abbr}: ${a.meaning}`)
  .join("\n")}

### ${c.radio.prosignsTitle}

${c.radio.prosignsLead}

${prosigns(locale)
  .map((p) => `- ${p.sign} (${p.morse}): ${p.meaning}`)
  .join("\n")}

${faq(c.radio.faq)}`;

  return `# ${LANGUAGE[locale]}\n\n${[translate, learn, radio].join("\n\n")}`;
}

export function GET() {
  const body = `# Morseo — full text

> ${content.en.appDescription} Summary: ${absoluteUrl("/llms.txt")}

${LOCALES.map(guides).join("\n\n")}
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
