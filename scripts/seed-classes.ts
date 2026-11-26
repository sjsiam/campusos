// CO-30: loads the real CE timetable (scripts/timetable.ts) into the PRODUCTION database. Classes only:
// upsert by id, no Auth calls, no demo users/assignments/updates, and `editors` is never written for existing
// rows (new rows start with none; CO-14 set-role assigns them). Safe to re-run.
// Refuses unless DATABASE_URL is a Neon URL AND --prod is passed:
//   npx tsx --env-file=.env.vercel scripts/seed-classes.ts --prod   (or: npm run seed:classes -- --prod)
import { sql } from "../lib/db";
import { timetableClasses } from "./timetable";

const url = process.env.DATABASE_URL ?? "";
if (!/^postgres(ql)?:\/\/[^/]*\.neon\.tech[:/]/.test(url) || !process.argv.includes("--prod")) {
  console.error("Refusing to run: needs a Neon (neon.tech) DATABASE_URL and the --prod flag.");
  process.exit(1);
}

async function main() {
  const classes = timetableClasses();
  await sql.begin(async (tx) => {
    for (const { slots, ...c } of classes) {
      const row = { ...c, slots: tx.json(slots as never) };
      await tx`insert into classes ${tx(row)}
        on conflict (id) do update set course_code = excluded.course_code, course_name = excluded.course_name,
          section = excluded.section, type = excluded.type, lecturer = excluded.lecturer, slots = excluded.slots`;
    }
  });
  const ids = classes.map((c) => c.id);
  const [{ n }] = await sql<{ n: number }[]>`select count(*)::int as n from classes where id in ${sql(ids)}`;
  const [{ all }] = await sql<{ all: number }[]>`select count(*)::int as "all" from classes`;
  console.log(`Upserted ${classes.length} timetable classes; ${n} of them now in the database (${all} classes in total).`);
}

main().then(() => sql.end(), (e) => { console.error(e); process.exit(1); });
