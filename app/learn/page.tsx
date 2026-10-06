import type { Metadata } from "next";

import LearnApp from "@/components/learn-app";

// Metadata en inglés (idioma por defecto); el título se localiza en el cliente.
export const metadata: Metadata = {
  title: "Learn Morse by ear — Morseo",
  description:
    "Hear a letter, find it on the Morse tree and build your ear one group of letters at a time.",
};

export default function LearnPage() {
  return <LearnApp />;
}
