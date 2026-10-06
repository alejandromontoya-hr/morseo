/**
 * Concentrador de broadcast en memoria (vive en el proceso del servidor).
 * Maneja dos bandas —morse (telégrafo) y cb (banda ciudadana / voz)— con salas
 * independientes por `banda:canal`. Guarda historial reciente solo del morse
 * (la voz es efímera, en vivo). Se guarda en globalThis para sobrevivir al
 * hot-reload del servidor de desarrollo.
 */

export type Band = "morse" | "cb";

export type BroadcastMsg = {
  id: string;
  band: Band;
  channel: number;
  from: string;
  user: string;
  kind: "morse" | "voice";
  ts: number;
  // kind === "morse"
  morse?: string;
  text?: string;
  wpm?: number; // velocidad de envío del emisor (PPM)
  // Transmisión en directo: cada letra llega como un mensaje con el mismo
  // `tx`; el historial las junta en una sola entrada.
  tx?: string;
  // kind === "voice"
  audio?: string;
  dur?: number;
};

type Client = {
  id: string;
  band: Band;
  channel: number;
  user: string;
  send: (s: string) => void;
};

export const MORSE_CHANNELS = 6;
export const CB_CHANNELS = 40;
const HISTORY_MAX = 40;
// El historial del morse se descarta pasado este tiempo para no crecer sin fin.
const HISTORY_TTL_MS = 30 * 60 * 1000;

// Turno de palabra: en cada canal transmite una persona a la vez, como en una
// radio de verdad. Quien empieza a transmitir toma el canal; los demás esperan.
/** Tras la última letra en directo, el canal sigue tomado este rato. */
export const FLOOR_IDLE_MS = 3000;
/** Nadie ocupa el canal más que esto seguido. */
const FLOOR_MAX_MS = 30_000;
/** Al agotar su turno, quien transmitía espera esto para que otros puedan entrar. */
const FLOOR_REST_MS = 3000;

type Floor = {
  from: string;
  user: string;
  since: number;
  until: number;
  /** El turno llegó al máximo: al vencer, su dueño descansa FLOOR_REST_MS. */
  capped: boolean;
  timer?: ReturnType<typeof setTimeout>;
};

/** Por qué no se puede transmitir: otro tiene el canal, o te toca descansar. */
export type FloorRefusal =
  | { error: "busy"; from: string; user: string; ms: number }
  | { error: "rest"; ms: number };

function roomKey(band: Band, channel: number) {
  return `${band}:${channel}`;
}

type HubState = {
  clients: Map<string, Client>;
  history: Map<string, BroadcastMsg[]>;
  floors: Map<string, Floor>;
};

const g = globalThis as unknown as { __morseoHub?: HubState };
const hub: HubState =
  g.__morseoHub ??
  (g.__morseoHub = { clients: new Map(), history: new Map(), floors: new Map() });
// Un concentrador creado antes de existir los turnos (hot-reload) no los trae.
hub.floors ??= new Map();

export function encodeSSE(obj: unknown): string {
  return `data: ${JSON.stringify(obj)}\n\n`;
}

function inRoom(c: Client, band: Band, channel: number) {
  return c.band === band && c.channel === channel;
}

function presencePayload(band: Band, channel: number) {
  const users = [...hub.clients.values()]
    .filter((c) => inRoom(c, band, channel))
    .map((c) => ({ id: c.id, user: c.user }));
  return { type: "presence" as const, band, channel, count: users.length, users };
}

function emitPresence(band: Band, channel: number) {
  const payload = encodeSSE(presencePayload(band, channel));
  for (const c of hub.clients.values()) {
    if (inRoom(c, band, channel)) c.send(payload);
  }
}

/** Quién tiene el canal y por cuánto más; sin dueño, el canal está libre. */
function floorPayload(band: Band, channel: number) {
  const f = hub.floors.get(roomKey(band, channel));
  const ms = f ? f.until - Date.now() : 0;
  return f && ms > 0
    ? { type: "floor" as const, from: f.from, user: f.user, ms }
    : { type: "floor" as const, from: null, user: null, ms: 0 };
}

function emitFloor(band: Band, channel: number) {
  const payload = encodeSSE(floorPayload(band, channel));
  for (const c of hub.clients.values()) {
    if (inRoom(c, band, channel)) c.send(payload);
  }
}

/**
 * Pide el canal para transmitir durante `holdMs`. Si está libre, o ya es tuyo,
 * lo toma o lo alarga y devuelve null; si no, devuelve por qué no.
 */
export function takeFloor(
  band: Band,
  channel: number,
  from: string,
  user: string,
  holdMs: number
): FloorRefusal | null {
  const key = roomKey(band, channel);
  const now = Date.now();
  const cur = hub.floors.get(key);
  if (cur && cur.until > now && cur.from !== from) {
    return { error: "busy", from: cur.from, user: cur.user, ms: cur.until - now };
  }
  if (cur && cur.until <= now && cur.capped && cur.from === from && now < cur.until + FLOOR_REST_MS) {
    return { error: "rest", ms: cur.until + FLOOR_REST_MS - now };
  }
  const since = cur && cur.until > now ? cur.since : now;
  const limit = since + FLOOR_MAX_MS;
  const floor: Floor = { from, user, since, until: Math.min(now + holdMs, limit), capped: now + holdMs >= limit };
  if (cur?.timer) clearTimeout(cur.timer);
  hub.floors.set(key, floor);
  // Al vencer, el canal queda libre. Si se agotó el turno, se recuerda un rato
  // más para que su dueño descanse.
  floor.timer = setTimeout(() => {
    if (hub.floors.get(key) !== floor) return;
    emitFloor(band, channel);
    if (!floor.capped) {
      hub.floors.delete(key);
      return;
    }
    floor.timer = setTimeout(() => {
      if (hub.floors.get(key) === floor) hub.floors.delete(key);
    }, FLOOR_REST_MS);
  }, floor.until - now);
  emitFloor(band, channel);
  return null;
}

export function subscribe(client: Client): () => void {
  hub.clients.set(client.id, client);
  const hist = hub.history.get(roomKey(client.band, client.channel)) ?? [];
  client.send(
    encodeSSE({
      type: "history",
      band: client.band,
      channel: client.channel,
      messages: hist,
    })
  );
  // Quien entra con el canal ocupado lo sabe de una vez.
  const floor = floorPayload(client.band, client.channel);
  if (floor.user) client.send(encodeSSE(floor));
  emitPresence(client.band, client.channel);
  return () => {
    const cur = hub.clients.get(client.id);
    if (cur === client) {
      hub.clients.delete(client.id);
      emitPresence(client.band, client.channel);
    }
  };
}

function findLast<T>(arr: T[], ok: (x: T) => boolean): T | undefined {
  for (let i = arr.length - 1; i >= 0; i--) if (ok(arr[i])) return arr[i];
  return undefined;
}

export function publish(msg: BroadcastMsg) {
  // Solo el morse guarda historial; la voz es en vivo.
  if (msg.kind === "morse") {
    const key = roomKey(msg.band, msg.channel);
    const arr = hub.history.get(key) ?? [];
    const open = msg.tx ? findLast(arr, (m) => m.tx === msg.tx) : undefined;
    if (open) {
      // La letra se suma a su transmisión (morse con espacio; el texto ya trae
      // el espacio si la letra empieza palabra).
      open.morse = `${open.morse ?? ""} ${msg.morse ?? ""}`.trim();
      open.text = (open.text ?? "") + (msg.text ?? "");
    } else {
      arr.push({ ...msg });
    }
    // Poda por antigüedad y por tamaño: el historial no crece sin límite.
    const cutoff = msg.ts - HISTORY_TTL_MS;
    let start = 0;
    while (start < arr.length && arr[start].ts < cutoff) start++;
    const pruned = start > 0 ? arr.slice(start) : arr;
    while (pruned.length > HISTORY_MAX) pruned.shift();
    hub.history.set(key, pruned);
  }
  const payload = encodeSSE({ type: "message", message: msg });
  for (const c of hub.clients.values()) {
    if (inRoom(c, msg.band, msg.channel)) c.send(payload);
  }
}
