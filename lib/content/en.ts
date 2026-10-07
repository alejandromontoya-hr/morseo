// What search engines and AI assistants read: tab titles, descriptions, and
// the guides and FAQs below each tool. Rendered on the server only; none of
// this ships in the browser's JavaScript. `es.ts` must satisfy `Content`.

const en = {
  ogLocale: "en_US",
  appDescription:
    "Free web app to translate, learn and send Morse code: type text and hear it in Morse, key it by hand, practice by ear and transmit live to other people.",
  features: [
    "Text to Morse code translator with sound",
    "Morse code to text by keying with a tap or the space bar",
    "Morse tree that lights up each letter's path",
    "Ear training, a few letters at a time (Koch method)",
    "Live Morse code channels to talk with other people",
  ],
  // The card shown when a page is shared (WhatsApp, LinkedIn, X).
  og: {
    translate: {
      alt: "Morseo: Morse code translator. Type it, hear it, key it.",
      tagline: "Type it, hear it, key it. Learn it by ear and send it live.",
    },
    learn: {
      alt: "Morseo: learn Morse code by ear, a few letters at a time.",
      tagline: "Get to know each letter by its sound, then practice it. A few letters at a time.",
    },
    radio: {
      alt: "Morseo: send Morse code live to anyone on your channel.",
      tagline: "Open a channel and talk in Morse with anyone tuned in, in real time.",
    },
  },

  meta: {
    translate: {
      title: "Morse Code Translator with Sound | Morseo",
      description:
        "Free Morse code translator: type text and hear it in Morse, or key it by hand and watch each letter light up its path on the Morse tree. Full Morse alphabet included.",
    },
    learn: {
      title: "Learn Morse Code by Ear, Free | Morseo",
      description:
        "Learn Morse code by sound, a few letters at a time (Koch method): meet each letter, practice it by ear and see its path on the Morse tree. Free, in your browser, no sign-up.",
    },
    radio: {
      title: "Send Morse Code Live: Online Telegraph | Morseo",
      description:
        "Transmit Morse code live to anyone on your channel. Key it by hand or type it, and watch incoming letters light up the Morse tree. A free online telegraph.",
    },
  },

  faqTitle: "Questions",

  translate: {
    howTitle: "How to use the Morse code translator",
    how: [
      "Type your text in “Your message”. The Morse code appears right below as dots and dashes, ready to copy and paste.",
      "Press Play to hear it as a 600 Hz tone: slow (8), medium (12) or fast (18) words per minute.",
      "To turn Morse code into text, key it: a short tap is a dot, a longer press is a dash, and a pause ends the letter. The space bar works as a key too.",
      "Switch to the Morse tree to watch each letter travel from the antenna, one dot or dash at a time.",
    ],
    alphabetTitle: "Morse code alphabet",
    alphabetLead:
      "International Morse Code: every letter, number and common punctuation mark with its dots and dashes.",
    groups: { letters: "Letters", numbers: "Numbers", punctuation: "Punctuation" },
    faq: [
      {
        q: "What is Morse code?",
        a: "A way of writing letters, numbers and punctuation with just two signals: a short one (dot) and a long one (dash). Samuel Morse and Alfred Vail created it in the 1830s and 1840s for the electric telegraph, and radio amateurs still use it today.",
      },
      {
        q: "How do you write SOS in Morse code?",
        a: "··· ––– ··· (... --- ...): three dots, three dashes, three dots. It's sent as one continuous signal, without the usual pause between letters. It isn't an acronym; it was chosen because the pattern is unmistakable.",
      },
      {
        q: "How long is a dash?",
        a: "A dash lasts as long as three dots. Inside a letter, the silence lasts one dot; between letters, three; and between words, seven.",
      },
      {
        q: "How do I translate Morse code to text?",
        a: "Key it on Morseo: tap for each dot, hold for each dash and pause to end the letter. The text appears in “Your message” as you go, and the Morse tree shows which letter you're on.",
      },
      {
        q: "What is the Morse tree?",
        a: "A map of the alphabet where every letter hangs from the antenna. Each dot or dash moves one step along the path, so you can see which letters start the same way: E, I, S and H are one, two, three and four dots.",
      },
      {
        q: "Is Morseo free? Do I need an account?",
        a: "It's free and works in your browser, on a phone or a computer, with no sign-up and nothing to install.",
      },
    ],
  },

  learn: {
    orderTitle: "The order to learn Morse code",
    orderLead:
      "Morseo doesn't teach the alphabet from A to Z. It goes from the simplest sounds to the longest, adding a few letters at a time: the idea behind the Koch method.",
    tricksTitle: "Tricks to remember each letter",
    tricksLead:
      "In each phrase, stressed syllables are dashes (dah) and light ones are dots (di). Use them to get started, then drop them: at real speed there's no time to think of the phrase.",
    faq: [
      {
        q: "What's the best way to learn Morse code?",
        a: "By ear. If you memorize a chart you end up counting dots and dashes, and real Morse is too fast for that. Learn each letter as a sound, the way you'd recognize a melody.",
      },
      {
        q: "Which letters should I learn first?",
        a: "E (one dot) and T (one dash), then A, N, I and M. With the second group (S, O, R, U, D, K) you can already read real words like SOS or RADIO.",
      },
      {
        q: "How long does it take to learn Morse code?",
        a: "It depends on how often you practice. Short daily sessions of 10 to 15 minutes work better than long, occasional ones, because the goal is to recognize each sound without thinking.",
      },
      {
        q: "Can I learn Morse code on my phone?",
        a: "Yes. Morseo works in the phone's browser: a letter plays and you tap the button for the one you heard.",
      },
    ],
  },

  radio: {
    howTitle: "How to send Morse code live",
    how: [
      "When you open the page you're already listening to channel 1. There are 6 channels: agree with your friends on one.",
      "Key or type your message. In Live mode each letter goes out as soon as you finish it; in With button mode you build the message and send it with Transmit.",
      "Everyone on the channel hears it and watches it light up their Morse tree. Your callsign is the random name others see, and you can roll a new one.",
      "One person transmits at a time, like on a real radio channel. Each turn lasts up to 30 seconds; then the channel opens for the others.",
    ],
    abbrTitle: "Abbreviations radio operators use",
    abbrLead:
      "Morse code is written short and fast, so operators use fixed abbreviations. Many later made it into voice radio.",
    prosignsTitle: "Prosigns",
    prosignsLead:
      "Groups sent together, as if they were a single letter, to run the conversation.",
    faq: [
      {
        q: "Can I send Morse code to a friend online?",
        a: "Yes. Both of you open Morseo's On air page and pick the same channel. Whatever one keys, the other hears and sees on the Morse tree in real time.",
      },
      {
        q: "Do I need a radio or a license?",
        a: "No. Morseo sends your Morse code over the internet, from browser to browser. Nothing goes out on radio frequencies, so you don't need equipment or a license.",
      },
      {
        q: "What does “channel busy” mean?",
        a: "Someone else is transmitting. Only one person sends at a time; wait for them to finish and the channel opens again.",
      },
    ],
  },
};

export default en;

export type Content = typeof en;
