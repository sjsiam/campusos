// The real CE timetable (docs/planning/timetable-template.md, CO-13), shared by the demo seed and
// `npm run seed:classes` (production). No lecturer NIPs.
import { isLocalDb } from "../lib/db";
import type { CampusClass, ClassType } from "../lib/types";

// [courseCode, courseName, section, type, lecturer, day, start, end, room], one row per weekly slot.
const DAY = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 } as const;
const TIMETABLE: [string, string, string, ClassType, string, keyof typeof DAY, string, string, string][] = [
  ["FFTT1001", "Fisika I", "23", "lecture", "Safrizal, S.T., M.T.", "Wed", "08:00", "10:30", "F01 - 301"],
  ["FFTT1007", "Matematika I", "CE03", "lecture", "Dr. Hendrik Leo, S.T., M.T.", "Tue", "08:00", "10:30", "F01 - 205"],
  ["MKWU1002", "Kewarganegaraan", "45", "lecture", "Hasbi Ali, S.Pd, M.Si", "Thu", "16:35", "18:15", "11.02.005"],
  ["MKWU1006", "Pembinaan Karakter I", "D29", "lecture", "Dr. Ir. Kahlil, S.T., M.Eng.", "Sat", "14:00", "14:50", "MKPK"],
  ["STIK1001", "Pengantar Teknik Komputer", "14", "lecture", "Ir. Sayed Muchallil, S.T., M.Sc., IPM", "Thu", "08:00", "09:40", "A25 - 201"],
  ["STIK1003", "Pengantar Rekayasa dan Desain", "11", "lecture", "Prof. Dr. Ir. Yuwaldi Away, M.Sc", "Mon", "10:45", "12:25", "Balee Muasyarah"],
  ["STIK1005", "Logika Digital", "14", "lecture", "Zulhelmi, S.T., M. Sc.", "Fri", "10:45", "12:25", "F01 - 303"],
  ["STIK1007", "Praktikum Logika Digital", "11", "lab", "Niza Aulia, S.ST., M.T.", "Fri", "10:45", "11:35", "Laboratorium Fakultas Teknik 7"],
  ["STIK1009", "Pemrograman I", "14", "lecture", "Ardiansyah, BSEE., M.Sc", "Sat", "08:00", "09:40", "A21 - 201"],
  ["STIK1011", "Praktikum Pemrograman I", "14", "lab", "Ardiansyah, BSEE., M.Sc", "Sat", "08:00", "08:50", "Laboratorium Fakultas Teknik 5"],
  // Title cut off in the source screenshot (open item for Siam), so only the name.
  ["STIK1013", "Biologi", "13", "lecture", "Hendrix Indra Kusuma", "Mon", "14:00", "15:40", "F01 - 311"],
];
export const idOf = (code: string, section: string, type: string) => `${code}-${section}-${type}`.toLowerCase();


/** One class per courseCode + section + type, each row a weekly slot. Editors are not part of the timetable. */
export const timetableClasses = (): Omit<CampusClass, "editors">[] => Object.values(
  TIMETABLE.reduce<Record<string, Omit<CampusClass, "editors">>>((acc, [code, name, section, type, lecturer, day, start, end, room]) => {
    const id = idOf(code, section, type);
    acc[id] ??= { id, courseCode: code, courseName: name, section, type, lecturer, slots: [] };
    acc[id].slots.push({ day: DAY[day], start, end, room });
    return acc;
  }, {}));

/** The demo seed deletes and re-creates rows and Auth users: local Postgres only, never Neon. */
export function requireLocalDb() {
  if (!isLocalDb(process.env.DATABASE_URL ?? "")) throw new Error("Refusing to run: DATABASE_URL is not a local database (127.0.0.1 / localhost).");
}
