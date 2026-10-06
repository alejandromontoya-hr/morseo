"use client";

import { useEffect, useState } from "react";

/** Ancho máximo del celular; igual al corte de `globals.css` (760 px). */
const MOBILE_QUERY = "(max-width: 760px)";

/**
 * ¿La pantalla es de celular? En el servidor y en el primer render da false,
 * así el HTML es el mismo en los dos lados; se corrige al montar.
 */
export function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return mobile;
}
