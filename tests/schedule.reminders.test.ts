// CO-19 (QA): reminder windows not covered by lib/schedule.test.ts.
// Runs the whole file with TZ=UTC (Vercel's zone) so every result must come from WIB maths, not the machine.
process.env.TZ = "UTC";
import { describe, expect, it } from "vitest";
import { at, dueJobs, GRACE, type AssignmentIn, type UpdateIn } from "../lib/schedule";
import type { CampusClass } from "../lib/types";

const MIN = 60_000;
// Real-timetable shapes: Saturday lecture + lab at the same time, and a Sunday-midnight slot for the week wrap.
const pemrograman: CampusClass = {
  id: "stik1009-14-lecture", courseCode: "STIK1009", courseName: "Pemrograman I", section: "14", type: "lecture",
  lecturer: "x", editors: [], slots: [{ day: 6, start: "08:00", end: "09:40", room: "A21 - 201" }],
};
const praktikum: CampusClass = {
  id: "stik1011-14-lab", courseCode: "STIK1011", courseName: "Praktikum Pemrograman I", section: "14", type: "lab",
  lecturer: "x", editors: [], slots: [{ day: 6, start: "08:00", end: "08:50", room: "Laboratorium Fakultas Teknik 5" }],
};
const sundayNight: CampusClass = {
  id: "late", courseCode: "LATE", courseName: "Late", section: "1", type: "lecture",
  lecturer: "x", editors: [], slots: [{ day: 0, start: "00:15", end: "01:00", room: "R1" }],
};
const classes = [pemrograman, praktikum, sundayNight];
const run = (now: Date, updates: UpdateIn[] = [], assignments: AssignmentIn[] = []) =>
  dueJobs({ classes, updates, assignments }, now);
const ids = (now: Date, u: UpdateIn[] = []) => run(now, u).filter((j) => j.kind.startsWith("class")).map((j) => j.id).sort();
const upd = (u: Partial<UpdateIn>): UpdateIn => ({
  id: "u1", classId: "stik1009-14-lecture", kind: "absent", date: "2026-11-28", note: "", createdAt: at("2026-11-27", "20:00"), ...u,
});

describe("runs in UTC", () => {
  it("the process really is in UTC (guards the rest of the file)", () => {
    expect(new Date("2026-11-28T00:00:00Z").getTimezoneOffset()).toBe(0);
  });
});

describe("Saturday classes (Sat 2026-11-28)", () => {
  it("both 08:00 sessions get their reminder at 07:30 WIB (= 00:30 UTC)", () => {
    expect(ids(new Date("2026-11-28T00:30:00Z"))).toEqual([
      "class-stik1009-14-lecture-2026-11-28-08:00", "class-stik1011-14-lab-2026-11-28-08:00",
    ]);
  });
  it("nothing at 07:29 or after the grace window", () => {
    expect(ids(at("2026-11-28", "07:29"))).toEqual([]);
    expect(ids(new Date(at("2026-11-28", "07:30").getTime() + GRACE))).toEqual([]);
  });
  it("a cancelled Saturday lecture is skipped, the lab at the same time still fires", () => {
    expect(ids(at("2026-11-28", "07:35"), [upd({})])).toEqual(["class-stik1011-14-lab-2026-11-28-08:00"]);
  });
  it("Saturday 23:50 → the Sunday 00:15 session (week wraps 6 → 0)", () => {
    expect(ids(at("2026-11-28", "23:50"))).toEqual(["class-late-2026-11-29-00:15"]);
  });
  it("no reminders on a day without slots (Fri 07:30)", () => {
    expect(ids(at("2026-11-27", "07:30"))).toEqual([]);
  });
});

describe("updates apply to their own date only", () => {
  it("a cancellation for next Saturday does not cancel this Saturday", () => {
    const nextWeek = upd({ date: "2026-12-05" });
    expect(ids(at("2026-11-28", "07:35"), [nextWeek])).toContain("class-stik1009-14-lecture-2026-11-28-08:00");
  });
  it("a room change for this Saturday is used; the moved room is in the job", () => {
    const moved = upd({ kind: "room_change", newRoom: "F01 - 305" });
    const job = run(at("2026-11-28", "07:35"), [moved]).find((j) => j.classId === "stik1009-14-lecture" && j.kind === "classSoonMoved");
    expect(job?.vars.room).toBe("F01 - 305");
  });
});

describe("deadlines across midnight (WIB)", () => {
  const a: AssignmentIn = { id: "a00", classId: "stik1009-14-lecture", title: "Tugas", dueAt: at("2026-11-29", "00:30") };
  const due = (now: Date) => run(now, [], [a]).filter((j) => j.kind.startsWith("due")).map((j) => j.id);
  it("due 00:30 Sun → 1 h reminder at 23:30 on Saturday", () => {
    expect(due(at("2026-11-28", "23:29"))).toEqual([]);
    expect(due(at("2026-11-28", "23:30"))).toEqual(["due1-a00"]);
  });
  it("due 00:30 Sun → 24 h reminder at 00:30 on Saturday (= Fri 17:30 UTC)", () => {
    expect(due(new Date("2026-11-27T17:30:00Z"))).toEqual(["due24-a00"]);
  });
  it("deadline for a class that no longer exists sends nothing", () => {
    const orphan = { ...a, classId: "gone" };
    expect(run(at("2026-11-28", "23:30"), [], [orphan]).filter((j) => j.kind.startsWith("due"))).toEqual([]);
  });
});

describe("no double send within a window", () => {
  // The cron runs every 5 min and a window is 15 min wide, so dueJobs returns the same job up to 3 times.
  // Sending once relies on the id being identical in every run (the notify route claims ids in the DB, see C-06).
  it("class reminder id is the same at +0, +5 and +10 min", () => {
    const runs = [0, 5, 10].map((m) => ids(new Date(at("2026-11-28", "07:30").getTime() + m * MIN)));
    expect(runs[1]).toEqual(runs[0]);
    expect(runs[2]).toEqual(runs[0]);
  });
  it("deadline id is the same across the window and differs between 24 h and 1 h", () => {
    const a: AssignmentIn = { id: "a1", classId: "stik1011-14-lab", title: "Lap", dueAt: at("2026-11-28", "16:00") };
    const at1h = (m: number) => run(new Date(at("2026-11-28", "15:00").getTime() + m * MIN), [], [a]).map((j) => j.id).filter((i) => i.startsWith("due"));
    expect(at1h(0)).toEqual(["due1-a1"]);
    expect(at1h(10)).toEqual(["due1-a1"]);
    expect(run(at("2026-11-27", "16:00"), [], [a]).map((j) => j.id).filter((i) => i.startsWith("due"))).toEqual(["due24-a1"]);
  });
  it("update alert id is the same on every run while it's fresh", () => {
    const u = upd({ kind: "room_change", newRoom: "F01 - 305", createdAt: at("2026-11-28", "06:00") });
    const a = run(at("2026-11-28", "06:05"), [u]).filter((j) => j.kind === "room").map((j) => j.id);
    const b = run(at("2026-11-28", "09:00"), [u]).filter((j) => j.kind === "room").map((j) => j.id);
    expect(a).toEqual(["update-u1"]);
    expect(b).toEqual(a);
  });
});
