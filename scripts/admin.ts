// firebase-admin Auth for scripts, pointed at the local Auth emulator.
// shortcut: emulator only; for the real project, drop the host line and run with GOOGLE_APPLICATION_CREDENTIALS.
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099";

initializeApp({ projectId: process.env.GCLOUD_PROJECT ?? "demo-campusos" });
export const auth = getAuth();
