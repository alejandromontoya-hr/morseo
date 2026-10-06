import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Las rutas anteriores del sitio llevan a sus equivalentes nuevas.
  redirects() {
    return [
      { source: "/curso", destination: "/learn", permanent: false },
      { source: "/broadcast", destination: "/radio", permanent: false },
    ];
  },
};

export default nextConfig;
