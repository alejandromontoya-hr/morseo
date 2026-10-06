// Datos para APRENDER morse (no solo para codificar), ahora bilingües. El motor
// de codificación vive en lib/morse.ts; aquí va todo lo pedagógico: orden de
// estudio, trucos mnemotécnicos, abreviaturas y prosignos. Cada colección es
// una función que recibe el idioma. Las letras, los patrones morse y las siglas
// (CQ, DE…) son neutrales; solo cambian las explicaciones.

import type { Locale } from "@/lib/i18n/config";

function tr(locale: Locale, en: string, es: string): string {
  return locale === "es" ? es : en;
}

/* ───────────────────── Orden de aprendizaje (grupos) ────────────────────── */

export type LearnGroup = {
  title: string;
  /** Letras/números de este bloque, en el orden recomendado. */
  chars: string[];
  note: string;
};

/**
 * No se aprende el alfabeto de la A a la Z: se aprende del sonido más simple al
 * más complejo, sumando pocas letras a la vez (idea del método Koch). Con los
 * dos primeros grupos ya puedes formar palabras reales.
 */
export function learnGroups(locale: Locale): LearnGroup[] {
  const p = (en: string, es: string) => tr(locale, en, es);
  return [
    {
      title: p("1 · The essentials", "1 · Las esenciales"),
      chars: ["E", "T", "A", "N", "I", "M"],
      note: p(
        "A single dot (E) and a single dash (T), and their short combinations. The most frequent letters of the language.",
        "Un solo punto (E) y una sola raya (T), y sus combinaciones cortas. Las letras más frecuentes del idioma."
      ),
    },
    {
      title: p("2 · Whole words", "2 · Palabras completas"),
      chars: ["S", "O", "R", "U", "D", "K"],
      note: p(
        "With these you already sound out “SEA”, “SUN”, “RADIO”, “SOS”… Start reading words, not single letters.",
        "Con estas ya suenas «MAR», «SUR», «RADIO», «SOS»… Empieza a leer palabras, no letras sueltas."
      ),
    },
    {
      title: p("3 · The rest of the vowels and common ones", "3 · El resto de vocales y comunes"),
      chars: ["L", "C", "P", "G", "H", "W"],
      note: p(
        "Sounds of three and four elements. Here the ear already recognizes rhythms, it doesn't count dots.",
        "Sonidos de tres y cuatro elementos. Aquí el oído ya reconoce ritmos, no cuenta puntos."
      ),
    },
    {
      title: p("4 · The hard ones", "4 · Las difíciles"),
      chars: ["F", "B", "V", "J", "Q", "X", "Y", "Z", "Ñ"],
      note: p(
        "The least frequent and the longest. Leave them for the end; they show up rarely.",
        "Las menos frecuentes y las más largas. Déjalas para el final; aparecen poco."
      ),
    },
    {
      title: p("5 · Numbers", "5 · Números"),
      chars: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
      note: p(
        "They follow a very regular pattern: 1 to 5 start with dots; 6 to 0, with dashes.",
        "Siguen un patrón muy regular: del 1 al 5 empiezan con puntos; del 6 al 0, con rayas."
      ),
    },
  ];
}

/* ───────────────────────── Trucos mnemotécnicos ─────────────────────────── */

export type Mnemonic = {
  letter: string;
  /** Frase donde las sílabas fuertes = raya y las débiles = punto. */
  tip: string;
};

/**
 * Muletas para arrancar. Son andamios: sírvete de ellos al principio y
 * abandónalos cuando reconozcas el sonido directo, porque a velocidad real no
 * da tiempo a «traducir» la frase.
 */
export function mnemonics(locale: Locale): Mnemonic[] {
  const p = (en: string, es: string) => tr(locale, en, es);
  return [
    { letter: "A", tip: p("“a-BOUT” — di-dah.", "«a-LLÁ» — di-dah.") },
    { letter: "B", tip: p("“BOIL-ing wa-ter” — dah-di-di-dit.", "«BOM-ba-de-a» — dah-di-di-dit.") },
    { letter: "C", tip: p("“CO-ca-CO-la” — dah-di-dah-dit.", "«CO-ca-CO-la» — dah-di-dah-dit.") },
    { letter: "F", tip: p("“I-must-HUR-ry” — di-di-dah-dit.", "«fu-si-LA-do» — di-di-dah-dit.") },
    { letter: "G", tip: p("“GOOD-GRA-vy” — dah-dah-dit.", "«GRAN-DE-so» — dah-dah-dit.") },
    { letter: "J", tip: p("“to-JUMP-JUMP-JUMP” — di-dah-dah-dah.", "«ja-BÓN-BÓN-BÓN» — di-dah-dah-dah.") },
    { letter: "K", tip: p("“GO-a-HEAD” — dah-di-dah. “K” = go ahead.", "«KA-me-RÁ» — dah-di-dah. La «K» = adelante.") },
    { letter: "L", tip: p("“to-LOOK-a-round” — di-dah-di-dit.", "«la-BO-la-da» — di-dah-di-dit.") },
    { letter: "N", tip: p("“NA-vy” — dah-dit.", "«NO-ta» — dah-dit.") },
    { letter: "O", tip: p("“OLD-MO-THER” — dah-dah-dah. Three dashes, easy.", "«O-SÍ-O» — dah-dah-dah. Tres rayas, fácil.") },
    { letter: "P", tip: p("“a-POINT-LESS-plea” — di-dah-dah-dit.", "«pe-RRO-RRO-pe» — di-dah-dah-dit.") },
    { letter: "Q", tip: p("“GOD-SAVE-the-QUEEN” — dah-dah-di-dah.", "«QUÉ-QUE-ri-QUÉ» — dah-dah-di-dah.") },
    { letter: "R", tip: p("“ro-TA-tion” — di-dah-dit. “R” = received.", "«re-MÓ-la» — di-dah-dit. La «R» = recibido.") },
    { letter: "S", tip: p("“sa-la-mi” — di-di-dit. Three dots.", "«sa-la-do» — di-di-dit. Tres puntos.") },
    { letter: "V", tip: p("“did-she-like-IT” — di-di-di-dah. The “V” of victory (Beethoven).", "«ve-ve-ve-VÉN» — di-di-di-dah. El «V» de la victoria (Beethoven).") },
    { letter: "W", tip: p("“the-WILD-WEST” — di-dah-dah.", "«wa-GÓN-GÓN» — di-dah-dah.") },
    { letter: "X", tip: p("“X-marks-the-SPOT” — dah-di-di-dah.", "«XÓ-fo-fo-RÁ» — dah-di-di-dah.") },
  ];
}

/* ─────────────────────── Abreviaturas y jerga CW ────────────────────────── */

export type CwAbbr = { abbr: string; meaning: string };

/**
 * En morse se escribe poco y rápido: por eso se usan abreviaturas fijas. Muchas
 * saltaron después a la radio por voz.
 */
export function cwAbbr(locale: Locale): CwAbbr[] {
  const p = (en: string, es: string) => tr(locale, en, es);
  return [
    { abbr: "CQ", meaning: p("General call: “anyone listening?”.", "Llamada general: «¿alguien a la escucha?».") },
    { abbr: "DE", meaning: p("“From”: separates the called callsign from the calling one. CQ DE HK3ABC.", "«De parte de»: separa el indicativo llamado del que llama. CQ DE HK3ABC.") },
    { abbr: "K", meaning: p("“Go ahead, over”: invites anyone to reply.", "«Adelante, cambio»: invita a cualquiera a responder.") },
    { abbr: "R", meaning: p("“Received”: I got everything correctly.", "«Recibido»: capté todo correctamente.") },
    { abbr: "73", meaning: p("“Best regards / a hug”. The classic sign-off.", "«Saludos / un abrazo». La despedida clásica.") },
    { abbr: "88", meaning: p("“Hugs and kisses”: affectionate, for family.", "«Besos y abrazos»: cariñoso, para la familia.") },
    { abbr: "TU", meaning: p("“Thank you”.", "«Gracias» (thank you).") },
    { abbr: "OM", meaning: p("“Old man”: buddy, any male operator.", "«Old man»: colega, cualquier operador varón.") },
    { abbr: "YL", meaning: p("“Young lady”: a female operator.", "«Young lady»: operadora.") },
    { abbr: "PSE", meaning: p("“Please”.", "«Por favor» (please).") },
    { abbr: "AGN", meaning: p("“Again / repeat”.", "«De nuevo / repite» (again).") },
    { abbr: "FB", meaning: p("“Excellent, very good” (fine business).", "«Excelente, muy bien» (fine business).") },
    { abbr: "HI", meaning: p("The laugh in Morse: “ha-ha”.", "La risa en morse: «ja-ja».") },
    { abbr: "WX", meaning: p("“The weather”.", "«El clima» (weather).") },
    { abbr: "CUL", meaning: p("“See you later”.", "«Nos vemos luego» (see you later).") },
    { abbr: "ES", meaning: p("“And” (the & sign).", "«Y» (el signo &).") },
  ];
}

/* ───────────────────────────── Prosignos ───────────────────────────────── */

export type Prosign = {
  sign: string;
  /** Morse SIN espacios: se envía como un único grupo continuo. */
  morse: string;
  meaning: string;
};

/**
 * Los prosignos (signos de procedimiento) son grupos que se envían pegados,
 * como una sola letra, para controlar la conversación. Se escriben con una raya
 * encima para indicar que van unidos.
 */
export function prosigns(locale: Locale): Prosign[] {
  const p = (en: string, es: string) => tr(locale, en, es);
  return [
    { sign: "SOS", morse: "...---...", meaning: p("Help. Grave danger. Chosen for its unmistakable pattern, it's not an acronym for anything.", "Auxilio. Peligro grave. Se eligió por lo inconfundible de su patrón, no es sigla de nada.") },
    { sign: "AR", morse: ".-.-.", meaning: p("End of message (+). “I've finished sending this”.", "Fin del mensaje (+). «Terminé de enviar esto».") },
    { sign: "SK", morse: "...-.-", meaning: p("End of contact. “Closing, until next time”.", "Fin del contacto. «Cierro, hasta la próxima».") },
    { sign: "BT", morse: "-...-", meaning: p("Separator / new paragraph (=). A pause within the message.", "Separador / nuevo párrafo (=). Una pausa dentro del mensaje.") },
    { sign: "KN", morse: "-.--.", meaning: p("“Go ahead, YOU only”: invites a specific station to reply.", "«Adelante SOLO tú»: invita a responder a una estación concreta.") },
    { sign: "AS", morse: ".-...", meaning: p("“Wait a moment” (wait).", "«Espera un momento» (wait).") },
    { sign: "CT", morse: "-.-.-", meaning: p("“Attention, I'm starting”: start-of-message signal.", "«Atención, empiezo»: señal de arranque de un mensaje.") },
    { sign: "Error", morse: "........", meaning: p("Eight dots in a row: “I made a mistake, ignore the last word”.", "Ocho puntos seguidos: «me equivoqué, ignora la última palabra».") },
  ];
}
