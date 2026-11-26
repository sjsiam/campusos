// Pure Today-screen logic (no React, no Firestore) so it can be unit-tested. Campus time is WIB.
import type { Assignment, CampusClass, ClassUpdate, Slot } from "./types";

export const TZ = "Asia/Jakarta";
/** Intl locale for a UI language: en-GB gives "Wed 25 Nov" (day before month) as the design spec shows. */
export const locale = (lang: string) => (lang === "en" ? "en-GB" : lang);
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const fmt = new Intl.DateTimeFormat("en-US", {
  timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", hourCycle: "h23", weekday: "short",
});

/** Campus-time parts of an instant: date "2026-11-25", day 0-6 (Sun=0), time "14:05". */
export function wib(d: Date) {
  const p = Object.fromEntries(fmt.formatToParts(d).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, day: DAYS.indexOf(p.weekday), time: `${p.hour}:${p.minute}` };
}

const toMin = (t: string) => +t.slice(0, 2) * 60 + +t.slice(3, 5);

export interface Row {
  key: string;
  cls: CampusClass;
  slot: Slot;
  update?: ClassUpdate;
  start: string;
  end: string;
  state: "past" | "now" | "next" | "upcoming";
}

/**
 * One row per slot of the user's classes on `day`, with that date's newest update attached.
 * `updates` must be newest first (listUpdates order). `nowTime` null = not today (no now/past).
 */
export function buildTimeline(classes: CampusClass[], updates: ClassUpdate[], date: string, day: number, nowTime: string | null): Row[] {
  const rows = classes.flatMap((cls) => {
    const update = updates.find((u) => u.classId === cls.id && u.date === date);
    return cls.slots.filter((s) => s.day === day).map((slot, i): Row => {
      const { start, end } = slot;
      const state = nowTime === null || nowTime < start ? "upcoming" : nowTime < end ? "now" : "past";
      return { key: `${cls.id}-${i}`, cls, slot, update, start, end, state };
    });
  });
  // Same start (official overlaps, e.g. a lab inside its lecture's slot): the one ending first comes first.
  rows.sort((a, b) => a.start.localeCompare(b.start) || a.end.localeCompare(b.end));
  // "Next": the first not-cancelled class still to start today, even while another is "now".
  const next = rows.find((r) => r.state === "upcoming" && r.update?.kind !== "absent");
  if (nowTime !== null && next) next.state = "next";
  return rows;
}

/** Deadline countdown for the gutter: whole minutes, hours or days (rounded down, min 1); `late` once past due. */
export function countdown(dueAt: Date, now: Date): { n: number; unit: "m" | "h" | "d"; late: boolean; far: boolean } {
  const min = (dueAt.getTime() - now.getTime()) / 6e4, a = Math.abs(min);
  const [n, unit] = a < 60 ? [a, "m" as const] : a < 1440 ? [a / 60, "h" as const] : [a / 1440, "d" as const];
  return { n: Math.max(1, Math.floor(n)), unit, late: min < 0, far: min > 7 * 1440 };
}

/** Minutes between two "HH:MM" times. */
export const minutes = (start: string, end: string) => toMin(end) - toMin(start);

/** Timetable rows with a gap row before any class that starts ≥ 30 min after everything before it ended. */
export function withGaps(rows: Row[]): (Row | { key: string; gap: [string, string] })[] {
  const out: (Row | { key: string; gap: [string, string] })[] = [];
  let end = "";
  for (const r of rows) {
    if (end && minutes(end, r.start) >= 30) out.push({ key: `gap-${end}`, gap: [end, r.start] });
    if (r.end > end) end = r.end;
    out.push(r);
  }
  return out;
}

/** Due in the next 48h or overdue up to 24h ago, soonest first, max 3. */
export const dueSoon = (as: Assignment[], now: Date) =>
  as.filter((a) => {
    const h = (a.dueAt.getTime() - now.getTime()) / 36e5;
    return h >= -24 && h <= 48;
  }).sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime()).slice(0, 3);

/** "Wed 25 Nov" / "Rab 25 Nov" in campus time (Intl puts a comma after the weekday in Indonesian). */
export const shortDate = (d: Date, lang: string) =>
  new Intl.DateTimeFormat(locale(lang), { weekday: "short", day: "numeric", month: "short", timeZone: TZ }).format(d).replace(",", "");

export interface Session { date: string; start: string; end: string; room: string }
/** The class's next `n` sessions that haven't ended yet (the one in progress counts), within two weeks. */
export function upcomingSessions(cls: CampusClass, now: Date, n: number): Session[] {
  const out: Session[] = [];
  for (let d = 0; d < 14 && out.length < n; d++) {
    const w = wib(new Date(now.getTime() + d * 864e5));
    const today = d === 0 ? wib(now).time : "";
    for (const s of [...cls.slots].sort((a, b) => a.start.localeCompare(b.start)))
      if (s.day === w.day && s.end > today && out.length < n) out.push({ date: w.date, start: s.start, end: s.end, room: s.room });
  }
  return out;
}

/** Assignment list groups (screens.md §4): overdue, due today, within 7 days, later. */
export function dueGroup(dueAt: Date, now: Date): "overdue" | "today" | "week" | "later" {
  if (dueAt < now) return "overdue";
  if (wib(dueAt).date === wib(now).date) return "today";
  return dueAt.getTime() - now.getTime() <= 7 * 864e5 ? "week" : "later";
}
