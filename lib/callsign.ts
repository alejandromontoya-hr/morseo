const PHONETIC = [
  "Alfa", "Bravo", "Charlie", "Delta", "Echo", "Foxtrot", "Golf", "Hotel",
  "India", "Julieta", "Kilo", "Lima", "Mike", "November", "Oscar", "Papa",
  "Quebec", "Romeo", "Sierra", "Tango", "Uniform", "Victor", "Whisky",
  "Xray", "Yanqui", "Zulú",
];

/** Indicativo por defecto tipo alfabeto radiofónico, p. ej. "Bravo-42". */
export function randomCallsign(): string {
  const w = PHONETIC[Math.floor(Math.random() * PHONETIC.length)];
  const n = Math.floor(Math.random() * 90) + 10;
  return `${w}-${n}`;
}
