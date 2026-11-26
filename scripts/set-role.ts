// CO-33: gives a signed-in user a role and, optionally, makes them an editor of some classes.
//   Local (Auth emulator + local Postgres from .env.local):
//     npm run set-role -- --email rep@demo.campusos --role classrep --classes stik1005-14-lecture
//   Production (real Firebase Auth + Neon from .env.vercel; both checked, plus the explicit flag):
//     npm run set-role -- --prod --email someone@gmail.com --role classrep --classes stik1005-14-lecture,stik1007-11-lab
// The user is looked up by email and must have signed in once (refused otherwise). Editors are only added,
// never removed. The new role reaches the app after the user signs out and in again (fresh ID token).
import { existsSync } from "node:fs";
import type { Role } from "../lib/types";

const ROLES: Role[] = ["student", "classrep", "labassistant", "lecturer", "admin"];
const argv = process.argv.slice(2);
const prod = argv.includes("--prod");
const arg = (name: string) => { const i = argv.indexOf(`--${name}`); return i >= 0 ? argv[i + 1] : undefined; };
const email = arg("email")?.trim().toLowerCase();
const role = arg("role") as Role | undefined;
const classIds = (arg("classes") ?? "").split(",").map((s) => s.trim()).filter(Boolean);

function fail(msg: string): never {
  console.error(msg);
  process.exit(1);
}
if (!email || !email.includes("@") || !role || !ROLES.includes(role) || classIds.some((id) => !/^[a-z0-9-]+$/.test(id)))
  fail(`Usage: npm run set-role -- [--prod] --email <email> --role <${ROLES.join("|")}> [--classes <id,id,…>]`);

// Load env before lib/db and lib/admin read it (values already in the shell win, so they are checked below too).
const envFile = prod ? ".env.vercel" : ".env.local";
if (existsSync(envFile)) process.loadEnvFile(envFile);

async function main() {
  const { isLocalDb, isNeonDb } = await import("../lib/db");
  const url = process.env.DATABASE_URL ?? "";
  if (prod) {
    if (!isNeonDb(url)) fail("Refusing: --prod needs a Neon (neon.tech) DATABASE_URL (.env.vercel).");
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) fail("Refusing: --prod needs FIREBASE_SERVICE_ACCOUNT (.env.vercel).");
    if (process.env.FIREBASE_AUTH_EMULATOR_HOST || process.env.NEXT_PUBLIC_USE_EMULATORS === "true")
      fail("Refusing: --prod with the Auth emulator configured. Unset FIREBASE_AUTH_EMULATOR_HOST / NEXT_PUBLIC_USE_EMULATORS.");
  } else {
    if (!isLocalDb(url)) fail("Refusing: without --prod, DATABASE_URL must be local (127.0.0.1 / localhost).");
    process.env.NEXT_PUBLIC_USE_EMULATORS = "true"; // lib/admin then talks to the Auth emulator only
  }
  const { sql } = await import("../lib/db");
  const { adminAuth } = await import("../lib/admin");

  try {
    const user = await adminAuth.getUserByEmail(email!).catch((e: { code?: string }) => {
      if (e.code === "auth/user-not-found") fail(`Refusing: no account for ${email}. They must sign in to CampusOS once first.`);
      throw e;
    });
    if (classIds.length) {
      const found = (await sql<{ id: string }[]>`select id from classes where id in ${sql(classIds)}`).map((r) => r.id);
      const missing = classIds.filter((id) => !found.includes(id));
      if (missing.length) fail(`Refusing: unknown class id(s): ${missing.join(", ")}. Nothing was changed.`);
    }
    await adminAuth.setCustomUserClaims(user.uid, { ...user.customClaims, role });
    if (classIds.length)
      await sql`update classes set editors = array_append(editors, ${user.uid}) where id in ${sql(classIds)} and not (${user.uid} = any(editors))`;
    console.log(`${prod ? "PRODUCTION" : "local"}: ${email} (${user.uid}) -> role ${role}${classIds.length ? `, editor of ${classIds.join(", ")}` : ""}.`);
    console.log("They need to sign out and in again to get the new role.");
  } finally {
    await sql.end();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
