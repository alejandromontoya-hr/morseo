// Lo que leen Google y las IA en español: títulos de pestaña, descripciones y
// las guías y preguntas frecuentes de debajo de cada herramienta. Debe cumplir
// la forma de `Content` (en.ts), así TypeScript avisa si falta algo.

import type { Content } from "@/lib/content/en";

const es: Content = {
  ogLocale: "es_LA",
  appDescription:
    "App web gratis para traducir, aprender y transmitir código morse: escribe un texto y escúchalo en morse, tecléalo a mano, practica de oído y transmite en vivo a otras personas.",
  features: [
    "Traductor de texto a código morse con sonido",
    "De código morse a texto tecleando con un toque o la barra espaciadora",
    "Árbol morse que enciende el camino de cada letra",
    "Práctica de oído, pocas letras a la vez (método Koch)",
    "Canales de código morse en vivo para hablar con otras personas",
  ],
  og: {
    translate: {
      alt: "Morseo: traductor de código morse. Escríbelo, escúchalo, tecléalo.",
      tagline: "Escríbelo, escúchalo, tecléalo. Apréndelo de oído y transmítelo en vivo.",
    },
    learn: {
      alt: "Morseo: aprende código morse de oído, pocas letras a la vez.",
      tagline: "Suena una letra y la encuentras en el árbol morse. Pocas letras a la vez.",
    },
    radio: {
      alt: "Morseo: transmite código morse en vivo a quien esté en tu canal.",
      tagline: "Abre un canal y habla en morse con quien esté sintonizado, en tiempo real.",
    },
  },

  meta: {
    translate: {
      title: "Traductor de Código Morse con Sonido | Morseo",
      description:
        "Traductor de código morse gratis: escribe un texto y escúchalo en morse, o tecléalo a mano y mira cómo cada letra enciende su camino en el árbol morse. Con el alfabeto morse completo.",
    },
    learn: {
      title: "Aprender Código Morse de Oído, Gratis | Morseo",
      description:
        "Aprende código morse por sonido, pocas letras a la vez (método Koch). Suena una letra y la encuentras en el árbol morse. Gratis, en el navegador y sin registro.",
    },
    radio: {
      title: "Transmitir en Morse en Vivo: Telégrafo Online | Morseo",
      description:
        "Transmite código morse en vivo a quien esté en tu canal. Tecléalo a mano o escríbelo, y mira cómo las letras que llegan encienden el árbol morse. Un telégrafo online gratis.",
    },
  },

  faqTitle: "Preguntas frecuentes",

  translate: {
    howTitle: "Cómo usar el traductor de código morse",
    how: [
      "Escribe tu texto en «Tu mensaje». El código morse aparece justo debajo en puntos y rayas, listo para copiar y pegar.",
      "Toca Reproducir para escucharlo como un tono de 600 Hz: lento (8), medio (12) o rápido (18) palabras por minuto.",
      "Para pasar de código morse a texto, tecléalo: un toque corto es un punto, uno largo es una raya y una pausa cierra la letra. La barra espaciadora también sirve de tecla.",
      "Pasa al árbol morse para ver cómo cada letra viaja desde la antena, punto a punto y raya a raya.",
    ],
    alphabetTitle: "Alfabeto morse",
    alphabetLead:
      "Código morse internacional: cada letra, número y signo de puntuación común con sus puntos y rayas, Ñ incluida.",
    groups: { letters: "Letras", numbers: "Números", punctuation: "Signos" },
    faq: [
      {
        q: "¿Qué es el código morse?",
        a: "Una forma de escribir letras, números y signos con solo dos señales: una corta (punto) y una larga (raya). Lo crearon Samuel Morse y Alfred Vail entre las décadas de 1830 y 1840 para el telégrafo eléctrico, y los radioaficionados lo siguen usando.",
      },
      {
        q: "¿Cómo se escribe SOS en código morse?",
        a: "··· ––– ··· (... --- ...): tres puntos, tres rayas, tres puntos. Se envía como una sola señal, sin la pausa de siempre entre letras. No es una sigla: se eligió porque el patrón es inconfundible.",
      },
      {
        q: "¿Cuánto dura una raya?",
        a: "Una raya dura lo mismo que tres puntos. Dentro de una letra el silencio dura un punto; entre letras, tres; y entre palabras, siete.",
      },
      {
        q: "¿Cómo traduzco código morse a texto?",
        a: "Tecléalo en Morseo: un toque por cada punto, mantén por cada raya y haz una pausa para cerrar la letra. El texto aparece en «Tu mensaje» a medida que avanzas, y el árbol morse muestra en qué letra vas.",
      },
      {
        q: "¿Qué es el árbol morse?",
        a: "Un mapa del alfabeto donde cada letra cuelga de la antena. Cada punto o raya avanza un paso por el camino, así se ve qué letras empiezan igual: la E, la I, la S y la H son uno, dos, tres y cuatro puntos.",
      },
      {
        q: "¿Morseo es gratis? ¿Necesito una cuenta?",
        a: "Es gratis y funciona en el navegador, en el celular o en el computador, sin registro y sin instalar nada.",
      },
    ],
  },

  learn: {
    orderTitle: "En qué orden aprender código morse",
    orderLead:
      "Morseo no enseña el alfabeto de la A a la Z. Va de los sonidos más simples a los más largos, sumando pocas letras a la vez: la idea del método Koch.",
    tricksTitle: "Trucos para recordar cada letra",
    tricksLead:
      "En cada frase, las sílabas fuertes son rayas (dah) y las débiles son puntos (di). Úsalas para arrancar y luego suéltalas: a velocidad real no da tiempo de pensar en la frase.",
    faq: [
      {
        q: "¿Cuál es la mejor forma de aprender código morse?",
        a: "De oído. Si memorizas una tabla terminas contando puntos y rayas, y el morse real es demasiado rápido para eso. Aprende cada letra como un sonido, como quien reconoce una melodía.",
      },
      {
        q: "¿Qué letras aprendo primero?",
        a: "La E (un punto) y la T (una raya), y luego la A, la N, la I y la M. Con el segundo grupo (S, O, R, U, D, K) ya puedes leer palabras reales como SOS o RADIO.",
      },
      {
        q: "¿Cuánto se tarda en aprender código morse?",
        a: "Depende de qué tan seguido practiques. Sesiones cortas de 10 a 15 minutos al día funcionan mejor que sesiones largas de vez en cuando, porque la meta es reconocer cada sonido sin pensar.",
      },
      {
        q: "¿Puedo aprender código morse en el celular?",
        a: "Sí. Morseo funciona en el navegador del celular: toca la letra en el árbol o tecléala en la pantalla.",
      },
    ],
  },

  radio: {
    howTitle: "Cómo transmitir en código morse en vivo",
    how: [
      "Al abrir la página ya estás escuchando el canal 1. Hay 6 canales: ponte de acuerdo con tus amigos en uno.",
      "Teclea o escribe tu mensaje. En modo Directo cada letra sale apenas la terminas; en modo Con botón armas el mensaje y lo envías con Transmitir.",
      "Todos en el canal lo oyen y lo ven encender su árbol morse. Tu indicativo es el nombre al azar con el que te ven los demás, y puedes sacar otro.",
      "Transmite una persona a la vez, como en un canal de radio de verdad. Cada turno dura hasta 30 segundos; luego el canal queda libre para los demás.",
    ],
    abbrTitle: "Abreviaturas que usan los radioaficionados",
    abbrLead:
      "En morse se escribe poco y rápido, por eso se usan abreviaturas fijas. Muchas pasaron después a la radio por voz.",
    prosignsTitle: "Prosignos",
    prosignsLead:
      "Grupos que se envían pegados, como si fueran una sola letra, para llevar la conversación.",
    faq: [
      {
        q: "¿Puedo mandarle código morse a un amigo por internet?",
        a: "Sí. Los dos abren Al aire en Morseo y eligen el mismo canal. Lo que uno teclea, el otro lo oye y lo ve en el árbol morse en tiempo real.",
      },
      {
        q: "¿Necesito un radio o una licencia?",
        a: "No. Morseo envía tu código morse por internet, de navegador a navegador. Nada sale por frecuencias de radio, así que no necesitas equipo ni licencia.",
      },
      {
        q: "¿Qué significa «Canal ocupado»?",
        a: "Que otra persona está transmitiendo. Solo transmite una a la vez: espera a que termine y el canal se libera.",
      },
    ],
  },
};

export default es;
