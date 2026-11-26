"use client";
import {
  GoogleAuthProvider, getRedirectResult, onIdTokenChanged, signInWithPopup, signInWithRedirect, signOut as fbSignOut, type User,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "./firebase";
import type { Role } from "./types";

// Popups fail in an iOS Home Screen app (and when blocked), so those use a full-page redirect.
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  if ((navigator as Navigator & { standalone?: boolean }).standalone === true) return signInWithRedirect(auth, provider);
  try {
    return await signInWithPopup(auth, provider);
  } catch (e) {
    if ((e as { code?: string }).code === "auth/popup-blocked") return signInWithRedirect(auth, provider);
    throw e;
  }
}
export const signOut = () => fbSignOut(auth);
/** Finishes a redirect sign-in; rejects with its error, if any. */
export const redirectResult = () => getRedirectResult(auth);

// Class reps / lab assistants are per-class (CampusClass.editors); `role` is only the global custom claim.
export function useAuth() {
  const [state, setState] = useState<{ user: User | null; role: Role; loading: boolean }>(
    { user: null, role: "student", loading: true },
  );
  // onIdTokenChanged (not onAuthStateChanged) so a refreshed token picks up a newly set claim.
  useEffect(() => onIdTokenChanged(auth, async (user) => {
    const role = user ? ((await user.getIdTokenResult()).claims.role as Role | undefined) : undefined;
    setState({ user, role: role ?? "student", loading: false });
  }), []);
  return state;
}
