// firebase-admin for server code: verifying ID tokens and sending FCM. Data lives in Postgres (lib/db.ts).
// Never import from client components.
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getMessaging } from "firebase-admin/messaging";

/** Local dev against the Auth emulator. FCM has no emulator, so callers must not send in this mode. */
export const emulated = process.env.NEXT_PUBLIC_USE_EMULATORS === "true";
// The emulator accepts unsigned ID tokens; never allow that on a deployment.
if (emulated && process.env.VERCEL) throw new Error("NEXT_PUBLIC_USE_EMULATORS must not be set on Vercel");
if (emulated) process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099";

// Deployed: FIREBASE_SERVICE_ACCOUNT holds the service-account JSON (Vercel env var, never in files).
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
const app = getApps()[0] ?? initializeApp(
  serviceAccount && !emulated
    ? { credential: cert(JSON.parse(serviceAccount)) }
    : { projectId: process.env.GCLOUD_PROJECT || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-campusos" },
);

export const adminAuth = getAuth(app);
export const messaging = getMessaging(app);
