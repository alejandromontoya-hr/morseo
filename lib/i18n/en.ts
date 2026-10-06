// English dictionary — the DEFAULT language and the source of truth for the
// shape of every translation. `es.ts` must satisfy `Dict` (= typeof this), so
// TypeScript flags any string that is added here but forgotten there.

const spoken = (code: string) =>
  [...code].map((s) => (s === "-" ? "dash" : "dot")).join(" ");

const en = {
  nav: {
    translate: "Translate",
    learn: "Learn",
    radio: "On air",
    home: "Morseo, home",
    main: "Main",
    repo: "View the code on GitHub",
  },

  tips: {
    home: "Go to the start page",
    translate: "Type or key a message and hear it in Morse",
    learn: "A letter plays and you name it",
    radio: "Talk in Morse live with other people",
    copy: "Copies the dots and dashes to paste anywhere",
    play: "Hear your message in Morse. Enter works too",
    stop: "Stops the sound",
    clear: "Clears the message to start over",
    key: "Tap for a dot, hold for a dash. The space bar works too",
    pwr: "Power: you're connected to the channel",
    rx: "Receiving: someone else's message is playing",
    tx: "Transmitting: lights up while your signal goes out",
    signal: "Your message's rhythm: each pulse is a tone. CW is what radio calls Morse",
    pitch: "600 Hz is how high the beep sounds",
    start: "Plays a random letter from this level",
    replay: "Plays the same letter again",
    next: "Plays another letter",
    transmit: "Sends your message to the channel. Enter works too",
    soundBlocked: "Your browser stays silent until you tap the page",
    newCallsign: "Another random name: this is how others see you on the channel",
    replayMessage: "Hear this message again",
    busyWait: (user: string) => `Wait until ${user} finishes`,
    needMessage: "Type or key a message first",
    noMorse: "What you typed has no Morse: use letters, numbers or common punctuation",
    nothingToClear: "Nothing to clear yet",
  },

  station: {
    personalStation: "THE LANGUAGE OF SIGNALS",
    received: "RECEIVED",
    // What the emblem's little guy says in Morse now and then.
    emblemWords: ["HI", "SOS", "OK", "BYE"],
    footer: "LISTEN & CONNECT",
    links: "About Morseo",
    linkedin: "Contact me on LinkedIn",
    // The big title says what the page is, in the words people search for.
    headings: {
      translate: ["Morse code", "translator."],
      learn: ["Learn Morse code", "by ear."],
      radio: ["Send Morse code", "live."],
    },
    // The motto goes small, above the title.
    mottos: {
      translate: "Your station. Your signal.",
      learn: "Train your listening.",
      radio: "Open a channel. Connect.",
    },
    deviceHint: "Tap a letter to hear its path. Tap the key for a dot; hold for a dash.",
    view: {
      label: "How to key",
      key: "Key",
      tree: "Morse tree",
      keyTitle: "Just the key, big, for comfortable keying",
      treeTitle: "The key with the Morse tree: every letter lights up its path",
    },
    hand: {
      title: "Find your rhythm.",
      lead: "A single tap says more than you think.",
      short: "short tap",
      long: "hold",
      spaceBar: "The space bar works too.",
      pause: "A pause ends the letter.",
    },
    silenceTitle: "Silence communicates, too.",
    silenceBody: "A short pause separates letters; a longer one separates words. Listen to the whole rhythm.",
    signal: "YOUR SIGNAL · CW",
    editorHint: "Every letter has its own rhythm.",
  },

  theme: {
    toggle: "Switch light and dark mode",
  },

  language: {
    label: "Language",
  },

  common: {
    wpm: (n: number) => `${n} words per minute`,
  },

  device: {
    words: ["MORSE", "CODE"] as [string, string],
    treeAria:
      "Morse tree: every letter lights up its path of dots and dashes from the antenna.",
    nodeLabel: (letter: string, code: string) => `${letter}: ${spoken(code)}`,
    keyAria:
      "Morse key: tap briefly for a dot, hold for a dash. The space bar works too.",
    key: "Key",
    short: "Short",
    long: "Long",
    tx: "TX",
    rx: "RX",
    pwr: "PWR",
    notALetter: "NOT A LETTER",
  },

  translate: {
    title: "Morse translator",
    lead: "Type or key a message and watch each letter travel the Morse tree.",
    messageLabel: "Your message",
    placeholder: "Type here, or use the key",
    morseLabel: "In Morse",
    morseEmpty: "The translation shows up here as you type or key.",
    skipped: (chars: string) => `No Morse for: ${chars}`,
    copy: "Copy",
    copied: "Copied",
    copyAria: "Copy the message in Morse",
    play: "Play",
    stop: "Stop",
    clear: "Clear",
    speed: "Speed",
    speeds: { slow: "Slow", medium: "Medium", fast: "Fast" },
  },

  learn: {
    title: "Learn Morse by ear",
    lead: "A letter plays. Find it on the tree, type it or key it.",
    levelLabel: "Letters to practice",
    start: "Play a letter",
    replay: "Hear it again",
    next: "Next letter",
    howTo:
      "Tap the letter on the tree, press it on your keyboard, or key it with the space bar.",
    howToTouch: "Tap the letter on the tree, or key it with the key.",
    right: (letter: string) => `Yes, it's ${letter}.`,
    wrong: (target: string, picked: string) =>
      `It was ${target}. You chose ${picked}.`,
    wrongUnknown: (target: string) =>
      `It was ${target}. What you keyed isn't a letter.`,
    trick: "Trick",
    score: (right: number, total: number) => `${right} of ${total} right`,
    streak: (n: number) => `Streak of ${n}`,
    guideTitle: "How to read the tree",
    guide: [
      "Start at the antenna. Each dot lights a lime circle and each dash a white bar, until you reach the letter.",
      "A dash lasts as long as three dots. Letters are separated by a short silence, and words by a longer one.",
      "Learn by sound, not by counting: every letter has its own rhythm. Start with E and T and add a few letters at a time.",
    ],
  },

  radio: {
    title: "On air",
    lead: "Hear what's being sent on your channel and answer in Morse, in real time.",
    listening: "Listening",
    tuning: "Tuning in…",
    soundBlocked: "Tap to hear what's coming in",
    channelLabel: "Channel",
    channels: [
      "General call",
      "Slow practice",
      "Chat",
      "Drill",
      "Long distance",
      "Free",
    ],
    callsignLabel: "Your callsign",
    newCallsign: "Another callsign",
    modeLabel: "How to transmit",
    modes: { direct: "Live", button: "With button" },
    modeTitles: {
      direct: "Every letter goes out as you key it",
      button: "Build the message and send it with Transmit",
    },
    modeHelp: {
      direct: "Every letter you key goes out the moment you finish it. Typed messages are sent with Enter.",
      button: "Build the message with the key or by typing, then send it with Transmit.",
    },
    messageLabel: "Message",
    placeholder: "Type, or use the key",
    placeholderDirect: "Type and send with Enter",
    send: "Transmit",
    presence: (n: number) =>
      n <= 1 ? "Only you on this channel" : `${n} on this channel`,
    feedLabel: "Last message on the channel",
    feedEmpty: "Nothing yet. Open this page in another tab or device to try it.",
    busy: (user: string) => `Channel busy: ${user}`,
    busyShort: "Channel busy",
    rest: "You've been on air for 30 seconds: wait a moment so others can transmit",
    restShort: "Wait a moment",
    you: "you",
    operator: "Operator",
    replay: "Play again",
    offline: "No connection. Retrying…",
    serverNote:
      "Channels live on this server while it runs. Anyone who opens this page on your network can join.",
  },
};

export default en;

export type Dict = typeof en;
