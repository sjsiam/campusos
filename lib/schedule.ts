// Pure notification scheduling for the cron route (CO-20): which pushes are due now, and their text.
// No Firebase here, so it is unit-tested in schedule.test.ts. All campus times are WIB.
import en from "../messages/en.json";
import id from "../messages/id.json";
import { locale, TZ, wib } from "./today";
import type { CampusClass, Lang, UpdateKind } from "./types";

const MIN = 60_000;
const HOUR = 60 * MIN;
/** A reminder fires from its target time until GRACE later, so a cron run up to 10 min late still sends it. */
export const GRACE = 15 * MIN;

// Plain inputs (Dates, not Firestore Timestamps) so this stays framework-free.
export interface UpdateIn { id: string; classId: string; kind: UpdateKind; date: string; newRoom?: string; note: string; createdAt: Date }
export interface AssignmentIn { id: string; classId: string; title: string; dueAt: Date }

type Kind = "classSoon" | "classSoonMoved" | "due24" | "due1" | "room" | "absent";
export interface Job {
  id: string; // dedupe key: one push per id, ever
  kind: Kind;
  classId: string;
  tag: string; // same tag replaces the earlier notification on the device
  link: string;
  vars: {
    code: string; course?: string; start?: string; room?: string; title?: string; due?: Date;
    date?: string; newRoom?: string; note?: string;
  };
}

/** Instant of a campus-time "YYYY-MM-DD" + "HH:MM". WIB is UTC+7 all year. */
export const at = (date: string, time: string) => new Date(`${date}T${time}:00+07:00`);
const inWindow = (target: number, now: number) => now >= target && now < target + GRACE;
const dayOf = (date: string) => wib(at(date, "12:00")).day;

export function dueJobs(
  { classes, updates, assignments }: { classes: CampusClass[]; updates: UpdateIn[]; assignments: AssignmentIn[] },
  now: Date,
): Job[] {
  const t = now.getTime();
  const jobs: Job[] = [];
  const byClass = new Map(classes.map((c) => [c.id, c]));
  const newestFirst = [...updates].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const updateFor = (classId: string, date: string) => newestFirst.find((u) => u.classId === classId && u.date === date);

  // Class reminders, 30 min before each session today or tomorrow (covers sessions just after midnight).
  for (const date of [wib(now).date, wib(new Date(t + 24 * HOUR)).date]) {
    const day = dayOf(date);
    for (const cls of classes) for (const slot of cls.slots) {
      if (slot.day !== day) continue;
      const u = updateFor(cls.id, date);
      if (u?.kind === "absent") continue;
      const start = slot.start;
      const target = at(date, start).getTime() - 30 * MIN;
      if (!inWindow(target, t)) continue;
      // A change posted inside the 30-min window already sent its own alert; don't send both.
      if (u && u.createdAt.getTime() >= target) continue;
      const moved = u?.kind === "room_change" && !!u.newRoom;
      jobs.push({
        id: `class-${cls.id}-${date}-${slot.start}`, kind: moved ? "classSoonMoved" : "classSoon", classId: cls.id,
        tag: `class-${cls.id}-${date}`, link: "/today",
        vars: { code: cls.courseCode, course: cls.courseName, start, room: moved ? u!.newRoom : slot.room },
      });
    }
  }

  // Deadline reminders, 24 h and 1 h before dueAt.
  for (const a of assignments) {
    const cls = byClass.get(a.classId);
    if (!cls) continue;
    for (const [kind, hours] of [["due24", 24], ["due1", 1]] as const) {
      if (!inWindow(a.dueAt.getTime() - hours * HOUR, t)) continue;
      jobs.push({
        id: `${kind}-${a.id}`, kind, classId: a.classId, tag: `due-${a.id}`, link: `/assignments/${a.id}`,
        vars: { code: cls.courseCode, title: a.title, due: a.dueAt },
      });
    }
  }

  // Update alerts: every update posted in the last 24 h for a session that hasn't passed.
  const today = wib(now).date;
  for (const u of updates) {
    const cls = byClass.get(u.classId);
    if (!cls || u.date < today || t - u.createdAt.getTime() > 24 * HOUR) continue;
    const slot = cls.slots.find((s) => s.day === dayOf(u.date));
    const kind = u.kind === "room_change" ? "room" : u.kind;
    jobs.push({
      id: `update-${u.id}`, kind, classId: u.classId, tag: `class-${u.classId}-${u.date}`, link: "/updates",
      vars: {
        code: cls.courseCode, date: u.date, start: slot?.start ?? "",
        newRoom: u.newRoom, note: u.note,
      },
    });
  }
  return jobs;
}

const messages: Record<Lang, Record<string, string>> = { en, id };
const cut = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);
const hhmm = (time: string, lang: Lang) => (lang === "id" ? time.replace(":", ".") : time);

/** Push title and body in the student's language (docs/design/screens.md §11). */
export function render(job: Job, lang: Lang, now: Date): { title: string; body: string } {
  const m = messages[lang] ?? messages.en;
  const v = job.vars;
  const dateWord = (date: string) =>
    date === wib(now).date ? m["nav.today"]
      : date === wib(new Date(now.getTime() + 24 * HOUR)).date ? m["today.tomorrow"]
      : new Intl.DateTimeFormat(locale(lang), { weekday: "short", day: "numeric", month: "short", timeZone: TZ }).format(at(date, "12:00"));
  const note = v.note?.trim() ? cut(v.note.trim(), 80) : "";
  const fill: Record<string, string> = {
    code: v.code,
    course: v.course ?? "",
    start: hhmm(v.start ?? "", lang),
    room: v.room ?? "",
    title: cut(v.title ?? "", 40),
    due: v.due
      ? new Intl.DateTimeFormat(locale(lang), { weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: TZ }).format(v.due)
      : "",
    date: v.date ? dateWord(v.date) : "",
    newRoom: v.newRoom ?? "",
    note,
  };
  const text = (key: string) =>
    m[key].replace(note ? "" : " {note}", "").replace(/\{(\w+)\}/g, (_, k) => fill[k] ?? "");
  const titleKind = job.kind === "classSoonMoved" ? "classSoon" : job.kind;
  return { title: text(`push.${titleKind}.title`), body: text(`push.${job.kind}.body`) };
}
