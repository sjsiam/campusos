// Seeds demo data: Auth users (+ role claims) in the Auth emulator, everything else in Postgres (DATABASE_URL).
// Needs `npm run emulators`, `npm run db` and `npm run db:migrate` first. Safe to re-run (fixed ids).
// CLASSES is the real CE timetable (docs/planning/timetable-template.md, CO-13). Users, assignments and updates
// are demo data around it. No lecturer NIPs, no real students.
import { auth } from "./admin";
import { sql } from "../lib/db";
import { wib } from "../lib/today";
import type { Assignment, CampusClass, ClassType, ClassUpdate, UserProfile } from "../lib/types";

const MIN = 60_000;
const nowWib = wib(new Date());
const today = nowWib.date;
const dayOffset = (n: number) => wib(new Date(Date.now() + n * 864e5)).date;
const dueAt = (date: string, t: string) => new Date(`${date}T${t}:00+07:00`);

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
const idOf = (code: string, section: string, type: string) => `${code}-${section}-${type}`.toLowerCase();

// Editors (CO-14 assigns real ones later): Siti (class rep) edits every lecture, Fajar (lab assistant) the labs,
// rep-demo two lectures. QA's API tests need a seeded class rep-demo does NOT edit (e.g. fftt1001-23-lecture).
const REP_EDITS = ["stik1005-14-lecture", "stik1009-14-lecture"];
const CLASSES: CampusClass[] = Object.values(TIMETABLE.reduce<Record<string, CampusClass>>((acc, [code, name, section, type, lecturer, day, start, end, room]) => {
  const id = idOf(code, section, type);
  acc[id] ??= { id, courseCode: code, courseName: name, section, type, lecturer, slots: [],
    editors: type === "lab" ? ["fajar-demo"] : ["siti-demo", ...(REP_EDITS.includes(id) ? ["rep-demo"] : [])] };
  acc[id].slots.push({ day: DAY[day], start, end, room });
  return acc;
}, {}));
const ALL = CLASSES.map((c) => c.id);
const byId = (id: string) => CLASSES.find((c) => c.id === id)!;

// Demo sign-in: in the emulator's Google popup, pick the account with this email. Ids are used by QA's API tests.
const USERS: (UserProfile & { uid: string; email: string; role?: "admin" | "classrep" | "labassistant" | "lecturer" })[] = [
  { uid: "student-demo", email: "student@demo.campusos", name: "Demo Student", lang: "id", classIds: ALL, fcmTokens: [] },
  { uid: "rep-demo", email: "rep@demo.campusos", name: "Demo Class Rep", lang: "id", classIds: ALL, fcmTokens: [] },
  { uid: "admin-demo", email: "admin@demo.campusos", name: "Demo Admin", lang: "en", classIds: [], fcmTokens: [], role: "admin" },
  { uid: "siti-demo", email: "siti.rahma@demo.campusos", name: "Siti Rahma", lang: "id", classIds: ALL, fcmTokens: [], role: "classrep" },
  { uid: "fajar-demo", email: "fajar@demo.campusos", name: "Fajar Maulana", lang: "id", classIds: CLASSES.filter((c) => c.type === "lab").map((c) => c.id), fcmTokens: [], role: "labassistant" },
];
// Removed by this version: the invented lecturer persona and the v3 sample classes.
const OLD_UIDS = ["meutia-demo"];
const OLD_CLASSES = ["sisdig-a", "strukdat-a", "matdis-b", "sisdig-lab-a", "advising-a"];

/** Sessions on the n-th day from today (0 = today), by start then end. */
const sessionsOn = (n: number) => {
  const day = (nowWib.day + n) % 7;
  return CLASSES.flatMap((c) => c.slots.filter((s) => s.day === day).map((s) => ({ cls: c, ...s })))
    .sort((a, b) => a.start.localeCompare(b.start) || a.end.localeCompare(b.end));
};
// Story day: today, or the next day with two or more classes (Mon, Thu, Fri, Sat qualify). Its first class is
// moved (posted 07:58 today), its second cancelled (09:47 today), as in the v3 story.
const storyN = [0, 1, 2, 3, 4, 5, 6].find((n) => sessionsOn(n).length >= 2)!;
const [moveS, cancelS] = sessionsOn(storyN);
const storyDate = dayOffset(storyN);
const postedAt = (t: string) => new Date(`${today}T${t}:00+07:00`);
/** Next session date of a class after the story day. */
const nextDate = (id: string) => {
  const n = [1, 2, 3, 4, 5, 6, 7].map((k) => storyN + k).find((k) => byId(id).slots.some((s) => s.day === (nowWib.day + k) % 7))!;
  return dayOffset(n);
};
const story = [moveS.cls.id, cancelS.cls.id];
const repClass = REP_EDITS.find((id) => !story.includes(id))!;
const otherClass = ["stik1003-11-lecture", "fftt1007-ce03-lecture", "stik1013-13-lecture"].find((id) => !story.includes(id))!;

const UPDATES: (Omit<ClassUpdate, "createdAt"> & { createdAt: Date })[] = [
  { id: "u-story-move", classId: moveS.cls.id, kind: "room_change", date: storyDate, newRoom: moveS.room === "F01 - 305" ? "F01 - 307" : "F01 - 305",
    note: "Proyektor di ruang biasa rusak.", createdBy: moveS.cls.type === "lab" ? "fajar-demo" : "siti-demo", createdAt: postedAt("07:58") },
  { id: "u-story-cancel", classId: cancelS.cls.id, kind: "absent", date: storyDate,
    note: cancelS.cls.type === "lab" ? "Asisten ada ujian, praktikum diganti minggu depan. Info lanjut di grup WA." : "Kelas hari ini ditiadakan. Info lanjut di grup WA.",
    createdBy: cancelS.cls.type === "lab" ? "fajar-demo" : "siti-demo", createdAt: postedAt("09:47") },
  { id: "u-other-move", classId: otherClass, kind: "room_change", date: nextDate(otherClass), newRoom: "F01 - 302", note: "Ruang biasa dipakai ujian susulan.",
    createdBy: "siti-demo", createdAt: new Date(`${dayOffset(-1)}T20:12:00+07:00`) },
  { id: "u-rep-cancel", classId: repClass, kind: "absent", date: nextDate(repClass), note: "Dosen dinas luar kota. Materi minggu ini dibaca mandiri.", // the rep relays the lecturer (L-6)
    createdBy: "rep-demo", createdAt: new Date(Date.now() - 2 * 864e5) },
];

const ASSIGNMENTS: (Omit<Assignment, "dueAt"> & { dueAt: Date })[] = [
  { id: "a-prog-1", classId: "stik1009-14-lecture", title: "Kuis 2: perbaikan jawaban", instructions: "Perbaiki jawaban kuis 2 yang salah, tulis tangan, foto jadi satu PDF.",
    links: [], dueAt: new Date(Date.now() - 10 * 60 * MIN - 26 * MIN), createdBy: "rep-demo" },
  { id: "a-logdig-1", classId: "stik1005-14-lecture", title: "Tugas 2: penyederhanaan fungsi dengan K-map (soal 1–10), kumpul di e-learning",
    instructions: "Sederhanakan fungsi soal 1–10 dengan K-map, tulis bentuk SOP dan POS, lalu gambar rangkaiannya.\n\nKumpulkan satu file PDF: NIM_Nama_Tugas2.pdf. Telat = nilai dikurangi 10% per hari.",
    links: ["https://elearning.usk.ac.id/mod/assign/view.php?id=4127"], dueAt: dueAt(today, "23:59"), createdBy: "rep-demo" },
  { id: "a-lab-1", classId: "stik1007-11-lab", title: "Laporan Praktikum Modul 1: gerbang logika dasar (format IEEE, maks 6 hlm)", instructions: "",
    links: [], dueAt: dueAt(dayOffset(2), "16:00"), createdBy: "fajar-demo" },
  { id: "a-mat-1", classId: "fftt1007-ce03-lecture", title: "Latihan soal limit dan turunan no. 1–15 ganjil", instructions: "",
    links: [], dueAt: dueAt(dayOffset(5), "07:30"), createdBy: "siti-demo" },
  { id: "a-prd-1", classId: "stik1003-11-lecture", title: "Proposal desain kelompok (maks 4 orang)", instructions: "",
    links: [], dueAt: dueAt(dayOffset(13), "23:59"), createdBy: "siti-demo" },
];

async function main() {
  await auth.deleteUsers([...USERS.map((u) => u.uid), ...OLD_UIDS]); // importUsers refuses to overwrite; missing uids are ignored
  const res = await auth.importUsers(USERS.map(({ uid, email, name, role }) => ({
    uid, email, displayName: name, emailVerified: true,
    customClaims: role ? { role } : undefined,
    providerData: [{ uid: `google-${uid}`, email, displayName: name, providerId: "google.com" }],
  })));
  if (res.failureCount) throw new Error(res.errors.map((e) => e.error.message).join("; "));

  await sql.begin(async (tx) => {
    // Replace the demo rows; deleting a class also deletes its assignments and updates.
    await tx`delete from users where uid in ${tx([...USERS.map((u) => u.uid), ...OLD_UIDS])}`;
    await tx`delete from classes where id in ${tx([...ALL, ...OLD_CLASSES])}`;
    // Reseeded items reuse their ids; forget their sent pushes so the demo alerts fire again.
    await tx`delete from notifications where class_id in ${tx([...ALL, ...OLD_CLASSES])}`;
    // Temp classes an interrupted QA test run left behind (tests/api.auth.test.ts names them qa1-…/qa2-…).
    await tx`delete from classes where id like 'qa1-%' or id like 'qa2-%'`;
    for (const { uid, name, lang, classIds, fcmTokens } of USERS) await tx`insert into users ${tx({ uid, name, lang, classIds, fcmTokens })}`;
    for (const { slots, ...c } of CLASSES) await tx`insert into classes ${tx({ ...c, slots: tx.json(slots as never) })}`;
    for (const a of ASSIGNMENTS) await tx`insert into assignments ${tx(a)}`;
    for (const u of UPDATES) await tx`insert into updates ${tx(u as Record<string, unknown>)}`;
  });
  console.log(`Story day ${storyDate}: ${moveS.cls.courseCode} moved, ${cancelS.cls.courseCode} cancelled (posted 07:58 / 09:47 today).`);
  console.log(`Seeded ${USERS.length} users, ${CLASSES.length} classes, ${ASSIGNMENTS.length} assignments, ${UPDATES.length} updates.`);
}

main().then(() => sql.end(), (e) => { console.error(e); process.exit(1); });
