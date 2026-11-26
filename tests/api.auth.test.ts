// CO-43: authorization tests for the Postgres data API (docs/qa/api-auth-test-plan.md; IDs match).
// Black-box over HTTP. Needs, already running: Auth emulator (:9099), `npm run db` (:54329, migrated),
// and `next dev` (:3000) with NEXT_PUBLIC_USE_EMULATORS=true. Override with API_URL / FIREBASE_AUTH_EMULATOR_HOST.
// Leaves the seeded demo data alone: writes go to two throwaway classes (deleted at the end, which
// cascades to their items). Profile writes use the uid `qa-student`, whose row stays (no delete route).
import { execFileSync } from "node:child_process";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const API = process.env.API_URL ?? "http://127.0.0.1:3000";
const EMU = (process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099");
const RUN = Date.now().toString(36);
const QA1 = `qa1-${RUN}`; // editors: rep-demo
const QA2 = `qa2-${RUN}`; // editors: qa-rep-b
const SEEDED_OTHER = "fftt1001-23-lecture"; // seeded class rep-demo does not edit

// ---- tokens ---------------------------------------------------------------------------------
const { initializeApp, getApps } = await import("firebase-admin/app");
const { getAuth } = await import("firebase-admin/auth");
const adminAuth = getAuth(getApps()[0] ?? initializeApp({ projectId: "demo-campusos" }));

async function token(uid: string, claims?: Record<string, unknown>) {
  const custom = await adminAuth.createCustomToken(uid, claims);
  const res = await fetch(`http://${EMU}/identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=demo-key`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token: custom, returnSecureToken: true }),
  });
  const j = (await res.json()) as { idToken?: string; error?: { message: string } };
  if (!j.idToken) throw new Error(`token for ${uid}: ${j.error?.message}`);
  return j.idToken;
}
const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString("base64url");
/** Same token with payload fields replaced (emulator tokens are unsigned, so this is what an attacker could send). */
const forge = (tok: string, patch: Record<string, unknown>) => {
  const [h, p, s] = tok.split(".");
  return [h, b64({ ...JSON.parse(Buffer.from(p, "base64url").toString()), ...patch }), s].join(".");
};

let T: Record<"student" | "rep" | "repB" | "admin" | "qa" | "classrep", string>;

// ---- http -----------------------------------------------------------------------------------
// Loose view of a JSON response: an object row, or a list of them.
type Row = { [k: string]: unknown; id: string; editors?: string[]; fcmTokens?: string[] };
type Res = { status: number; body: Row & Row[]; text: string };
async function call(method: string, path: string, tok?: string | null, body?: unknown, raw?: string): Promise<Res> {
  const headers: Record<string, string> = {};
  if (tok) headers.authorization = `Bearer ${tok}`;
  if (body !== undefined || raw !== undefined) headers["content-type"] = "application/json";
  const res = await fetch(API + path, { method, headers, body: raw ?? (body === undefined ? undefined : JSON.stringify(body)) });
  const text = await res.text();
  let parsed: unknown = null;
  try { parsed = JSON.parse(text); } catch {}
  return { status: res.status, body: parsed as Row & Row[], text };
}
const get = (p: string, t?: string | null) => call("GET", p, t);
const post = (p: string, t: string | null, b?: unknown) => call("POST", p, t, b);
const patch = (p: string, t: string | null, b?: unknown) => call("PATCH", p, t, b);
const del = (p: string, t: string | null) => call("DELETE", p, t);
const put = (p: string, t: string | null, b?: unknown) => call("PUT", p, t, b);

const classOf = async (id: string) => (await get("/api/classes", T.student)).body.find((c) => c.id === id) as Row; // undefined at runtime when missing
const items = async (kind: "updates" | "assignments", classId: string) => (await get(`/api/${kind}?classIds=${classId}`, T.student)).body;
const itemById = async (kind: "updates" | "assignments", classId: string, id: string) => (await items(kind, classId)).find((x) => x.id === id) as Row; // undefined at runtime when missing

const today = new Date().toISOString().slice(0, 10);
const upd = (classId: string, extra: Record<string, unknown> = {}) => ({ classId, kind: "absent", date: today, note: "qa", ...extra });
const asg = (classId: string, extra: Record<string, unknown> = {}) =>
  ({ classId, title: "QA assignment", dueAt: new Date(Date.now() + 864e5).toISOString(), ...extra });
const cls = (id: string, editors: string[]) =>
  ({ id, courseCode: "QA-000", courseName: "QA temp class", section: "Z", type: "lecture", editors, slots: [{ day: 1, start: "08:00", end: "09:40", room: "R1" }] });

let U1: string; // update on QA1 by rep-demo
let A1: string; // assignment on QA1 by rep-demo

beforeAll(async () => {
  const up = await fetch(API + "/api/classes").catch(() => null);
  if (!up) throw new Error(`API not reachable at ${API}: start next dev (and npm run db, the Auth emulator) first`);
  T = {
    student: await token("student-demo"),
    rep: await token("rep-demo"),
    repB: await token("qa-rep-b"),
    admin: await token("admin-demo"),
    qa: await token("qa-student"),
    classrep: await token("qa-claim", { role: "classrep" }),
  };
  expect((await post("/api/classes", T.admin, cls(QA1, ["rep-demo"]))).status).toBe(201);
  expect((await post("/api/classes", T.admin, cls(QA2, ["qa-rep-b"]))).status).toBe(201);
  const u = await post("/api/updates", T.rep, upd(QA1));
  const a = await post("/api/assignments", T.rep, asg(QA1));
  expect([u.status, a.status]).toEqual([201, 201]);
  U1 = u.body.id; A1 = a.body.id;
}, 30_000);

afterAll(async () => {
  if (!T) return;
  for (const id of [QA1, QA2]) await del(`/api/classes/${id}`, T.admin);
});

// ---- 1. Authentication ----------------------------------------------------------------------
const PROTECTED: [string, string][] = [
  ["GET", "/api/me"], ["PUT", "/api/me"], ["POST", "/api/me/fcm-tokens"],
  ["GET", "/api/classes"], ["POST", "/api/classes"], ["PATCH", "/api/classes/stik1005-14-lecture"], ["DELETE", "/api/classes/stik1005-14-lecture"],
  ["GET", "/api/assignments?classIds=stik1005-14-lecture"], ["POST", "/api/assignments"], ["PATCH", "/api/assignments/x"], ["DELETE", "/api/assignments/x"],
  ["GET", "/api/updates?classIds=stik1005-14-lecture"], ["POST", "/api/updates"], ["PATCH", "/api/updates/x"], ["DELETE", "/api/updates/x"],
];

describe("1. authentication", () => {
  it.each(PROTECTED)("AU-01 %s %s without a token → 401", async (m, p) => {
    const r = await call(m, p, null, m === "GET" || m === "DELETE" ? undefined : {});
    expect(r.status).toBe(401);
  });

  it("AU-02 garbage bearer token → 401", async () => {
    expect((await get("/api/classes", "garbage")).status).toBe(401);
    expect((await post("/api/updates", "a.b.c", upd(QA1))).status).toBe(401);
  });

  it("AU-03 expired token → 401", async () => {
    const past = Math.floor(Date.now() / 1000) - 7200;
    expect((await get("/api/me", forge(T.rep, { iat: past - 3600, exp: past }))).status).toBe(401);
  });

  it("AU-04/AU-06 production config (no emulator) rejects unsigned and tampered tokens", () => {
    // Fresh process without FIREBASE_AUTH_EMULATOR_HOST: firebase-admin must refuse emulator-style tokens.
    const forged = forge(T.rep, { sub: "admin-demo", user_id: "admin-demo", role: "admin" });
    const script = `
      const { initializeApp } = require("firebase-admin/app"); const { getAuth } = require("firebase-admin/auth");
      getAuth(initializeApp({ projectId: "demo-campusos" })).verifyIdToken(process.argv[1])
        .then(() => console.log("ACCEPTED"), (e) => console.log("REJECTED " + e.code));`;
    const env = { ...process.env };
    delete env.FIREBASE_AUTH_EMULATOR_HOST; delete env.NEXT_PUBLIC_USE_EMULATORS;
    for (const t of [T.rep, forged]) {
      const out = execFileSync(process.execPath, ["-e", script, t], { env, encoding: "utf8", timeout: 20_000 });
      expect(out).toMatch(/^REJECTED/);
    }
  });

  it("AU-06 lib/admin.ts refuses emulator mode on Vercel", () => {
    const env = { ...process.env, VERCEL: "1", NEXT_PUBLIC_USE_EMULATORS: "true" };
    expect(() => execFileSync("npx", ["tsx", "-e", "import('./lib/admin.ts')"], { env, encoding: "utf8", stdio: "pipe", timeout: 30_000 }))
      .toThrow(/must not be set on Vercel/);
  });

  it("AU-05 token for another Firebase project (wrong aud/iss) → 401", async () => {
    const t = forge(T.rep, { aud: "other-project", iss: "https://securetoken.google.com/other-project" });
    expect((await get("/api/me", t)).status).toBe(401);
  });

  it("AU-07 token only in query string or cookie → 401", async () => {
    expect((await get(`/api/classes?token=${T.student}`)).status).toBe(401);
    const r = await fetch(API + "/api/classes", { headers: { cookie: `token=${T.student}; __session=${T.student}` } });
    expect(r.status).toBe(401);
  });

  it("AU-08 error bodies leak no stack, SQL or table names", async () => {
    const rs = [
      await get("/api/classes", "garbage"),
      await post("/api/updates", T.student, upd(QA1)),
      await post("/api/updates", T.rep, upd("nope-" + RUN)),
      await call("POST", "/api/updates", T.rep, undefined, "{bad json"),
      await get("/api/updates?classIds=x')%20or%201=1--", T.student),
    ];
    for (const r of rs) {
      expect(r.status).toBeGreaterThanOrEqual(400);
      expect(r.text).not.toMatch(/\bselect\b|\binsert\b|\bfrom (classes|updates|assignments|users)\b|\n\s+at |postgres|node_modules/i);
    }
  });
});

// ---- 2. Carried over from the Firestore rules tests ------------------------------------------
describe("2. signed-out and student", () => {
  it("R-01 signed-out reads → 401", async () => {
    for (const p of ["/api/classes", "/api/assignments?classIds=stik1005-14-lecture", "/api/updates?classIds=stik1005-14-lecture", "/api/me"])
      expect((await get(p)).status).toBe(401);
  });

  it("R-02 student reads classes, assignments, updates → 200", async () => {
    expect((await get("/api/classes", T.student)).status).toBe(200);
    const a = await get(`/api/assignments?classIds=${QA1}`, T.student);
    const u = await get(`/api/updates?classIds=${QA1}`, T.student);
    expect([a.status, u.status]).toEqual([200, 200]);
    expect(a.body.some((x) => x.id === A1)).toBe(true);
    expect(u.body.some((x) => x.id === U1)).toBe(true);
  });

  it("R-03 student cannot create an update or assignment", async () => {
    const before = [(await items("updates", QA1)).length, (await items("assignments", QA1)).length];
    expect((await post("/api/updates", T.student, upd(QA1))).status).toBe(403);
    expect((await post("/api/assignments", T.student, asg(QA1))).status).toBe(403);
    expect([(await items("updates", QA1)).length, (await items("assignments", QA1)).length]).toEqual(before);
  });

  it("R-04 student cannot edit or delete an update or assignment", async () => {
    expect((await patch(`/api/updates/${U1}`, T.student, { note: "hacked" })).status).toBe(403);
    expect((await del(`/api/updates/${U1}`, T.student)).status).toBe(403);
    expect((await patch(`/api/assignments/${A1}`, T.student, { title: "hacked" })).status).toBe(403);
    expect((await del(`/api/assignments/${A1}`, T.student)).status).toBe(403);
    expect((await itemById("updates", QA1, U1)).note).toBe("qa");
    expect((await itemById("assignments", QA1, A1)).title).toBe("QA assignment");
  });

  it("R-05 student cannot add themself to editors", async () => {
    expect((await patch(`/api/classes/${QA1}`, T.student, { editors: ["rep-demo", "student-demo"] })).status).toBe(403);
    expect((await classOf(QA1)).editors).toEqual(["rep-demo"]);
  });

  it("R-06 student cannot create or delete a class", async () => {
    expect((await post("/api/classes", T.student, cls(`qa-x-${RUN}`, ["student-demo"]))).status).toBe(403);
    expect(await classOf(`qa-x-${RUN}`)).toBeUndefined();
    expect((await del(`/api/classes/${QA1}`, T.student)).status).toBe(403);
  });

  it("R-07 unknown API route → 404", async () => {
    expect((await get("/api/misc", T.student)).status).toBe(404);
    expect((await post("/api/misc", T.student, { a: 1 })).status).toBe(404);
  });
});

describe("2. class editor (rep-demo edits QA1 only)", () => {
  it("R-08 creates an update and assignment for own class → 201, createdBy = token uid", async () => {
    const u = await post("/api/updates", T.rep, upd(QA1, { kind: "room_change", newRoom: "R9" }));
    const a = await post("/api/assignments", T.rep, asg(QA1));
    expect([u.status, a.status]).toEqual([201, 201]);
    expect([u.body.createdBy, a.body.createdBy]).toEqual(["rep-demo", "rep-demo"]);
  });

  it("R-09 cannot create for another class → 403", async () => {
    for (const c of [QA2, SEEDED_OTHER]) {
      expect((await post("/api/updates", T.rep, upd(c))).status).toBe(403);
      expect((await post("/api/assignments", T.rep, asg(c))).status).toBe(403);
    }
    expect(await items("updates", QA2)).toEqual([]);
  });

  it("R-10 class that does not exist → 404", async () => {
    expect((await post("/api/updates", T.rep, upd(`nope-${RUN}`))).status).toBe(404);
    expect((await post("/api/assignments", T.admin, asg(`nope-${RUN}`))).status).toBe(404);
  });

  it("R-11 cannot post as someone else (createdBy in body)", async () => {
    expect((await post("/api/updates", T.rep, upd(QA1, { createdBy: "qa-rep-b" }))).status).toBe(400);
    expect((await items("updates", QA1)).every((u) => u.createdBy === "rep-demo")).toBe(true);
  });

  it("R-12 edits own class's slots → 200", async () => {
    const slots = [{ day: 2, start: "10:00", end: "11:40", room: "R3" }];
    const r = await patch(`/api/classes/${QA1}`, T.rep, { slots });
    expect(r.status).toBe(200);
    expect((await classOf(QA1)).slots).toEqual(slots);
  });

  it("R-13 cannot change editors → 403", async () => {
    expect((await patch(`/api/classes/${QA1}`, T.rep, { editors: ["rep-demo", "friend"] })).status).toBe(403);
    expect((await patch(`/api/classes/${QA1}`, T.rep, { editors: [] })).status).toBe(403);
    expect((await classOf(QA1)).editors).toEqual(["rep-demo"]);
  });

  it("R-14 cannot edit another class → 403", async () => {
    expect((await patch(`/api/classes/${QA2}`, T.rep, { lecturer: "Me" })).status).toBe(403);
    expect((await patch(`/api/classes/${SEEDED_OTHER}`, T.rep, { lecturer: "Me" })).status).toBe(403);
  });

  it("R-15 edits an update's note → 200", async () => {
    const r = await patch(`/api/updates/${U1}`, T.rep, { note: "moved again" });
    expect(r.status).toBe(200);
    expect(r.body.note).toBe("moved again");
  });

  it("R-16 cannot change classId or createdBy → 400, row unchanged", async () => {
    for (const kind of ["updates", "assignments"] as const) {
      const id = kind === "updates" ? U1 : A1;
      expect((await patch(`/api/${kind}/${id}`, T.rep, { classId: QA2 })).status).toBe(400);
      expect((await patch(`/api/${kind}/${id}`, T.rep, { createdBy: "someone" })).status).toBe(400);
      const row = await itemById(kind, QA1, id);
      expect([row.classId, row.createdBy]).toEqual([QA1, "rep-demo"]);
    }
  });

  it("R-17 cannot delete a class → 403", async () => {
    expect((await del(`/api/classes/${QA1}`, T.rep)).status).toBe(403);
    expect(await classOf(QA1)).toBeDefined();
  });
});

describe("2. users", () => {
  it("R-18 reads and updates own profile", async () => {
    const w = await put("/api/me", T.qa, { name: "QA Student", lang: "id", classIds: [QA1] });
    expect(w.status).toBe(200);
    const r = await get("/api/me", T.qa);
    expect(r.status).toBe(200);
    expect(r.body).toMatchObject({ name: "QA Student", lang: "id", classIds: [QA1] });
  });

  it("R-19 cannot read or write another user's profile", async () => {
    for (const p of ["/api/users/rep-demo", "/api/me/rep-demo", "/api/me?uid=rep-demo"]) {
      const r = await get(p, T.qa);
      expect(r.text).not.toContain("Demo Class Rep");
    }
    expect((await get("/api/users/rep-demo", T.qa)).status).toBe(404);
    expect((await put("/api/me", T.qa, { uid: "rep-demo", name: "x" })).status).toBe(400);
  });
});

describe("2. admin", () => {
  it("R-20 admin creates a class, changes editors, deletes it", async () => {
    const id = `qa-adm-${RUN}`;
    expect((await post("/api/classes", T.admin, cls(id, []))).status).toBe(201);
    expect((await patch(`/api/classes/${id}`, T.admin, { editors: ["rep-demo"] })).status).toBe(200);
    expect((await classOf(id)).editors).toEqual(["rep-demo"]);
    expect((await post("/api/updates", T.admin, upd(id))).status).toBe(201); // admin posts for any class
    expect((await del(`/api/classes/${id}`, T.admin)).status).toBe(204);
    expect((await del(`/api/classes/${id}`, T.admin)).status).toBe(404);
  });

  it("R-21 a non-admin role claim does not grant admin", async () => {
    expect((await post("/api/classes", T.classrep, cls(`qa-cr-${RUN}`, []))).status).toBe(403);
    expect((await patch(`/api/classes/${QA1}`, T.classrep, { lecturer: "x" })).status).toBe(403);
  });
});

// ---- 3. New API cases ------------------------------------------------------------------------
describe("3. server decides identity", () => {
  it("N-01 createdBy in a create body is not accepted", async () => {
    for (const kind of ["updates", "assignments"] as const) {
      const b = kind === "updates" ? upd(QA1, { createdBy: "qa-rep-b" }) : asg(QA1, { createdBy: "qa-rep-b" });
      const r = await post(`/api/${kind}`, T.rep, b);
      expect(r.status).toBe(400);
    }
  });

  it("N-02 createdBy in an edit body is not accepted", async () => {
    expect((await patch(`/api/updates/${U1}`, T.rep, { createdBy: "qa-rep-b", note: "x" })).status).toBe(400);
    expect((await itemById("updates", QA1, U1)).createdBy).toBe("rep-demo");
  });

  it("N-03 profile body cannot grant rights", async () => {
    for (const b of [{ role: "admin" }, { editors: [QA1] }, { uid: "admin-demo" }, { admin: true }])
      expect((await put("/api/me", T.qa, b)).status).toBe(400);
    expect((await post("/api/classes", T.qa, cls(`qa-n3-${RUN}`, []))).status).toBe(403);
  });

  it("N-04 editor of another class cannot edit or delete by id (IDOR)", async () => {
    expect((await patch(`/api/updates/${U1}`, T.repB, { note: "idor" })).status).toBe(403);
    expect((await del(`/api/updates/${U1}`, T.repB)).status).toBe(403);
    expect((await patch(`/api/assignments/${A1}`, T.repB, { title: "idor" })).status).toBe(403);
    expect((await del(`/api/assignments/${A1}`, T.repB)).status).toBe(403);
    expect(await itemById("updates", QA1, U1)).toBeDefined();
  });

  it("N-05 cannot move an item to another class", async () => {
    expect((await patch(`/api/updates/${U1}`, T.repB, { classId: QA2 })).status).toBeGreaterThanOrEqual(400);
    expect((await itemById("updates", QA1, U1)).classId).toBe(QA1);
  });

  it("N-06 removed editor loses rights at once, same token", async () => {
    expect((await patch(`/api/classes/${QA1}`, T.admin, { editors: [] })).status).toBe(200);
    try {
      expect((await post("/api/updates", T.rep, upd(QA1))).status).toBe(403);
      expect((await patch(`/api/updates/${U1}`, T.rep, { note: "after removal" })).status).toBe(403);
    } finally {
      await patch(`/api/classes/${QA1}`, T.admin, { editors: ["rep-demo"] });
    }
  });

  it("missing item → 404; own item delete → 204", async () => {
    expect((await del(`/api/updates/nope-${RUN}`, T.rep)).status).toBe(404);
    expect((await patch(`/api/assignments/nope-${RUN}`, T.rep, { title: "x" })).status).toBe(404);
    const u = await post("/api/updates", T.rep, upd(QA1));
    expect((await del(`/api/updates/${u.body.id}`, T.rep)).status).toBe(204);
    expect(await itemById("updates", QA1, u.body.id)).toBeUndefined();
  });

  it("createdByName/createdByRole in lists: poster's display name and role only, no other profile fields", async () => {
    await put("/api/me", T.rep, {}); // rep-demo's seeded profile has a name; this is a no-op merge
    for (const kind of ["updates", "assignments"] as const) {
      const rows = await items(kind, QA1);
      const mine = rows.find((r) => r.id === (kind === "updates" ? U1 : A1))!;
      expect(mine.createdByName).toBe("Demo Class Rep");
      expect(mine.createdByRole).toBe("classrep"); // rep-demo
      for (const r of rows) {
        // L-5: createdByRole is the one allowed role field; every other profile field stays out.
        expect(Object.keys(r).filter((k) => k !== "createdByRole" && /fcm|token|lang|classIds|email|uid|role/i.test(k))).toEqual([]);
        expect(["student", "classrep", "labassistant", "lecturer", "admin"]).toContain(r.createdByRole);
      }
    }
  });

  it("GET /api/classes: studentCount is a bare number, no student identities", async () => {
    const before = (await classOf(QA2)).studentCount;
    await put("/api/me", T.qa, { classIds: [QA1, QA2] });
    const c = await classOf(QA2);
    expect(c.studentCount).toBe((before as number) + 1);
    const allowed = ["id", "courseCode", "courseName", "section", "type", "lecturer", "slots", "editors", "studentCount"];
    for (const row of (await get("/api/classes", T.student)).body) expect(Object.keys(row).filter((k) => !allowed.includes(k))).toEqual([]);
    expect((await get("/api/classes", T.student)).text).not.toContain("qa-student");
    await put("/api/me", T.qa, { classIds: [QA1] });
  });

  it("FCM token posted twice is stored once (own profile only)", async () => {
    const tok = `qa-fcm-${RUN}`;
    expect((await post("/api/me/fcm-tokens", T.qa, { token: tok })).status).toBe(204);
    expect((await post("/api/me/fcm-tokens", T.qa, { token: tok })).status).toBe(204);
    expect((await get("/api/me", T.qa)).body.fcmTokens?.filter((t) => t === tok)).toHaveLength(1);
    expect((await post("/api/me/fcm-tokens", T.qa, { token: tok, uid: "rep-demo" })).status).toBe(400);
  });
});

describe("3. input validation", () => {
  it("V-01 unknown fields → 400", async () => {
    expect((await post("/api/updates", T.rep, upd(QA1, { isAdmin: true }))).status).toBe(400);
    expect((await post("/api/assignments", T.rep, asg(QA1, { id: "chosen-id" }))).status).toBe(400);
    expect((await patch(`/api/classes/${QA1}`, T.rep, { id: "renamed" })).status).toBe(400);
  });

  it.each([
    ["updates", { kind: 5 }], ["updates", { date: true }], ["updates", { note: 7 }],
    ["assignments", { links: "x" }], ["assignments", { dueAt: "tomorrow" }], ["assignments", { title: ["a"] }],
  ] as const)("V-02 wrong type on %s %j → 400", async (kind, bad) => {
    const b = kind === "updates" ? upd(QA1, bad) : asg(QA1, bad);
    expect((await post(`/api/${kind}`, T.rep, b)).status).toBe(400);
  });

  it("V-02 wrong type in profile → 400", async () => {
    expect((await put("/api/me", T.qa, { classIds: QA1 })).status).toBe(400);
    expect((await put("/api/me", T.qa, { lang: "fr" })).status).toBe(400);
  });

  it("V-03 unknown kind → 400", async () => {
    expect((await post("/api/updates", T.rep, upd(QA1, { kind: "holiday" }))).status).toBe(400);
  });

  it("V-04 room_change needs newRoom; reschedule is gone (v3, migration 002)", async () => {
    expect((await post("/api/updates", T.rep, upd(QA1, { kind: "room_change" }))).status).toBe(400);
    expect((await post("/api/updates", T.rep, upd(QA1, { kind: "room_change", newRoom: " " }))).status).toBe(400);
    expect((await post("/api/updates", T.rep, upd(QA1, { kind: "room_change", newRoom: "R-305" }))).status).toBe(201);
    expect((await post("/api/updates", T.rep, upd(QA1, { kind: "absent" }))).status).toBe(201);
    expect((await post("/api/updates", T.rep, upd(QA1, { kind: "reschedule" }))).status).toBe(400);
    expect((await post("/api/updates", T.rep, upd(QA1, { kind: "reschedule", newTime: "10:00" }))).status).toBe(400);
    expect((await post("/api/updates", T.rep, upd(QA1, { kind: "absent", newTime: "10:00" }))).status).toBe(400); // field removed
    expect((await patch(`/api/updates/${U1}`, T.rep, { kind: "reschedule" })).status).toBe(400);
  });

  it("V-05 bad date and slot day → 400", async () => {
    for (const b of [{ date: "25-11-2026" }, { date: "2026-13-45" }, { date: "2026-1-5" }])
      expect((await post("/api/updates", T.rep, upd(QA1, b))).status).toBe(400);
    expect((await patch(`/api/classes/${QA1}`, T.rep, { slots: [{ day: 7, start: "08:00", end: "09:00", room: "R" }] })).status).toBe(400);
  });

  it("V-05 impossible calendar date (30 Feb) → 400 (QA-07)", async () => {
    expect((await post("/api/updates", T.rep, upd(QA1, { date: "2026-02-30" }))).status).toBe(400);
  });

  it("V-06 over-long note (> 200) → 400", async () => {
    expect((await post("/api/updates", T.rep, upd(QA1, { note: "x".repeat(201) }))).status).toBe(400);
  });

  it("V-06 assignment limits (screens.md: title 100, instructions 2000, links 5): at limit 201, over 400", async () => {
    const links = (n: number) => Array.from({ length: n }, (_, i) => `https://example.com/${i}`);
    expect((await post("/api/assignments", T.rep, asg(QA1, { title: "x".repeat(100), instructions: "x".repeat(2000), links: links(5) }))).status).toBe(201);
    expect((await post("/api/assignments", T.rep, asg(QA1, { title: "x".repeat(101) }))).status).toBe(400);
    expect((await post("/api/assignments", T.rep, asg(QA1, { instructions: "x".repeat(2001) }))).status).toBe(400);
    expect((await post("/api/assignments", T.rep, asg(QA1, { links: links(6) }))).status).toBe(400);
    expect((await patch(`/api/assignments/${A1}`, T.rep, { title: "x".repeat(101) })).status).toBe(400);
  });

  it("V-07 non-http(s) link → 400", async () => {
    for (const l of ["javascript:alert(1)", "data:text/html,x", "ftp://x.y", "https://ok.com javascript:x"])
      expect((await post("/api/assignments", T.rep, asg(QA1, { links: [l] }))).status).toBe(400);
  });

  it("V-08 malformed JSON, empty body, wrong content type → 400", async () => {
    expect((await call("POST", "/api/updates", T.rep, undefined, "{bad json")).status).toBe(400);
    expect((await call("POST", "/api/updates", T.rep, undefined, "")).status).toBe(400);
    expect((await call("PUT", "/api/me", T.qa, undefined, "null")).status).toBe(400);
    const r = await fetch(API + "/api/updates", {
      method: "POST", headers: { authorization: `Bearer ${T.rep}`, "content-type": "text/plain" }, body: "kind=absent",
    });
    expect(r.status).toBe(400);
  });

  it("V-09 1 MB body → 400/413, no crash", async () => {
    const r = await post("/api/updates", T.rep, upd(QA1, { note: "x".repeat(1_100_000) }));
    expect([400, 413]).toContain(r.status);
    expect((await get("/api/classes", T.student)).status).toBe(200);
  });
});

describe("3. SQL injection", () => {
  const PAYLOADS = ["'; DROP TABLE updates; --", "' OR '1'='1", "\\' $1 % _ ", "<script>alert(1)</script>"];

  it.each(PAYLOADS)("S-01/02/04/05 %j is stored verbatim in every text field", async (p) => {
    const u = await post("/api/updates", T.rep, upd(QA1, { kind: "room_change", newRoom: p.slice(0, 100), note: p }));
    expect(u.status).toBe(201);
    expect(await itemById("updates", QA1, u.body.id)).toMatchObject({ note: p.trim(), newRoom: p.slice(0, 100).trim() });
    const a = await post("/api/assignments", T.rep, asg(QA1, { title: p, instructions: p }));
    expect(a.status).toBe(201);
    expect(await itemById("assignments", QA1, a.body.id)).toMatchObject({ title: p.trim(), instructions: p.trim() });
    expect((await patch(`/api/classes/${QA1}`, T.rep, { lecturer: p, slots: [{ day: 1, start: "08:00", end: "09:00", room: p }] })).status).toBe(200);
    expect((await classOf(QA1)).lecturer).toBe(p.trim());
    expect((await put("/api/me", T.qa, { name: p })).body.name).toBe(p.trim());
    // tables still there, and a list is still scoped to its class
    expect((await get("/api/updates?classIds=stik1005-14-lecture", T.student)).status).toBe(200);
    expect((await items("updates", QA2)).length).toBe(0);
  });

  it("S-03 injection in ids and filters is rejected, never widens results", async () => {
    for (const q of ["x')%20or%201=1--", "x%27%20OR%20%271%27%3D%271", "stik1005-14-lecture,'%20or%20true--"]) {
      expect((await get(`/api/updates?classIds=${q}`, T.student)).status).toBe(400);
      expect((await get(`/api/assignments?classIds=${q}`, T.student)).status).toBe(400);
    }
    expect([400, 403, 404]).toContain((await patch(`/api/updates/x'%20or%20'1'='1`, T.rep, { note: "x" })).status);
    expect([400, 404]).toContain((await del(`/api/classes/x'%20or%20'1'='1`, T.admin)).status);
    expect((await post("/api/updates", T.rep, upd("x' or '1'='1"))).status).toBe(400);
    expect(await classOf("stik1005-14-lecture")).toBeDefined();
  });
});

describe("3. cron notify route", () => {
  const cron = (auth?: string, method = "POST") =>
    fetch(API + "/api/cron/notify", { method, headers: auth === undefined ? {} : { authorization: auth } });

  it("C-01 no Authorization → 401", async () => { expect((await cron()).status).toBe(401); });
  it("C-02 wrong secret → 401", async () => {
    for (const a of ["Bearer wrong-secret", "Bearer ", "wrong", `Bearer ${"x".repeat(64)}`]) expect((await cron(a)).status).toBe(401);
  });
  it("C-03 server without CRON_SECRET fails closed (also `Bearer undefined`)", async () => {
    // Holds for any server; on the dev server CRON_SECRET is unset, which is the case this targets.
    for (const a of ["Bearer undefined", "Bearer null", "Bearer"]) expect((await cron(a)).status).toBe(401);
  });
  it("C-04 a user ID token instead of the secret → 401", async () => {
    expect((await cron(`Bearer ${T.admin}`)).status).toBe(401);
  });
  it("C-05 GET → 405", async () => { expect((await cron(undefined, "GET")).status).toBe(405); });
  it.skipIf(!process.env.CRON_SECRET)("C-06 correct secret twice: second run sends nothing new", async () => {
    const one = await cron(`Bearer ${process.env.CRON_SECRET}`);
    const two = await cron(`Bearer ${process.env.CRON_SECRET}`);
    expect([one.status, two.status]).toEqual([200, 200]);
    const b = await two.json();
    expect(JSON.stringify(b)).not.toMatch(/"sent":[1-9]/);
  });
});
