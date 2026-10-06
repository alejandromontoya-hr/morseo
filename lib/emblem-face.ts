/**
 * El muñeco del emblema: los dos puntos son los ojos y la raya es la boca.
 * Quieto es la R en morse (· — ·); cuando lo miras, cobra vida.
 *
 * Todo sale de una función de cuadro: en cada cuadro recibe la hora y hacia
 * dónde está el puntero, y devuelve la pose de la cara. No hay animaciones
 * CSS: los parpadeos, las sorpresas, los guiños y los ratos de pensar se
 * deciden aquí con sus propios relojes.
 */

/** La cara en un instante, en unidades del disco (radio 50, centro en 0,0). */
export type Pose = {
  /** Hacia dónde miran, de -1 a 1 en cada eje. */
  lookX: number;
  lookY: number;
  eyeR: number;
  /** Los ojos suben (negativo) o bajan. */
  eyeY: number;
  /** Apertura de cada ojo: 1 abierto, 0 cerrado. */
  openL: number;
  openR: number;
  /**
   * Cómo se cierra cada ojo: 0 en óvalo plano (parpadeo), 1 en curvita ◠
   * (guiño). Sostenido, el óvalo plano se confunde con otra raya.
   */
  curlL: number;
  curlR: number;
  /** Largo del tramo recto de la boca (los extremos redondos van aparte). */
  mouthW: number;
  mouthH: number;
  /** Positivo sonríe, negativo frunce. */
  mouthCurve: number;
  mouthX: number;
  mouthY: number;
  /** Inclinación de la boca, en grados. */
  mouthTilt: number;
  /** Toda la cara sube (negativo) o baja: respiración y saltos. */
  hop: number;
};

export type FaceInput = {
  /** Dirección del puntero desde el centro, de -1 a 1 (0,0 si no hay). */
  lookX: number;
  lookY: number;
  /** Milisegundos desde que el puntero se movió por última vez. */
  idleMs: number;
};

export type Mood = "surprise" | "think" | "wink";

/** Quieto: la R en morse, con las medidas del emblema original. */
export const NEUTRAL: Pose = {
  lookX: 0,
  lookY: 0,
  eyeR: 6,
  eyeY: 0,
  openL: 1,
  openR: 1,
  curlL: 0,
  curlR: 0,
  mouthW: 20,
  mouthH: 12,
  mouthCurve: 0,
  mouthX: 0,
  mouthY: 0,
  mouthTilt: 0,
  hop: 0,
};

const EYE_X = 28.7;
// Los ojos se mueven más que la boca: así parece que la cabeza gira.
const EYE_TRAVEL = { x: 9, y: 7 };
const MOUTH_TRAVEL = { x: 5, y: 4 };
const BLINK_MS = 170;
// Sin mover el puntero un rato, se aburre y mira por su cuenta.
const BORED_MS = 2500;

/** Cuánto dura cada gesto, cuánto tarda en llegar y en irse (ms). */
const MOODS: Record<Mood, { dur: number; attack: number; release: number }> = {
  surprise: { dur: 1300, attack: 90, release: 320 },
  think: { dur: 2800, attack: 260, release: 380 },
  wink: { dur: 750, attack: 110, release: 220 },
};

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);

export function createFace(random: () => number = Math.random) {
  const between = (a: number, b: number) => a + (b - a) * random();

  let started = false;
  let last = 0;
  const look = { x: 0, y: 0 };
  let blinkStart = -Infinity;
  let nextBlink = 0;
  let mood: { kind: Mood; start: number; side: number } | null = null;
  let nextMood = 0;
  const wander = { x: 0, y: 0 };
  let nextWander = 0;

  /** Lanza un gesto si no hay otro en curso. `side`: -1 izquierda, 1 derecha. */
  function trigger(kind: Mood, now: number, side?: number): boolean {
    if (mood) return false;
    mood = { kind, start: now, side: side ?? (random() < 0.5 ? -1 : 1) };
    return true;
  }

  function frame(now: number, input: FaceInput): Pose {
    if (!started) {
      started = true;
      last = now;
      nextBlink = now + between(1200, 3500);
      nextMood = now + between(4000, 8000);
    }
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const bored = input.idleMs > BORED_MS;

    // Gestos sueltos: aburrido, lo más probable es que se ponga a pensar.
    if (!mood && now >= nextMood) {
      const r = random();
      const kind: Mood = bored
        ? r < 0.6 ? "think" : r < 0.8 ? "wink" : "surprise"
        : r < 0.4 ? "wink" : r < 0.75 ? "think" : "surprise";
      trigger(kind, now, input.lookX ? Math.sign(input.lookX) : undefined);
    }
    let w = 0;
    if (mood) {
      const m = MOODS[mood.kind];
      const t = now - mood.start;
      if (t >= m.dur) {
        mood = null;
        nextMood = now + between(5500, 12000);
      } else {
        w = smooth(Math.min(clamp01(t / m.attack), clamp01((m.dur - t) / m.release)));
      }
    }

    // A dónde mirar: al puntero, o por aquí y por allá si se aburrió.
    let tx = input.lookX;
    let ty = input.lookY;
    if (bored) {
      if (now >= nextWander) {
        wander.x = between(-0.6, 0.6);
        wander.y = between(-0.45, 0.35);
        nextWander = now + between(900, 2600);
      }
      tx = wander.x;
      ty = wander.y;
    }
    if (mood?.kind === "think") {
      // Mira arriba, a un lado, y los ojos van y vienen mientras piensa.
      tx = lerp(tx, mood.side * 0.75 + Math.sin(now / 480) * 0.12, w);
      ty = lerp(ty, -0.9, w);
    }
    // Las sacadas de un ojo aburrido son rápidas; seguir el puntero, suave.
    const k = 1 - Math.exp(-dt * (bored ? 16 : 11));
    look.x += (tx - look.x) * k;
    look.y += (ty - look.y) * k;

    const p: Pose = { ...NEUTRAL, lookX: look.x, lookY: look.y };

    if (mood?.kind === "surprise") {
      p.eyeR = lerp(p.eyeR, 8.6, w);
      p.eyeY = lerp(p.eyeY, -4, w);
      // La raya se encoge en una «o».
      p.mouthW = lerp(p.mouthW, 0.01, w);
      p.mouthH = lerp(p.mouthH, 13, w);
      p.mouthY = lerp(p.mouthY, 9, w);
      // Un saltico al asustarse.
      p.hop -= 4 * Math.sin(Math.PI * clamp01((now - mood.start) / 260));
    } else if (mood?.kind === "think") {
      p.openL = p.openR = lerp(1, 0.72, w);
      // La boca se encoge en un «mmm»: rayita corta, torcida y a un lado.
      p.mouthW = lerp(p.mouthW, 11, w);
      p.mouthH = lerp(p.mouthH, 6, w);
      p.mouthX = lerp(0, mood.side * 7, w);
      p.mouthY = lerp(0, 6, w);
      p.mouthTilt = lerp(0, mood.side * -14, w);
    } else if (mood?.kind === "wink") {
      // Solo cierra un ojo, en curvita: la boca sigue siendo la raya.
      if (mood.side < 0) {
        p.openL = lerp(1, 0.08, w);
        p.curlL = 1;
      } else {
        p.openR = lerp(1, 0.08, w);
        p.curlR = 1;
      }
    }

    // Parpadeo: nunca a mitad de una sorpresa o un guiño; espera a que pasen.
    if (now >= nextBlink) {
      if (mood && mood.kind !== "think") nextBlink = now + 300;
      else {
        blinkStart = now;
        // A veces parpadea dos veces seguidas.
        nextBlink = now + (random() < 0.15 ? 260 : between(2200, 5600));
      }
    }
    const bt = (now - blinkStart) / BLINK_MS;
    if (bt >= 0 && bt < 1) {
      const shut = Math.sin(Math.PI * bt);
      p.openL = Math.min(p.openL, 1 - shut);
      p.openR = Math.min(p.openR, 1 - shut);
    }

    // Respira.
    p.hop += Math.sin((now / 1000) * 1.5) * 0.6;
    return p;
  }

  return { frame, trigger };
}

const r2 = (n: number) => Math.round(n * 100) / 100;
const lidShown = (open: number, curl: number) => clamp01(((1 - open) * curl - 0.6) / 0.3);

/**
 * Pasa la pose a figuras SVG: una elipse por ojo, una curvita por ojo para el
 * guiño (se ve solo al cerrarse en curva) y un trazo para la boca.
 */
export function faceShape(p: Pose) {
  const ex = p.lookX * EYE_TRAVEL.x;
  const ey = p.eyeY + p.lookY * EYE_TRAVEL.y + p.hop;
  // Al cerrarse, el ojo se estira un poco a lo ancho: queda una rayita.
  const eye = (x: number, open: number, curl: number) => ({
    cx: r2(x + ex),
    cy: r2(ey),
    rx: r2(p.eyeR * (1 + (1 - open) * 0.3)),
    ry: r2(Math.max(1.6, p.eyeR * open)),
    // Casi cerrado en un guiño, la rayita se cambia por la curvita.
    opacity: r2(1 - lidShown(open, curl)),
  });
  const lid = (x: number, open: number, curl: number) => {
    const cx = x + ex;
    const half = p.eyeR * 1.08;
    return {
      d: `M${r2(cx - half)} ${r2(ey + 1)}Q${r2(cx)} ${r2(ey - p.eyeR * 0.92)} ${r2(cx + half)} ${r2(ey + 1)}`,
      strokeWidth: r2(p.eyeR * 0.57),
      opacity: r2(lidShown(open, curl)),
    };
  };
  const mx = p.mouthX + p.lookX * MOUTH_TRAVEL.x;
  const my = p.mouthY + p.lookY * MOUTH_TRAVEL.y + p.hop;
  const h = p.mouthW / 2;
  return {
    left: eye(-EYE_X, p.openL, p.curlL),
    right: eye(EYE_X, p.openR, p.curlR),
    lidL: lid(-EYE_X, p.openL, p.curlL),
    lidR: lid(EYE_X, p.openR, p.curlR),
    mouth: {
      // Curva cuadrática: el punto de control a 2× la curva deja el centro a 1×.
      d: `M${r2(mx - h)} ${r2(my)}Q${r2(mx)} ${r2(my + 2 * p.mouthCurve)} ${r2(mx + h)} ${r2(my)}`,
      strokeWidth: r2(p.mouthH),
      transform: `rotate(${r2(p.mouthTilt)} ${r2(mx)} ${r2(my)})`,
    },
  };
}
