// El árbol morse, dibujado como en el llavero electrónico: la antena arriba al
// centro y, desde ella, cada punto (círculo) y cada raya (rectángulo) hasta
// llegar a la letra. La figura de cada nodo es el último símbolo de su código:
// la E (·) es un círculo; la A (·–), un rectángulo.
//
// Las posiciones van en una rejilla de 8 columnas × 7 filas y repiten el
// trazado del aparato: puntos hacia la derecha, rayas hacia la izquierda y las
// ramas bajando por el centro.

export type Side = "top" | "bottom" | "left" | "right";

export type TreeNode = {
  letter: string;
  code: string;
  col: number;
  row: number;
  /** Lado donde va la letra serigrafiada, lejos de las pistas. */
  label: Side;
};

export const ROOT = { col: 3, row: 0 };

export const TREE_COLS = 8;
export const TREE_ROWS = 7;

export const TREE: TreeNode[] = [
  // Fila superior: rayas a la izquierda de la antena, puntos a la derecha
  { letter: "T", code: "-", col: 2, row: 0, label: "top" },
  { letter: "M", code: "--", col: 1, row: 0, label: "top" },
  { letter: "O", code: "---", col: 0, row: 0, label: "top" },
  { letter: "E", code: ".", col: 4, row: 0, label: "top" },
  { letter: "I", code: "..", col: 5, row: 0, label: "top" },
  { letter: "S", code: "...", col: 6, row: 0, label: "top" },
  { letter: "H", code: "....", col: 7, row: 0, label: "top" },

  // Rama de la M
  { letter: "G", code: "--.", col: 1, row: 1, label: "right" },
  { letter: "Q", code: "--.-", col: 0, row: 1, label: "bottom" },
  { letter: "Z", code: "--..", col: 1, row: 2, label: "right" },

  // Rama de la T
  { letter: "N", code: "-.", col: 2, row: 3, label: "right" },
  { letter: "K", code: "-.-", col: 1, row: 3, label: "top" },
  { letter: "Y", code: "-.--", col: 0, row: 3, label: "top" },
  { letter: "C", code: "-.-.", col: 1, row: 4, label: "left" },
  { letter: "D", code: "-..", col: 2, row: 5, label: "right" },
  { letter: "X", code: "-..-", col: 1, row: 5, label: "left" },
  { letter: "B", code: "-...", col: 2, row: 6, label: "right" },

  // Rama de la E
  { letter: "A", code: ".-", col: 4, row: 3, label: "left" },
  { letter: "R", code: ".-.", col: 5, row: 3, label: "bottom" },
  { letter: "L", code: ".-..", col: 6, row: 3, label: "right" },
  { letter: "W", code: ".--", col: 4, row: 5, label: "left" },
  { letter: "P", code: ".--.", col: 5, row: 5, label: "right" },
  { letter: "J", code: ".---", col: 4, row: 6, label: "right" },

  // Ramas de la I y la S
  { letter: "U", code: "..-", col: 5, row: 1, label: "left" },
  { letter: "F", code: "..-.", col: 5, row: 2, label: "right" },
  { letter: "V", code: "...-", col: 6, row: 1, label: "right" },
];

const BY_CODE = new Map(TREE.map((n) => [n.code, n]));

export function nodeFor(code: string): TreeNode | undefined {
  return BY_CODE.get(code);
}

/** Posición del padre: el nodo con el código sin su último símbolo, o la antena. */
export function parentOf(node: TreeNode): { col: number; row: number } {
  return BY_CODE.get(node.code.slice(0, -1)) ?? ROOT;
}

/**
 * Códigos que se encienden para una secuencia: todos sus prefijos que existan
 * en el árbol. "·–·" enciende E, A y R. Si la secuencia se sale del árbol (un
 * número, un signo), se queda encendido el tramo que sí existe.
 */
export function litCodes(code: string): Set<string> {
  const out = new Set<string>();
  for (let i = 1; i <= code.length; i++) {
    const prefix = code.slice(0, i);
    if (!BY_CODE.has(prefix)) break;
    out.add(prefix);
  }
  return out;
}

/** Letras que se pueden practicar con el árbol (sin números ni signos). */
export const TREE_LETTERS = new Set(TREE.map((n) => n.letter));
