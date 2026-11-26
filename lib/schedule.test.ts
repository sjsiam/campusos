import { expect, test } from "vitest";
import { at, dueJobs, render, type AssignmentIn, type UpdateIn } from "./schedule";
import type { CampusClass } from "./types";

// Wed 2026-11-25 (day 3) and Thu 2026-11-26 (day 4), campus time.
const cls: CampusClass = {
  id: "sisdig", courseCode: "TKE-201", courseName: "Sistem Digital", section: "A", type: "lecture",
  lecturer: "x", editors: [],
  slots: [{ day: 3, start: "08:00", end: "09:40", room: "R301" }, { day: 4, start: "00:15", end: "01:00", room: "R1" }],
};
const run = (now: Date, updates: UpdateIn[] = [], assignments: AssignmentIn[] = []) =>
  dueJobs({ classes: [cls], updates, assignments }, now);
// Deadline jobs only (the 00:15 Thursday slot's reminder is also due around midnight).
const dues = (now: Date, a: AssignmentIn) => run(now, [], [a]).filter((j) => j.kind.startsWith("due"));
const upd = (u: Partial<UpdateIn>): UpdateIn =>
  ({ id: "u1", classId: "sisdig", kind: "room_change", date: "2026-11-25", note: "", createdAt: at("2026-11-25", "06:00"), ...u });

test("class reminder: fires from 30 min before until 15 min later, not outside", () => {
  expect(run(at("2026-11-25", "07:29"))).toEqual([]);
  expect(run(at("2026-11-25", "07:30")).map((j) => j.id)).toEqual(["class-sisdig-2026-11-25-08:00"]);
  expect(run(at("2026-11-25", "07:40")).length).toBe(1); // cron 10 min late still sends
  expect(run(at("2026-11-25", "07:45"))).toEqual([]);
});

test("class reminder: session just after midnight comes from tomorrow's slots", () => {
  expect(run(at("2026-11-25", "23:50")).map((j) => j.id)).toEqual(["class-sisdig-2026-11-26-00:15"]);
});

test("class reminder: absent skips, room change uses new room", () => {
  const now = at("2026-11-25", "07:35");
  expect(run(now, [upd({ kind: "absent" })]).filter((j) => j.kind.startsWith("class"))).toEqual([]);
  const moved = run(now, [upd({ newRoom: "R305" })]).find((j) => j.kind === "classSoonMoved");
  expect(moved?.vars.room).toBe("R305");
  // Newest update for the session wins.
  const both = [upd({ id: "old", kind: "absent", createdAt: at("2026-11-25", "05:00") }), upd({ id: "new", newRoom: "R305" })];
  expect(run(now, both).some((j) => j.kind === "classSoonMoved")).toBe(true);
});

test("class reminder: change posted inside the 30-min window sends only the update alert", () => {
  const late = upd({ newRoom: "R305", createdAt: at("2026-11-25", "07:32") });
  expect(run(at("2026-11-25", "07:35"), [late]).map((j) => j.kind)).toEqual(["room"]);
});

test("deadline reminders at 24 h and 1 h, with grace", () => {
  const a: AssignmentIn = { id: "a1", classId: "sisdig", title: "K-Map", dueAt: at("2026-11-26", "23:59") };
  expect(dues(at("2026-11-25", "23:58"), a)).toEqual([]);
  expect(dues(at("2026-11-25", "23:59"), a).map((j) => j.id)).toEqual(["due24-a1"]);
  expect(dues(at("2026-11-26", "22:59"), a).map((j) => j.id)).toEqual(["due1-a1"]);
  expect(dues(at("2026-11-26", "23:14"), a)).toEqual([]);
});

test("update alerts: recent and not past; old or past-session updates are ignored", () => {
  const now = at("2026-11-25", "12:00");
  expect(run(now, [upd({ date: "2026-11-26" })]).map((j) => [j.id, j.kind, j.tag])).toEqual([["update-u1", "room", "class-sisdig-2026-11-26"]]);
  expect(run(now, [upd({ date: "2026-11-24" })])).toEqual([]);
  expect(run(now, [upd({ date: "2026-11-26", createdAt: at("2026-11-24", "11:00") })])).toEqual([]);
});

test("render: language, WIB times, truncation, empty note", () => {
  const now = at("2026-11-25", "12:00");
  const [room] = run(now, [upd({ date: "2026-11-26", newRoom: "R305", note: "" })]);
  // Thursday's slot starts 00:15.
  expect(render(room, "en", now)).toEqual({ title: "TKE-201: room moved", body: "Tomorrow 00:15 → R305." });
  expect(render(room, "id", now).body).toBe("Besok 00.15 → R305.");
  const [absent] = run(now, [upd({ kind: "absent", note: "x".repeat(100) })]);
  expect(render(absent, "en", now).body).toMatch(/^Today 08:00: lecturer absent\. x{79}…$/);

  const a: AssignmentIn = { id: "a1", classId: "sisdig", title: "A".repeat(50), dueAt: at("2026-11-26", "23:59") };
  const [d24] = dues(at("2026-11-25", "23:59"), a);
  expect(render(d24, "en", now)).toEqual({ title: `Due in 24 hours: ${"A".repeat(39)}…`, body: "TKE-201 · due Thu 23:59 WIB" });
  expect(render(d24, "id", now).body).toBe("TKE-201 · tenggat Kam 23.59 WIB");

  const [soon] = run(at("2026-11-25", "07:30"));
  expect(render(soon, "id", now)).toEqual({ title: "TKE-201 mulai 30 menit lagi", body: "Sistem Digital · 08.00 · R301" });
});
