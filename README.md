# Morseo

App de código morse construida con Next.js (App Router + TypeScript),
Tailwind CSS v4 e íconos lucide-react. Usa la interfaz **Estación**, con tonos
verde oscuro y lima, navegación lateral en escritorio y navegación inferior
en móvil. Conserva el aparato original: placa de circuito, pantalla,
**árbol morse** con luces y tecla telegráfica. Cada punto enciende un círculo
verde y cada raya una barra roja, desde la antena hasta la letra.

Tiene modo día (placa blanca) y modo noche (placa negra), y dos idiomas con
direcciones propias: inglés en la raíz y español bajo `/es`. El idioma lo
decide la dirección, así Google indexa las dos versiones; el botón EN/ES lleva
a la misma página en el otro idioma y se recuerda para la próxima visita.

## Páginas

- **Traducir** (`/` · `/es`) — un solo mensaje que se arma escribiendo o con la tecla
  (botón en pantalla o barra espaciadora). Al lado del editor está el panel
  para teclear, con un interruptor **Tecla | Árbol morse**: «Tecla» muestra
  solo la tecla redonda y «Árbol morse» la cambia, en el mismo lugar, por el
  aparato completo. Se puede copiar o reproducir el mensaje a tres velocidades.
- **Aprender** (`/learn` · `/es/aprender`) — práctica de escucha por niveles (orden de
  aprendizaje tipo Koch). Suena una letra y se responde tocándola en el árbol,
  oprimiéndola en el teclado o tecleándola. Al responder, el árbol enciende el
  camino correcto. El aparato está siempre visible; en móvil va primero, con
  un acceso a escuchar/repetir justo encima.
- **Al aire** (`/radio` · `/es/al-aire`) — telégrafo en vivo con 6 canales. Al entrar ya
  estás escuchando el canal 1: lo que se transmite suena en orden y pasa por
  el árbol. Tiene el mismo interruptor **Tecla | Árbol morse** y otro para
  **Cómo transmitir**: en **Directo** (el que viene por defecto) cada letra
  tecleada sale al canal apenas la terminas y los demás la oyen enseguida; en
  la lista se ve una sola entrada que crece («S» → «SO» → «SOS») y se cierra
  tras 3 s sin teclear. En **Con botón** se arma el mensaje y se envía con
  Transmitir. Lo escrito con el teclado se envía con Enter en los dos modos.
  Si el navegador todavía no deja sonar
  audio (entrada directa, sin haber tocado la página), los mensajes igual
  llegan a la lista y aparece **Toca para oír lo que llega**.

Cambiar entre «Tecla» y «Árbol morse» conserva el mensaje y cancela la
pulsación en curso. La barra espaciadora es la tecla incluso después de hacer
clic en un botón; solo si llegas a un botón con Tab, la barra lo activa.

Debajo de cada herramienta hay una guía (cómo se usa, alfabeto morse,
orden de estudio, abreviaturas y preguntas frecuentes) en el HTML del servidor.

Las rutas anteriores `/curso` y `/broadcast` redirigen a `/es/aprender` y
`/radio`; `/en/…`, `/aprender`, `/al-aire`, `/es/learn` y `/es/radio` llevan a
su dirección oficial.

## Buscadores e IA

- `app/sitemap.ts` → `/sitemap.xml`: las 6 páginas, cada una con su par en el
  otro idioma.
- `app/robots.ts` → `/robots.txt`: abierto a todos (Google, Bing, ChatGPT,
  Claude, Perplexity…) menos `/api/`.
- `app/llms.txt/route.ts` → `/llms.txt`: resumen del sitio para asistentes de IA.
- `lib/seo.ts`: título, descripción, dirección oficial (canonical), idiomas
  (hreflang) y la ficha JSON-LD (WebApplication + preguntas frecuentes).
- `opengraph-image.tsx` en cada página: la tarjeta al compartir el enlace.
- `lib/content/*`: los textos que leen los buscadores, en inglés y español.

## Uso

```bash
npm install
npm run dev     # http://localhost:3010
```

Producción:

```bash
npm run build
npm start       # también en el puerto 3010
```

## Cómo funciona Al aire

Backend en memoria, sin servicios externos. Una sala por canal:

- `GET /api/broadcast/stream?band=morse&channel&user&id` — flujo **SSE**: al
  conectarte recibes el historial reciente, la presencia (quién está) y cada
  transmisión nueva en vivo. Incluye un *heartbeat* cada 15 s.
- `POST /api/broadcast/send` — publica una transmisión (`morse`, `text`, `wpm`).
- `lib/broadcast-hub.ts` — estado por sala (suscriptores + historial), guardado
  en `globalThis` para sobrevivir al hot-reload en desarrollo.

El estado es efímero: se reinicia al reiniciar el proceso. (No apto para
despliegue serverless multiinstancia tal cual.)

## Estructura

- `components/site-shell.tsx` — el documento de cada idioma: tema
  (next-themes), idioma, navegación y fuentes (Barlow Semi Condensed para el
  aparato y Doto para su pantalla). Lo usan las dos raíces: `app/(en)/layout.tsx`
  y `app/es/layout.tsx`.
- `app/(en)/…` y `app/es/…` — las 3 vistas en cada idioma.
- `app/global-not-found.tsx` — el 404, en los dos idiomas.
- `components/guide/*` — la guía bajo cada herramienta.
- `app/api/broadcast/*` — rutas SSE y de envío.
- `app/globals.css` — colores de la placa, los LED y la mesa para ambos temas.
- `components/translate-app.tsx`, `learn-app.tsx`, `radio-app.tsx` — cada
  página.
- `components/device/*` — el aparato: `board` (placa y LED de estado),
  `screen` (pantalla), `morse-tree` (árbol con LED) y `key-button` (tecla).
- `components/device-layout.tsx` — interfaz común de Estación y apertura del aparato.
- `components/signal-monitor.tsx` — diagrama temporal de las primeras 24
  unidades de texto morse (letras o separadores) del mensaje, con ritmo 1:3:7.
- `components/morse-glyphs.tsx` — morse dibujado con círculos y barras.
- `components/site-nav.tsx` — navegación lateral en escritorio, cabecera y barra inferior en móvil.
- `lib/morse.ts` — alfabeto y `encode`/`decode`.
- `lib/morse-tree.ts` — posición de cada letra en el árbol.
- `lib/use-morse-audio.ts` — motor de audio morse (Web Audio, 600 Hz, PARIS).
- `lib/use-morse-player.ts` — reproducción sincronizada con el árbol.
- `lib/use-straight-key.ts` · `lib/use-keyer.ts` — tecla adaptativa a tu ritmo.
- `lib/morse-learn.ts` — niveles de aprendizaje y trucos mnemotécnicos.
- `lib/i18n/*` — textos de la interfaz en inglés y español; `routes.ts`, la
  dirección de cada página en cada idioma.
