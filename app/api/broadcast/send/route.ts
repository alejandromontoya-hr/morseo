import {
  CB_CHANNELS,
  FLOOR_IDLE_MS,
  MORSE_CHANNELS,
  publish,
  takeFloor,
  type Band,
} from "@/lib/broadcast-hub";
import { morseMs } from "@/lib/morse";

export const runtime = "nodejs";

// Límite del clip de voz en caracteres base64 (~ unos cuantos segundos de opus).
const MAX_AUDIO = 900_000;

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }

  const band: Band = body?.band === "cb" ? "cb" : "morse";
  const max = band === "cb" ? CB_CHANNELS : MORSE_CHANNELS;
  const channel = Number(body?.channel);
  if (!(channel >= 1 && channel <= max)) {
    return Response.json({ error: "invalid channel" }, { status: 400 });
  }
  const user = String(body?.user ?? "Operator").slice(0, 32);
  const from = String(body?.from ?? "").slice(0, 64);
  const kind = body?.kind === "voice" ? "voice" : "morse";

  if (kind === "voice") {
    const audio = String(body?.audio ?? "");
    if (!audio.startsWith("data:") || audio.length > MAX_AUDIO) {
      return Response.json({ error: "invalid audio" }, { status: 400 });
    }
    const dur = Math.min(60000, Math.max(0, Number(body?.dur) || 0));
    const msg = {
      id: crypto.randomUUID(),
      band,
      channel,
      from,
      user,
      kind: "voice" as const,
      audio,
      dur,
      ts: Date.now(),
    };
    publish(msg);
    return Response.json({ ok: true, id: msg.id });
  }

  const morse = String(body?.morse ?? "").slice(0, 4000).trim();
  const text = String(body?.text ?? "").slice(0, 600);
  if (!morse) return Response.json({ error: "empty signal" }, { status: 400 });
  // Velocidad de envío del emisor (PPM), acotada a un rango sensato.
  const wpm = Math.min(30, Math.max(4, Math.round(Number(body?.wpm) || 12)));
  // Id de la transmisión en directo a la que pertenece esta letra, si aplica.
  const tx = typeof body?.tx === "string" && body.tx ? body.tx.slice(0, 64) : undefined;

  // Turno de palabra: si otro tiene el canal, esto no sale. Un mensaje lo toma
  // mientras suena; una letra en directo, mientras suena y un rato después.
  const hold = morseMs(morse, wpm) + (tx ? FLOOR_IDLE_MS : 500);
  const refusal = takeFloor(band, channel, from, user, hold);
  if (refusal) return Response.json(refusal, { status: 409 });

  const msg = {
    id: crypto.randomUUID(),
    band,
    channel,
    from,
    user,
    kind: "morse" as const,
    morse,
    text,
    wpm,
    ...(tx ? { tx } : {}),
    ts: Date.now(),
  };
  publish(msg);
  return Response.json({ ok: true, id: msg.id });
}
