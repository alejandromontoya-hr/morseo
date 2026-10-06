import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hay una raíz por idioma, así que el 404 general va en app/global-not-found.tsx.
  experimental: { globalNotFound: true },
  redirects() {
    return [
      // Las rutas anteriores del sitio llevan a sus equivalentes nuevas.
      { source: "/curso", destination: "/es/aprender", permanent: false },
      { source: "/broadcast", destination: "/radio", permanent: false },
      // Direcciones que alguien podría escribir a mano: llevan a la oficial,
      // así cada página tiene una sola dirección para Google.
      { source: "/en", destination: "/", permanent: true },
      { source: "/en/learn", destination: "/learn", permanent: true },
      { source: "/en/radio", destination: "/radio", permanent: true },
      { source: "/es/learn", destination: "/es/aprender", permanent: true },
      { source: "/es/radio", destination: "/es/al-aire", permanent: true },
      { source: "/aprender", destination: "/es/aprender", permanent: true },
      { source: "/al-aire", destination: "/es/al-aire", permanent: true },
    ];
  },
};

export default nextConfig;
