// Shared pieces of the data API (app/api/**): who is calling, may they edit this class, and error mapping.
// These checks replace firestore.rules; see ARCHITECTURE.md §5 for the full list.
import { z } from "zod";
import { adminAuth } from "./admin";
import { sql } from "./db";

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export interface Caller { uid: string; admin: boolean }

/** Verifies `Authorization: Bearer <Firebase ID token>`; 401 otherwise. */
export async function caller(req: Request): Promise<Caller> {
  const m = /^Bearer (\S+)$/.exec(req.headers.get("authorization") ?? "");
  if (!m) throw new HttpError(401, "missing ID token");
  try {
    const t = await adminAuth.verifyIdToken(m[1]);
    return { uid: t.uid, admin: t.role === "admin" };
  } catch {
    throw new HttpError(401, "invalid ID token");
  }
}

/** Admin, or a uid in the class's `editors`. 404 if the class doesn't exist, 403 if not allowed. */
export async function requireEditor(who: Caller, classId: string) {
  const [c] = await sql<{ editors: string[] }[]>`select editors from classes where id = ${classId}`;
  if (!c) throw new HttpError(404, "class not found");
  if (!who.admin && !c.editors.includes(who.uid)) throw new HttpError(403, "not an editor of this class");
}

export function requireAdmin(who: Caller) {
  if (!who.admin) throw new HttpError(403, "admin only");
}

/** Parses and validates a JSON body; 400 on bad JSON or a schema mismatch (unknown keys included). */
export async function body<T extends z.ZodType>(req: Request, schema: T): Promise<z.infer<T>> {
  let json: unknown;
  try { json = await req.json(); } catch { throw new HttpError(400, "body must be JSON"); }
  return schema.parse(json);
}

type Handler<C> = (req: Request, ctx: C) => Promise<Response>;

/** Wraps a route handler: maps HttpError / validation errors to JSON responses, hides everything else. */
export const handle = <C>(fn: Handler<C>): Handler<C> => async (req, ctx) => {
  try {
    return await fn(req, ctx);
  } catch (e) {
    if (e instanceof HttpError) return Response.json({ error: e.message }, { status: e.status });
    if (e instanceof z.ZodError) return Response.json({ error: "invalid body", issues: e.issues }, { status: 400 });
    console.error(e);
    return Response.json({ error: "internal error" }, { status: 500 });
  }
};
