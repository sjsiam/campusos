"use client";
// Auth + profile for the whole app, and the routing rule from docs/design/screens.md:
// signed out → /login (except the public landing page /); no classIds → /onboarding; else the requested page.
import type { User } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { getProfile } from "@/lib/data";
import { saveToken } from "@/lib/push";
import type { CampusClass, Role, UserProfile } from "@/lib/types";
import { ErrorState, FullScreenSpinner } from "./ui";

interface Session { user: User; role: Role; profile: UserProfile | undefined; setProfile: (p: UserProfile) => void }
const Ctx = createContext<Session | null>(null);

/** Same rule as the API (lib/api.ts requireEditor): the class's editors or an admin. */
export const canEdit = (cls: CampusClass, uid: string, role: Role) => role === "admin" || cls.editors.includes(uid);

/** Signed-in session; only valid under <SessionGate> on a page that isn't /login. */
export const useSession = () => useContext(Ctx)!;

export default function SessionGate({ children }: { children: ReactNode }) {
  const { user, role, loading } = useAuth();
  const path = usePathname();
  const router = useRouter();
  // `uid` records whose profile is loaded, so a sign-in/out never shows a stale profile.
  const [loaded, setLoaded] = useState<{ uid: string; profile?: UserProfile; error?: boolean } | null>(null);

  const load = useCallback((uid: string) => {
    getProfile(uid).then((profile) => setLoaded({ uid, profile }), () => setLoaded({ uid, error: true }));
  }, []);
  useEffect(() => { if (user) load(user.uid); }, [user, load]);
  // A granted device saves its FCM token silently on every start, so a rotated token is stored (screens.md §10).
  useEffect(() => { if (user) saveToken(user.uid); }, [user]);

  const ready = !loading && (!user || loaded?.uid === user.uid);
  // /onboarding stays reachable after setup: Today's "Change classes" link reopens it.
  const want = !ready || loaded?.error ? null
    : !user ? (path === "/" ? null : "/login") // the landing page is public
    : !loaded?.profile?.classIds?.length ? "/onboarding"
    : path === "/login" || path === "/" ? "/today" : null;
  const target = want && want !== path ? want : null;
  useEffect(() => { if (target) router.replace(target); }, [target, router]);

  if (!ready || target) return <FullScreenSpinner />;
  if (!user) return children; // the login or landing page
  if (loaded?.error) return <ErrorState onRetry={() => { setLoaded(null); load(user.uid); }} />;
  const setProfile = (profile: UserProfile) => setLoaded({ uid: user.uid, profile });
  return <Ctx.Provider value={{ user, role, profile: loaded?.profile, setProfile }}>{children}</Ctx.Provider>;
}
