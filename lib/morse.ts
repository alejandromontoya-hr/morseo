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
