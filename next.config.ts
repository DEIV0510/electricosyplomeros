import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sitio 100 % estático: se puede publicar en Vercel o en cualquier hosting (carpeta out/).
  output: "export",
  images: { unoptimized: true },
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
