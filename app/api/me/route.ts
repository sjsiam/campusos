// The caller's own profile. There is no route to any other user's profile.
import { body, caller, handle, HttpError } from "@/lib/api";
import { sql } from "@/lib/db";
import { profilePatch } from "@/lib/validate";

export const GET = handle(async (req: Request) => {
  const { uid } = await caller(req);
  const [row] = await sql`select name, lang, class_ids, fcm_tokens from users where uid = ${uid}`;
  if (!row) throw new HttpError(404, "no profile yet");
  return Response.json(row);
});

/** Merge-save: only the fields sent are changed; the row is created on first save. */
export const PUT = handle(async (req: Request) => {
  const { uid } = await caller(req);
  const p = await body(req, profilePatch);
  const [row] = Object.keys(p).length
    ? await sql`insert into users ${sql({ uid, ...p })} on conflict (uid) do update set ${sql(p)}
                returning name, lang, class_ids, fcm_tokens`
    : await sql`insert into users (uid) values (${uid}) on conflict (uid) do update set uid = excluded.uid
                returning name, lang, class_ids, fcm_tokens`;
  return Response.json(row);
});
