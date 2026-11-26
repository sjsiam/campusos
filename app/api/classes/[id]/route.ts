// One class: an admin may change anything or delete it; its editors may change everything but `editors`.
import { body, caller, handle, HttpError, requireAdmin, requireEditor } from "@/lib/api";
import { sql } from "@/lib/db";
import { classPatch } from "@/lib/validate";

export const PATCH = handle(async (req: Request, ctx: RouteContext<"/api/classes/[id]">) => {
  const who = await caller(req);
  const { id } = await ctx.params;
  await requireEditor(who, id);
  const { slots, ...b } = await body(req, classPatch);
  if (b.editors && !who.admin) throw new HttpError(403, "only an admin can change editors");
  const set = { ...b, ...(slots && { slots: sql.json(slots) }) };
  const [row] = Object.keys(set).length
    ? await sql`update classes set ${sql(set)} where id = ${id} returning *`
    : await sql`select * from classes where id = ${id}`;
  return Response.json(row);
});

export const DELETE = handle(async (req: Request, ctx: RouteContext<"/api/classes/[id]">) => {
  requireAdmin(await caller(req));
  const { id } = await ctx.params;
  const gone = await sql`delete from classes where id = ${id} returning id`;
  if (!gone.length) throw new HttpError(404, "class not found");
  return new Response(null, { status: 204 });
});
