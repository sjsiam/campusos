// Request body schemas for the data API. Objects are strict: unknown keys (e.g. `createdBy`) are a 400.
import { z } from "zod";

const id = z.string().regex(/^[A-Za-z0-9_-]{1,64}$/, "letters, digits, _ or -, max 64");
const uid = z.string().min(1).max(128);
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "HH:MM");
// Round-trip: Date rolls 2026-02-30 over to 03-02, so an impossible date comes back different (QA-07).
export const isRealDate = (d: string) => {
  const t = new Date(`${d}T00:00:00Z`);
  return !Number.isNaN(t.getTime()) && t.toISOString().slice(0, 10) === d;
};
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD").refine(isRealDate, "invalid date");
const text = (max: number) => z.string().trim().max(max);

export const classIdsParam = z.array(id).max(50);

export const profilePatch = z.strictObject({
  name: text(100),
  lang: z.enum(["en", "id"]),
  classIds: z.array(id).max(50),
  fcmTokens: z.array(z.string().min(1).max(4096)).max(20),
}).partial();

export const fcmToken = z.strictObject({ token: z.string().min(1).max(4096) });

const slot = z.strictObject({ day: z.number().int().min(0).max(6), start: time, end: time, room: text(100) });
// Field sets without defaults: zod applies .default() even inside .partial(), which would blank fields on PATCH.
const classFields = {
  courseCode: text(32).min(1),
  courseName: text(200).min(1),
  section: text(32).min(1),
  type: z.enum(["lecture", "lab", "advising"]),
  lecturer: text(200),
  slots: z.array(slot).max(20),
  editors: z.array(uid).max(50),
};
export const classCreate = z.strictObject({
  id, ...classFields,
  lecturer: classFields.lecturer.default(""), slots: classFields.slots.default([]), editors: classFields.editors.default([]),
});
export const classPatch = z.strictObject(classFields).partial();

const link = z.string().max(2000).regex(/^https?:\/\/\S+$/, "http(s) URL");
const assignmentFields = {
  // Limits from docs/design/screens.md §9 (QA-06).
  title: text(100).min(1),
  instructions: text(2000),
  links: z.array(link).max(5),
  dueAt: z.iso.datetime({ offset: true }).transform((s) => new Date(s)),
};
export const assignmentCreate = z.strictObject({
  classId: id, ...assignmentFields,
  instructions: assignmentFields.instructions.default(""), links: assignmentFields.links.default([]),
});
// classId and createdBy can never change, so they aren't accepted.
export const assignmentPatch = z.strictObject(assignmentFields).partial();

const updateFields = {
  kind: z.enum(["absent", "room_change"]), // v3: reschedule removed
  date,
  newRoom: text(100).min(1).nullable().optional(),
  note: text(200),
};
export const updateCreate = z.strictObject({ classId: id, ...updateFields, note: updateFields.note.default("") }).superRefine((u, ctx) => {
  if (u.kind === "room_change" && !u.newRoom) ctx.addIssue({ code: "custom", path: ["newRoom"], message: "required for room_change" });
});
export const updatePatch = z.strictObject(updateFields).partial();
