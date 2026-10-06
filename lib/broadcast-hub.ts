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

function roomKey(band: Band, channel: number) {
  return `${band}:${channel}`;
}

type HubState = {
  clients: Map<string, Client>;
  history: Map<string, BroadcastMsg[]>;
};

const g = globalThis as unknown as { __morseoHub?: HubState };
const hub: HubState =
  g.__morseoHub ?? (g.__morseoHub = { clients: new Map(), history: new Map() });

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
