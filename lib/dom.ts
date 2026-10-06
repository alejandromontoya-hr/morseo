/** ¿El foco está en un campo de texto? Ahí la barra y las letras son para escribir. */
export function isTyping(): boolean {
  const el = document.activeElement as HTMLElement | null;
  if (!el) return false;
  return (
    el.tagName === "INPUT" ||
    el.tagName === "TEXTAREA" ||
    el.tagName === "SELECT" ||
    el.isContentEditable
  );
}

/** ¿El foco está en un botón o enlace? Ahí Enter ya tiene su propia acción. */
export function isOnControl(): boolean {
  const el = document.activeElement as HTMLElement | null;
  if (!el) return false;
  return el.tagName === "BUTTON" || el.tagName === "A" || el.getAttribute("role") === "button";
}
