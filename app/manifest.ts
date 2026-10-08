import type { MetadataRoute } from "next";
import { BRAND, SEO } from "@/lib/content";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND.fullName,
    short_name: BRAND.name,
    description: SEO.description,
    start_url: "/",
    display: "browser",
    background_color: "#f6f5f9",
    theme_color: "#3a0080",
    lang: "es-CO",
    icons: [
      { src: "/brand/mark-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/mark-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
