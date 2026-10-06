import type { Metadata } from "next";

import RadioApp from "@/components/radio-app";

// Metadata en inglés (idioma por defecto); el título se localiza en el cliente.
export const metadata: Metadata = {
  title: "On air — Morseo",
  description:
    "Send Morse code live to anyone tuned to your channel, and watch incoming letters light up the Morse tree.",
};

export default function RadioPage() {
  return <RadioApp />;
}
