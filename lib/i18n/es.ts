// Diccionario en español. Debe cumplir el tipo `Dict` (definido a partir de
// en.ts): si falta o sobra una clave, TypeScript lo marca. Así garantizamos que
// ninguna cadena quede sin traducir.

import type { Dict } from "@/lib/i18n/en";

const spoken = (code: string) =>
  [...code].map((s) => (s === "-" ? "raya" : "punto")).join(" ");

const es: Dict = {
  nav: {
    translate: "Traducir",
    learn: "Aprender",
    radio: "Al aire",
    home: "Morseo, inicio",
    main: "Principal",
    repo: "Ver el código en GitHub",
  },

  tips: {
    home: "Ir al inicio",
    translate: "Escribe o teclea un mensaje y escúchalo en morse",
    learn: "Suena una letra y tú dices cuál es",
    radio: "Habla en morse en vivo con otras personas",
    copy: "Copia los puntos y rayas para pegarlos donde quieras",
    play: "Escucha tu mensaje en morse. También con Enter",
    stop: "Detiene el sonido",
    clear: "Borra el mensaje para empezar de nuevo",
    key: "Toque corto para un punto, mantén para una raya. También sirve la barra espaciadora",
    pwr: "Encendido: estás conectado al canal",
    rx: "Recibiendo: suena un mensaje de otra persona",
    tx: "Transmitiendo: se enciende mientras sale tu señal",
    signal: "El ritmo de tu mensaje: cada pulso es un tono. CW es como la radio llama al morse",
    pitch: "600 Hz es qué tan agudo suena el pitido",
    start: "Suena una letra al azar de este nivel",
    replay: "Repite la misma letra",
    next: "Suena otra letra",
    transmit: "Envía tu mensaje al canal. También con Enter",
    soundBlocked: "El navegador no deja sonar nada hasta que tocas la página",
    newCallsign: "Otro nombre al azar: así te ven los demás en el canal",
    replayMessage: "Vuelve a escuchar este mensaje",
    busyWait: (user: string) => `Espera a que ${user} termine`,
    needMessage: "Escribe o teclea un mensaje primero",
    noMorse: "Lo que escribiste no tiene morse: usa letras, números o signos comunes",
    nothingToClear: "No hay nada que borrar todavía",
  },

  station: {
    personalStation: "EL LENGUAJE DE LAS SEÑALES",
    received: "RECIBIDO",
    // Lo que el muñeco del emblema dice en morse de vez en cuando.
    emblemWords: ["HOLA", "SOS", "OK", "CHAO"],
    footer: "ESCUCHAR Y CONECTAR",
    links: "Sobre Morseo",
    linkedin: "Contáctame en LinkedIn",
    // El título grande dice qué es la página, con las palabras que la gente busca.
    headings: {
      translate: ["Traductor de", "código morse."],
      learn: ["Aprende código morse", "de oído."],
      radio: ["Transmite código morse", "en vivo."],
    },
    // El lema va pequeño, encima del título.
    mottos: {
      translate: "Tu estación. Tu señal.",
      learn: "Entrena la recepción.",
      radio: "Abre un canal. Conecta.",
    },
    deviceHint: "Toca una letra para escuchar su recorrido. Toque corto para punto; mantén para raya.",
    view: {
      label: "Cómo teclear",
      key: "Tecla",
      tree: "Árbol morse",
      keyTitle: "Solo el pulsador, grande, para teclear cómodo",
      treeTitle: "La tecla con el árbol morse: cada letra enciende su camino",
    },
    hand: {
      title: "Encuentra tu ritmo.",
      lead: "Un toque dice más de lo que crees.",
      short: "toque corto",
      long: "mantén",
      spaceBar: "También con la barra espaciadora.",
      pause: "Una pausa termina la letra.",
    },
    silenceTitle: "El silencio también comunica.",
    silenceBody: "Una pausa corta separa letras; una más larga, palabras. Escucha el ritmo completo.",
    signal: "TU SEÑAL · CW",
    editorHint: "Cada letra tiene su propio ritmo.",
  },

  theme: {
    toggle: "Cambiar entre modo día y noche",
  },

  language: {
    label: "Idioma",
  },

  common: {
    wpm: (n: number) => `${n} palabras por minuto`,
  },

  device: {
    words: ["CÓDIGO", "MORSE"],
    treeAria:
      "Árbol morse: cada letra enciende su camino de puntos y rayas desde la antena.",
    nodeLabel: (letter: string, code: string) => `${letter}: ${spoken(code)}`,
    keyAria:
      "Tecla morse: toque corto para punto, mantén para raya. La barra espaciadora también sirve.",
    key: "Tecla",
    short: "Corto",
    long: "Largo",
    tx: "TX",
    rx: "RX",
    pwr: "PWR",
    notALetter: "NO ES LETRA",
  },

  translate: {
    title: "Traductor morse",
    lead: "Escribe o teclea un mensaje y ve cómo cada letra recorre el árbol morse.",
    messageLabel: "Tu mensaje",
    placeholder: "Escribe aquí o usa la tecla",
    morseLabel: "En morse",
    morseEmpty: "Aquí aparece la traducción mientras escribes o tecleas.",
    skipped: (chars: string) => `Sin morse: ${chars}`,
    copy: "Copiar",
    copied: "Copiado",
    copyAria: "Copiar el mensaje en morse",
    play: "Reproducir",
    stop: "Detener",
    clear: "Borrar",
    speed: "Velocidad",
    speeds: { slow: "Lenta", medium: "Media", fast: "Rápida" },
  },

  learn: {
    title: "Aprende morse de oído",
    lead: "Suena una letra. Encuéntrala en el árbol, escríbela o tecléala.",
    levelLabel: "Letras para practicar",
    start: "Escuchar una letra",
    replay: "Oír de nuevo",
    next: "Siguiente letra",
    howTo:
      "Toca la letra en el árbol, oprímela en tu teclado o tecléala con la barra espaciadora.",
    howToTouch: "Toca la letra en el árbol o tecléala con la tecla.",
    right: (letter: string) => `¡Eso! Es la ${letter}.`,
    wrong: (target: string, picked: string) =>
      `Era la ${target}. Elegiste la ${picked}.`,
    wrongUnknown: (target: string) =>
      `Era la ${target}. Lo que tecleaste no es una letra.`,
    trick: "Truco",
    score: (right: number, total: number) => `${right} de ${total} acertadas`,
    streak: (n: number) => `Racha de ${n}`,
    guideTitle: "Cómo leer el árbol",
    guide: [
      "Empieza en la antena. Cada punto enciende un círculo lima y cada raya una barra blanca, hasta llegar a la letra.",
      "Una raya dura lo que tres puntos. Entre letras va un silencio corto, y entre palabras, uno más largo.",
      "Aprende por el sonido, sin contar puntos: cada letra tiene su ritmo. Empieza con la E y la T y suma pocas letras a la vez.",
    ],
  },

  radio: {
    title: "Al aire",
    lead: "Escucha lo que se transmite en tu canal y responde en morse, en tiempo real.",
    listening: "Escuchando",
    tuning: "Sintonizando…",
    soundBlocked: "Toca para oír lo que llega",
    channelLabel: "Canal",
    channels: [
      "Llamada general",
      "Práctica lenta",
      "Charla",
      "Simulacro",
      "Larga distancia",
      "Libre",
    ],
    callsignLabel: "Tu indicativo",
    newCallsign: "Otro indicativo",
    modeLabel: "Cómo transmitir",
    modes: { direct: "Directo", button: "Con botón" },
    modeTitles: {
      direct: "Cada letra sale apenas la tecleas",
      button: "Armas el mensaje y lo envías con Transmitir",
    },
    modeHelp: {
      direct: "Cada letra que teclees sale al canal apenas la terminas. Lo que escribas abajo se envía con Enter.",
      button: "Arma el mensaje con la tecla o escribiendo, y envíalo con Transmitir.",
    },
    messageLabel: "Mensaje",
    placeholder: "Escribe o usa la tecla",
    placeholderDirect: "Escribe y envía con Enter",
    send: "Transmitir",
    presence: (n: number) =>
      n <= 1 ? "Solo tú en este canal" : `${n} en este canal`,
    feedLabel: "Último mensaje del canal",
    feedEmpty: "Nada todavía. Abre esta página en otra pestaña o equipo para probar.",
    busy: (user: string) => `Canal ocupado: ${user}`,
    busyShort: "Canal ocupado",
    rest: "Llevas 30 segundos al aire: espera un momento para que otros puedan transmitir",
    restShort: "Espera un momento",
    you: "tú",
    operator: "Operador",
    replay: "Repetir",
    offline: "Sin conexión. Reintentando…",
    serverNote:
      "Los canales viven en este servidor mientras esté encendido. Cualquiera que abra esta página en tu red puede unirse.",
  },
};

export default es;
