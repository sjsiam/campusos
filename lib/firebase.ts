// Firebase client: Google sign-in only (data lives in Postgres behind app/api/**; push is CO-26).
import { getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";

export const app =
  getApps()[0] ??
  initializeApp({
    // Fallbacks keep `next build` prerender and the emulators working without a real project.
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-key",
    // Deployed: our own host, proxied to Firebase by next.config.ts rewrites, so redirect sign-in stays same-site.
    authDomain:
      typeof window !== "undefined" && process.env.NEXT_PUBLIC_USE_EMULATORS !== "true"
        ? location.host
        : process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo-campusos.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-campusos",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  });

export const auth = getAuth(app);

if (process.env.NEXT_PUBLIC_USE_EMULATORS === "true" && typeof window !== "undefined" && !auth.emulatorConfig) {
  // Same host as the page (localhost or 127.0.0.1): the redirect sign-in's storage only survives a same-site
  // round trip. Dev only; production never connects to the emulator.
  connectAuthEmulator(auth, `http://${location.hostname}:9099`, { disableWarnings: true });
}
