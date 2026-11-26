import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Dev only: lets the app run on 127.0.0.1, the same site as the Firebase emulators (redirect sign-in needs that).
  allowedDevOrigins: ["127.0.0.1"],
  // Every page waits on client-side Firebase Auth (components/Session.tsx), so only validate segments that opt in.
  experimental: { instantInsights: { validationLevel: "manual-warning" } },
  partialPrefetching: true,
  // Serve Firebase's sign-in handler from our own domain (lib/firebase.ts sets authDomain to it). Without this,
  // Safari (and the iOS Home Screen app) isolates firebaseapp.com storage and redirect sign-in loops back to /login.
  async rewrites() {
    const project = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (!project) return [];
    return ["auth", "firebase"].map((p) => ({
      source: `/__/${p}/:path*`,
      destination: `https://${project}.firebaseapp.com/__/${p}/:path*`,
    }));
  },
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
