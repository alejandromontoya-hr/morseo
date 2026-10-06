/**
 * La torre de «Al aire» (la misma del menú) dentro de un disco lima. Mientras
 * escuchas el canal, las ondas salen de la antena: primero las cercanas y luego
 * las lejanas. Sintonizando laten más despacio; sin conexión, la torre se apaga.
 */
export function OnAirIcon({ state }: { state: "tuning" | "open" | "lost" }) {
  return (
    <span aria-hidden className="on-air" data-state={state}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path className="on-air-wave" d="M7.8 4.7a6.14 6.14 0 0 0-.8 7.5" />
        <path className="on-air-wave" d="M16.2 4.8c2 2 2.26 5.11.8 7.47" />
        <path className="on-air-wave on-air-far" d="M4.9 16.1C1 12.2 1 5.8 4.9 1.9" />
        <path className="on-air-wave on-air-far" d="M19.1 1.9a9.96 9.96 0 0 1 0 14.1" />
        <circle cx="12" cy="9" r="2" />
        <path d="M9.5 18h5" />
        <path d="m8 22 4-11 4 11" />
      </svg>
    </span>
  );
}
