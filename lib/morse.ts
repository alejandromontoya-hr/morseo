export const MORSE: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.",
  H: "....", I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.",
  O: "---", P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-",
  V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..", "Ñ": "--.--",
  "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-",
  "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "!": "-.-.--", "/": "-..-.",
  "(": "-.--.", ")": "-.--.-", "&": ".-...", ":": "---...", ";": "-.-.-.",
  "=": "-...-", "+": ".-.-.", "-": "-....-", "_": "..--.-", '"': ".-..-.",
  "@": ".--.-.", "'": ".----.",
};

export const REV: Record<string, string> = {};
for (const k in MORSE) REV[MORSE[k]] = k;

export function normalize(s: string): string {
  return s
    .replace(/[áàäâã]/gi, "a")
    .replace(/[éèëê]/gi, "e")
    .replace(/[íìïî]/gi, "i")
    .replace(/[óòöôõ]/gi, "o")
    .replace(/[úùüû]/gi, "u");
}

export function encode(t: string): string {
  const words = normalize(t).toUpperCase().split(/\s+/).filter(Boolean);
  return words
    .map((w) => [...w].map((c) => MORSE[c] || "").filter(Boolean).join(" "))
    .join(" / ");
}

export function decode(m: string): string {
  const words = m.trim().split(/\s*\/\s*/).filter(Boolean);
  return words
    .map((w) => w.split(/\s+/).filter(Boolean).map((c) => REV[c] || "").join(""))
    .join(" ");
}

/**
 * Cuánto dura una señal morse a una velocidad (PPM), en ms: punto 1 unidad,
 * raya 3, silencio entre símbolos 1, entre letras 3 y entre palabras 7. Una
 * barra al inicio (letra en directo que empieza palabra) suma su silencio.
 */
export function morseMs(morse: string, wpm: number): number {
  let units = morse.trim().startsWith("/") ? 7 : 0;
  const words = morse.trim().split(/\s*\/\s*/).filter(Boolean);
  words.forEach((word, wi) => {
    const letters = word.split(/\s+/).filter(Boolean);
    letters.forEach((letter, li) => {
      for (let i = 0; i < letter.length; i++) units += (letter[i] === "-" ? 3 : 1) + (i < letter.length - 1 ? 1 : 0);
      if (li < letters.length - 1) units += 3;
    });
    if (wi < words.length - 1) units += 7;
  });
  return (units * 1200) / wpm;
}
