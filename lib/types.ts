// Shared FE/BE contract. Mirrors the Postgres schema in db/migrations (camelCase here, snake_case there).

export type Lang = "en" | "id";
export type Role = "student" | "classrep" | "labassistant" | "lecturer" | "admin";
export type ClassType = "lecture" | "lab" | "advising";
export type UpdateKind = "absent" | "room_change"; // v3: no reschedule

export interface UserProfile {
  name: string;
  lang: Lang;
  classIds: string[];
  fcmTokens: string[];
}

export interface Slot {
  day: number; // 0 = Sunday … 6 = Saturday (Date#getDay)
  start: string; // "08:00" local campus time
  end: string;
  room: string;
}

export interface CampusClass {
  id: string;
  courseCode: string;
  courseName: string;
  section: string;
  type: ClassType;
  lecturer: string;
  slots: Slot[];
  editors: string[]; // uids allowed to edit this class and post its updates
  studentCount?: number; // GET /api/classes only
}

export interface Assignment {
  id: string;
  classId: string;
  title: string;
  instructions: string;
  links: string[];
  dueAt: Date;
  createdBy: string;
  createdByName?: string | null; // list responses only (users.name)
  createdByRole?: Role; // list responses only (poster's role claim; class rep when none)
  createdAt?: Date;
}

export interface ClassUpdate {
  id: string;
  classId: string;
  kind: UpdateKind;
  date: string; // "2026-12-01", the affected session
  newRoom?: string;
  note: string;
  createdBy: string;
  createdByName?: string | null; // list responses only (users.name)
  createdByRole?: Role; // list responses only (poster's role claim; class rep when none)
  createdAt: Date;
}
