import { expect, test } from "vitest";
import { buildTimeline, countdown, dueGroup, upcomingSessions, wib, withGaps } from "./today";
import type { CampusClass, ClassUpdate } from "./types";

test("wib converts to campus time across the UTC date line", () => {
  // 2026-11-25 20:30 UTC = Thu 2026-11-26 03:30 WIB
  expect(wib(new Date("2026-11-25T20:30:00Z"))).toEqual({ date: "2026-11-26", day: 4, time: "03:30" });
});

const cls = (id: string, start: string, end: string): CampusClass => ({
  id, courseCode: id, courseName: id, section: "A", type: "lecture", lecturer: "x", editors: [],
  slots: [{ day: 3, start, end, room: "R1" }, { day: 4, start, end, room: "R1" }],
});
const upd = (classId: string, kind: ClassUpdate["kind"], extra: Partial<ClassUpdate> = {}) =>
  ({ id: classId + kind, classId, kind, date: "2026-11-25", note: "", createdBy: "u", ...extra }) as ClassUpdate;

test("timeline: day filter, newest update wins, sorted by start, now/past", () => {
  const rows = buildTimeline(
    [cls("b", "10:00", "11:40"), cls("a", "08:00", "09:40")],
    [upd("b", "room_change", { newRoom: "R9" }), upd("b", "absent"), upd("a", "room_change", { date: "2026-11-26" })],
    "2026-11-25", 3, "08:30",
  );
  expect(rows.map((r) => [r.cls.id, r.start, r.end, r.state, r.update?.kind])).toEqual([
    ["a", "08:00", "09:40", "now", undefined],
    ["b", "10:00", "11:40", "next", "room_change"],
  ]);
  expect(buildTimeline([cls("a", "08:00", "09:40")], [], "x", 4, null)[0].state).toBe("upcoming");
  expect(buildTimeline([cls("a", "08:00", "09:40")], [], "x", 4, "09:40")[0].state).toBe("past");
  expect(buildTimeline([cls("a", "08:00", "09:40")], [], "x", 1, null)).toEqual([]);
});

test("countdown units round down, late after due, far beyond 7 days", () => {
  const now = new Date("2026-11-25T03:25:00Z"), at = (h: number) => new Date(now.getTime() + h * 36e5);
  expect(countdown(at(-10.4), now)).toEqual({ n: 10, unit: "h", late: true, far: false });
  expect(countdown(at(0.2), now)).toEqual({ n: 12, unit: "m", late: false, far: false });
  expect(countdown(at(0), now)).toEqual({ n: 1, unit: "m", late: false, far: false });
  expect(countdown(at(13.5), now)).toEqual({ n: 13, unit: "h", late: false, far: false });
  expect(countdown(at(53), now)).toEqual({ n: 2, unit: "d", late: false, far: false });
  expect(countdown(at(24 * 13.5), now)).toEqual({ n: 13, unit: "d", late: false, far: true });
});

test("gap rows only for free time of 30 min or more, overlaps count as busy", () => {
  const rows = buildTimeline(
    [cls("a", "09:20", "11:00"), cls("b", "11:10", "12:00"), cls("c", "13:30", "16:30"), cls("d", "16:00", "16:50")],
    [], "2026-11-25", 3, null,
  );
  expect(withGaps(rows).map((r) => ("gap" in r ? r.gap.join("-") : r.cls.id))).toEqual(["a", "b", "12:00-13:30", "c", "d"]);
});

test("timeline: 'next' is the first not-cancelled upcoming class, only one, only today", () => {
  const classes = [cls("a", "08:00", "09:40"), cls("b", "10:00", "11:40"), cls("c", "13:00", "14:40"), cls("d", "15:00", "16:00")];
  const absentB = [upd("b", "absent")];
  const states = (nowTime: string | null) =>
    buildTimeline(classes, absentB, "2026-11-25", 3, nowTime).map((r) => `${r.cls.id}:${r.state}`);
  // b is cancelled, so c is next even while a is "now".
  expect(states("08:30")).toEqual(["a:now", "b:upcoming", "c:next", "d:upcoming"]);
  expect(states("07:00")).toEqual(["a:next", "b:upcoming", "c:upcoming", "d:upcoming"]);
  expect(states("16:00")).toEqual(["a:past", "b:past", "c:past", "d:past"]);
  expect(states(null)).toEqual(["a:upcoming", "b:upcoming", "c:upcoming", "d:upcoming"]); // Tomorrow tab
});

test("upcoming sessions include the one in progress and roll into next week", () => {
  const c = cls("a", "09:20", "11:00"); // Wed + Thu
  const wed1030 = new Date("2026-11-25T03:30:00Z"); // 10:30 WIB
  expect(upcomingSessions(c, wed1030, 3).map((s) => `${s.date} ${s.start}`)).toEqual(["2026-11-25 09:20", "2026-11-26 09:20", "2026-12-02 09:20"]);
  expect(upcomingSessions(c, new Date("2026-11-25T04:00:00Z"), 1)[0].date).toBe("2026-11-26"); // 11:00 ended
});

test("due groups follow campus dates", () => {
  const now = new Date("2026-11-25T03:25:00Z"); // Wed 10:25 WIB
  expect(dueGroup(new Date("2026-11-24T16:59:00Z"), now)).toBe("overdue");
  expect(dueGroup(new Date("2026-11-25T16:59:00Z"), now)).toBe("today"); // 23:59 WIB
  expect(dueGroup(new Date("2026-11-30T00:30:00Z"), now)).toBe("week");
  expect(dueGroup(new Date("2026-12-08T16:59:00Z"), now)).toBe("later");
});

test("timeline: overlapping classes with the same start keep a stable order and one 'next'", () => {
  const rows = buildTimeline([cls("lecture", "10:45", "12:25"), cls("lab", "10:45", "11:35")], [], "2026-11-25", 3, "10:00");
  expect(rows.map((r) => [r.cls.id, r.state])).toEqual([["lab", "next"], ["lecture", "upcoming"]]);
  expect(withGaps(rows).length).toBe(2);
});
