// Adds a push token to the caller's own profile (no duplicates).
import { body, caller, handle } from "@/lib/api";
import { sql } from "@/lib/db";
import { fcmToken } from "@/lib/validate";

export const POST = handle(async (req: Request) => {
  const { uid } = await caller(req);
  const { token } = await body(req, fcmToken);
  await sql`
    insert into users (uid, fcm_tokens) values (${uid}, array[${token}]::text[])
    on conflict (uid) do update set fcm_tokens = case
      when ${token} = any(users.fcm_tokens) then users.fcm_tokens
      else array_append(users.fcm_tokens, ${token}) end`;
  return new Response(null, { status: 204 });
});
