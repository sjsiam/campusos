// Route handlers shared by assignments and updates: same access rules, different fields.
// Read: any signed-in user. Create/change/delete: the class's editors or an admin.
// createdBy comes from the ID token; classId and createdBy never change.
import type { z } from "zod";
import { body, caller, handle, HttpError, requireEditor } from "./api";
import { adminAuth } from "./admin";
import { sql } from "./db";
import { assignmentCreate, assignmentPatch, classIdsParam, updateCreate, updatePatch } from "./validate";

const config = {
  assignments: { create: assignmentCreate, patch: assignmentPatch, order: () => sql`t.due_at asc` },
  updates: { create: updateCreate, patch: updatePatch, order: () => sql`t.created_at desc` },
} as const;
type Table = keyof typeof config;

/**
 * Poster role from the Firebase custom claim (the same global claim the Account sheet uses), never from the
 * self-chosen display name. Posting already required class-editor or admin rights, so no claim = class rep.
 * shortcut: one role per user; per-class roles (rep here, assistant there) need a schema field.
 */
async function posterRoles(uids: string[]) {
  const roles = new Map<string, string>();
  const unique = [...new Set(uids)];
  for (let i = 0; i < unique.length; i += 100) { // getUsers takes at most 100 identifiers
    const { users } = await adminAuth.getUsers(unique.slice(i, i + 100).map((uid) => ({ uid })));
    for (const u of users) {
      const r = u.customClaims?.role;
      if (r === "admin" || r === "lecturer" || r === "labassistant" || r === "classrep") roles.set(u.uid, r);
    }
  }
  return roles;
}

export function collectionRoutes(table: Table) {
  const { create, order } = config[table];
  return {
    /** GET ?classIds=a,b → items of those classes. */
    GET: handle(async (req: Request) => {
      await caller(req);
      const raw = new URL(req.url).searchParams.get("classIds");
      const ids = classIdsParam.parse(raw ? raw.split(",") : []);
      if (!ids.length) return Response.json([]);
      // The poster's display name rides along: reps' names are shown on every update and assignment by design.
      const rows = await sql<{ createdBy: string }[]>`
        select t.*, u.name as created_by_name from ${sql(table)} t left join users u on u.uid = t.created_by
        where t.class_id in ${sql(ids)} order by ${order()}`;
      const roles = await posterRoles(rows.map((r) => r.createdBy));
      return Response.json(rows.map((r) => ({ ...r, createdByRole: roles.get(r.createdBy) ?? "classrep" })));
    }),
    POST: handle(async (req: Request) => {
      const who = await caller(req);
      const b = (await body(req, create)) as z.infer<typeof assignmentCreate> | z.infer<typeof updateCreate>;
      await requireEditor(who, b.classId);
      const [row] = await sql`insert into ${sql(table)} ${sql({ ...b, createdBy: who.uid })} returning *`;
      return Response.json(row, { status: 201 });
    }),
  };
}

export function itemRoutes(table: Table) {
  const { patch } = config[table];
  // Loads the item and checks the caller may edit its class.
  const owned = async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const who = await caller(req);
    const { id } = await ctx.params;
    const [row] = await sql<{ classId: string }[]>`select class_id from ${sql(table)} where id = ${id}`;
    if (!row) throw new HttpError(404, "not found");
    await requireEditor(who, row.classId);
    return id;
  };
  return {
    PATCH: handle(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
      const id = await owned(req, ctx);
      const b = await body(req, patch);
      const [row] = Object.keys(b).length
        ? await sql`update ${sql(table)} set ${sql(b as Record<string, unknown>)} where id = ${id} returning *`
        : await sql`select * from ${sql(table)} where id = ${id}`;
      return Response.json(row);
    }),
    DELETE: handle(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
      const id = await owned(req, ctx);
      await sql`delete from ${sql(table)} where id = ${id}`;
      return new Response(null, { status: 204 });
    }),
  };
}
