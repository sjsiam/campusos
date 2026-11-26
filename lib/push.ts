"use client";
// CO-26: notification permission + FCM token saving (screens.md §10).
// Without NEXT_PUBLIC_FIREBASE_VAPID_KEY (local dev, no Firebase project yet) the token step is a no-op.
import { app } from "./firebase";
import { addFcmToken } from "./data";

const VAPID = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

export type PushState = "install" | "unsupported" | "default" | "granted" | "denied";

/** Which variant to show (screens.md §10 table), same decision on every surface. */
export function pushState(): PushState {
  if (typeof window === "undefined") return "unsupported";
  const nav = navigator as Navigator & { standalone?: boolean };
  const ios = /iPhone|iPad/.test(nav.userAgent) || (/Macintosh/.test(nav.userAgent) && nav.maxTouchPoints > 1);
  if (ios && nav.standalone !== true) return "install";
  if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) return "unsupported";
  return Notification.permission;
}

/** Gets this device's FCM token and stores it on the profile (the API skips duplicates). Never throws. */
export async function saveToken(uid: string) {
  if (!VAPID || pushState() !== "granted") return;
  try {
    const { getMessaging, getToken, isSupported } = await import("firebase/messaging");
    if (!(await isSupported())) return;
    const reg = await navigator.serviceWorker.register("/sw.js");
    const token = await getToken(getMessaging(app), { vapidKey: VAPID, serviceWorkerRegistration: reg });
    if (token) await addFcmToken(uid, token);
  } catch (e) {
    console.warn("push token not saved; retried on next start", e); // §10: no error shown to the student
  }
}

/** Call only from a tap handler (iOS ignores the prompt otherwise). Resolves to the resulting permission. */
export async function enablePush(uid: string): Promise<PushState> {
  if (pushState() !== "default") return pushState();
  await Notification.requestPermission();
  await saveToken(uid);
  return pushState();
}
