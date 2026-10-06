import { content } from "@/lib/content";
import type { Locale } from "@/lib/i18n/config";
import { MORSE } from "@/lib/morse";
import { cwAbbr, learnGroups, mnemonics, prosigns } from "@/lib/morse-learn";
import { MorseGlyphs } from "@/components/morse-glyphs";
import { GuideFaq, GuideSection, GuideSteps, MorseTable } from "@/components/guide/guide";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const NUMBERS = "1234567890".split("");
const PUNCTUATION = Object.keys(MORSE).filter((k) => !/^[A-ZÑ0-9]$/.test(k));

/** Traducir: cómo se usa, el alfabeto morse completo y preguntas frecuentes. */
export function TranslateGuide({ locale }: { locale: Locale }) {
  const c = content[locale];
  const g = c.translate;
  // La Ñ es del español; en inglés el alfabeto va de la A a la Z.
  const letters = locale === "es" ? [...LETTERS.slice(0, 14), "Ñ", ...LETTERS.slice(14)] : LETTERS;
  return (
    <>
      <GuideSection title={g.howTitle}>
        <GuideSteps items={g.how} />
      </GuideSection>
      <GuideSection title={g.alphabetTitle} lead={g.alphabetLead}>
        <MorseTable chars={letters} label={g.groups.letters} />
        <MorseTable chars={NUMBERS} label={g.groups.numbers} />
        <MorseTable chars={PUNCTUATION} label={g.groups.punctuation} />
      </GuideSection>
      <GuideFaq title={c.faqTitle} items={g.faq} />
    </>
  );
}

/** Aprender: el orden de estudio, los trucos por letra y preguntas frecuentes. */
export function LearnGuide({ locale }: { locale: Locale }) {
  const c = content[locale];
  const g = c.learn;
  return (
    <>
      <GuideSection title={g.orderTitle} lead={g.orderLead}>
        {learnGroups(locale).map((group) => (
          <div key={group.title}>
            <MorseTable chars={group.chars} label={group.title} />
            <p className="station-guide-note">{group.note}</p>
          </div>
        ))}
      </GuideSection>
      <GuideSection title={g.tricksTitle} lead={g.tricksLead}>
        <dl className="station-guide-terms">
          {mnemonics(locale).map((m) => (
            <div key={m.letter}>
              <dt>
                {m.letter}
                <MorseGlyphs morse={MORSE[m.letter]} size={6} />
              </dt>
              <dd>{m.tip}</dd>
            </div>
          ))}
        </dl>
      </GuideSection>
      <GuideFaq title={c.faqTitle} items={g.faq} />
    </>
  );
}

/** Al aire: cómo se transmite, abreviaturas, prosignos y preguntas frecuentes. */
export function RadioGuide({ locale }: { locale: Locale }) {
  const c = content[locale];
  const g = c.radio;
  return (
    <>
      <GuideSection title={g.howTitle}>
        <GuideSteps items={g.how} />
      </GuideSection>
      <GuideSection title={g.abbrTitle} lead={g.abbrLead}>
        <dl className="station-guide-terms">
          {cwAbbr(locale).map((a) => (
            <div key={a.abbr}>
              <dt>{a.abbr}</dt>
              <dd>{a.meaning}</dd>
            </div>
          ))}
        </dl>
      </GuideSection>
      <GuideSection title={g.prosignsTitle} lead={g.prosignsLead}>
        <dl className="station-guide-terms">
          {prosigns(locale).map((p) => (
            <div key={p.sign}>
              <dt>
                {p.sign}
                <MorseGlyphs morse={p.morse} size={6} />
              </dt>
              <dd>
                <code>{p.morse}</code> {p.meaning}
              </dd>
            </div>
          ))}
        </dl>
      </GuideSection>
      <GuideFaq title={c.faqTitle} items={g.faq} />
    </>
  );
}
