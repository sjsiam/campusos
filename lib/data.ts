// Data helpers for the UI. Same names and arguments as the Firestore version; they now call the
// app's API (app/api/**) with the signed-in user's Firebase ID token. The API does all access checks.
import { auth } from "./firebase";
import type { Assignment, CampusClass, ClassUpdate, UserProfile } from "./types";

// JSON has no dates; turn these fields back into Date objects.
const DATE_KEYS = new Set(["dueAt", "createdAt"]);
const revive = (k: string, v: unknown) => (DATE_KEYS.has(k) && typeof v === "string" ? new Date(v) : v);

async function api<T>(path: string, init: { method?: string; body?: unknown; allow404?: boolean } = {}): Promise<T> {
  const user = auth.currentUser;
  if (!user) throw new Error("not signed in");
  const res = await fetch(path, {
    method: init.method ?? "GET",
    headers: {
      authorization: `Bearer ${await user.getIdToken()}`,
      ...(init.body !== undefined && { "content-type": "application/json" }),
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  if (res.status === 404 && init.allow404) return undefined as T;
  if (!res.ok) throw new Error(`${init.method ?? "GET"} ${path} failed: ${res.status}`);
  const text = await res.text();
  return (text ? JSON.parse(text, revive) : undefined) as T;
}

// Profiles are private: only the signed-in user's own profile can be read or written.
const self = (uid: string) => {
  if (uid !== auth.currentUser?.uid) throw new Error("can only access your own profile");
};

export const getProfile = (uid: string) => {
  self(uid);
  return api<UserProfile | undefined>("/api/me", { allow404: true });
};

export const saveProfile = (uid: string, p: Partial<UserProfile>) => {
  self(uid);
  return api<UserProfile>("/api/me", { method: "PUT", body: p });
};

export const addFcmToken = (uid: string, token: string) => {
  self(uid);
  return api<void>("/api/me/fcm-tokens", { method: "POST", body: { token } });
};

export const listClasses = () => api<CampusClass[]>("/api/classes");

const byClasses = <T>(path: string, classIds: string[]) =>
  classIds.length ? api<T[]>(`${path}?classIds=${classIds.map(encodeURIComponent).join(",")}`) : Promise.resolve([]);

/** Soonest due first. */
export const listAssignments = (classIds: string[]) => byClasses<Assignment>("/api/assignments", classIds);

/** Newest first. */
export const listUpdates = (classIds: string[]) => byClasses<ClassUpdate>("/api/updates", classIds);

// `createdBy` is still accepted for the old signature but ignored: the server takes it from the ID token.
export const createAssignment = ({ createdBy, ...a }: Omit<Assignment, "id" | "dueAt"> & { dueAt: Date }) =>
  api<Assignment>("/api/assignments", { method: "POST", body: { ...a, dueAt: a.dueAt.toISOString() } });

export const createUpdate = ({ createdBy, ...u }: Omit<ClassUpdate, "id" | "createdAt">) =>
  api<ClassUpdate>("/api/updates", { method: "POST", body: u });

export const deleteAssignment = (id: string) => api<void>(`/api/assignments/${encodeURIComponent(id)}`, { method: "DELETE" });
