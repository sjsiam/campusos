import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Dev only: lets the app run on 127.0.0.1, the same site as the Firebase emulators (redirect sign-in needs that).
  allowedDevOrigins: ["127.0.0.1"],
  // Every page waits on client-side Firebase Auth (components/Session.tsx), so only validate segments that opt in.
  experimental: { instantInsights: { validationLevel: "manual-warning" } },
  partialPrefetching: true,
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
