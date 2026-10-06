import {
  CB_CHANNELS,
  MORSE_CHANNELS,
  encodeSSE,
  subscribe,
  type Band,
} from "@/lib/broadcast-hub";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const band: Band = url.searchParams.get("band") === "cb" ? "cb" : "morse";
  const max = band === "cb" ? CB_CHANNELS : MORSE_CHANNELS;
  let channel = Number(url.searchParams.get("channel")) || 1;
  if (!(channel >= 1 && channel <= max)) channel = 1;
  const user = (url.searchParams.get("user") || "Operator").slice(0, 32);
  const id = (url.searchParams.get("id") || crypto.randomUUID()).slice(0, 64);

  const encoder = new TextEncoder();
  let ping: ReturnType<typeof setInterval> | undefined;
  let unsub: (() => void) | undefined;

  const stream = new ReadableStream({
    start(controller) {
      const send = (s: string) => {
        try {
          controller.enqueue(encoder.encode(s));
        } catch {}
      };
      send(encodeSSE({ type: "hello", id, band, channel }));
      unsub = subscribe({ id, band, channel, user, send });
      ping = setInterval(() => send(encodeSSE({ type: "ping" })), 15000);
      req.signal.addEventListener("abort", () => {
        if (ping) clearInterval(ping);
        unsub?.();
        try {
          controller.close();
        } catch {}
      });
    },
    cancel() {
      if (ping) clearInterval(ping);
      unsub?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
