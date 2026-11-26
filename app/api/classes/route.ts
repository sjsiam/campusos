// Classes: any signed-in user reads; only an admin creates.
import { body, caller, handle, requireAdmin } from "@/lib/api";
import { sql } from "@/lib/db";
import { classCreate } from "@/lib/validate";

export const GET = handle(async (req: Request) => {
  await caller(req);
  // studentCount: for "Send to {n} students" on the post buttons.
  return Response.json(await sql`
    select c.*, (select count(*)::int from users u where c.id = any(u.class_ids)) as student_count
    from classes c order by c.course_code, c.section`);
});

export const POST = handle(async (req: Request) => {
  requireAdmin(await caller(req));
  const { slots, ...c } = await body(req, classCreate);
  const [row] = await sql`insert into classes ${sql({ ...c, slots: sql.json(slots) })} returning *`;
  return Response.json(row, { status: 201 });
});
