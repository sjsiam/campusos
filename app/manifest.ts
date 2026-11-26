import type { MetadataRoute } from "next";

// CO-27: icons in the v3 teal (white "C" in Barlow Semi Condensed). The maskable one keeps the glyph in the safe zone.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CampusOS",
    short_name: "CampusOS",
    description: "Campus schedules, assignments and class updates in one place.",
    start_url: "/today",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#0E5A5B",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
