// CO-20: called every 5 min by the GitHub Actions cron (CO-25) with `Authorization: Bearer $CRON_SECRET`.
// Sends class reminders (30 min), deadline reminders (24 h, 1 h) and update alerts via FCM, each at most once.
import { timingSafeEqual } from "node:crypto";
import { emulated, messaging } from "@/lib/admin";
import { sql } from "@/lib/db";
import { dueJobs, render, type AssignmentIn, type Job, type UpdateIn } from "@/lib/schedule";
import { wib } from "@/lib/today";
import type { CampusClass, Lang } from "@/lib/types";

const HOUR = 3_600_000;
// FCM says these tokens will never work again; remove them from the user.
const DEAD_TOKEN = new Set(["messaging/registration-token-not-registered", "messaging/invalid-registration-token"]);

function authorized(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // fail closed when not configured
  const given = Buffer.from(req.headers.get("authorization") ?? "");
  const want = Buffer.from(`Bearer ${secret}`);
  return given.length === want.length && timingSafeEqual(given, want);
}

export async function POST(req: Request) {
  if (!authorized(req)) return Response.json({ error: "unauthorized" }, { status: 401 });

  const now = new Date();
  const [classes, updates, assignments] = await Promise.all([
    sql<CampusClass[]>`select * from classes`,
    sql<UpdateIn[]>`select * from updates where date >= ${wib(now).date}`,
    sql<AssignmentIn[]>`select id, class_id, title, due_at from assignments
                        where due_at between ${now} and ${new Date(now.getTime() + 25 * HOUR)}`,
  ]);
  const jobs = dueJobs({ classes, updates, assignments }, now);

  const origin = new URL(req.url).origin;
  const recipients = new Map<string, Promise<Recipient[]>>(); // per classId, for this run
  const results = [];
  for (const job of jobs) {
    // Claim the job before sending: the insert is skipped if any run already claimed it, so nothing is sent twice.
    const claimed = await sql`insert into notifications (id, kind, class_id) values (${job.id}, ${job.kind}, ${job.classId})
                              on conflict (id) do nothing returning id`;
    if (!claimed.length) continue;
    if (!recipients.has(job.classId)) recipients.set(job.classId, studentsOf(job.classId));
    const outcome = await send(job, await recipients.get(job.classId)!, now, origin);
    await sql`update notifications set ${sql(outcome)} where id = ${job.id}`;
    results.push({ id: job.id, ...outcome });
  }
  return Response.json({ at: now.toISOString(), jobs: results });
}

interface Recipient { uid: string; lang: Lang; tokens: string[] }

async function studentsOf(classId: string): Promise<Recipient[]> {
  return sql<Recipient[]>`select uid, lang, fcm_tokens as tokens from users
                          where ${classId} = any(class_ids) and cardinality(fcm_tokens) > 0`;
}

async function send(job: Job, people: Recipient[], now: Date, origin: string) {
  let sent = 0, failed = 0, removed = 0;
  for (const lang of ["en", "id"] as const) {
    const group = people.filter((p) => p.lang === lang);
    const tokens = group.flatMap((p) => p.tokens);
    if (!tokens.length) continue;
    if (emulated) { sent += tokens.length; continue; } // no FCM emulator: report what would be sent
    const { title, body } = render(job, lang, now);
    const link = new URL(job.link, origin).toString();
    // FCM takes at most 500 tokens per multicast.
    for (let i = 0; i < tokens.length; i += 500) {
      const batch = tokens.slice(i, i + 500);
      const res = await messaging.sendEachForMulticast({
        tokens: batch,
        webpush: { notification: { title, body, tag: job.tag }, fcmOptions: { link } },
        data: { url: job.link },
      });
      sent += res.successCount;
      failed += res.failureCount;
      await Promise.all(res.responses.map((r, j) => {
        if (r.success || !DEAD_TOKEN.has(r.error?.code ?? "")) return;
        const owner = group.find((p) => p.tokens.includes(batch[j]));
        removed++;
        return owner && sql`update users set fcm_tokens = array_remove(fcm_tokens, ${batch[j]}) where uid = ${owner.uid}`;
      }));
    }
  }
  return { sent, failed, removed, emulated };
}
