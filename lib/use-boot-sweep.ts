"use client";

import { useEffect, useState } from "react";

const KEY = "morseo:boot";

/**
 * Devuelve 1 la primera vez que se abre el aparato en la pestaña (para el
 * barrido de luces de arranque del árbol) y 0 las demás.
 */
export function useBootSweep(): number {
  const [sweep, setSweep] = useState(0);
  useEffect(() => {
    try {
      if (sessionStorage.getItem(KEY)) return;
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* sin almacenamiento: el barrido sale en cada visita */
    }
    setSweep(1);
  }, []);
  return sweep;
}
