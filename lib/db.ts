// Postgres client for server code and scripts (Neon in production, PGlite or any Postgres locally).
// Never import from client components: DATABASE_URL is a server-only secret.
import postgres from "postgres";

// One pool per process; dev hot reload re-runs this module, so keep it on globalThis.
const g = globalThis as { __campusSql?: postgres.Sql };

const url = process.env.DATABASE_URL ?? "";
// Local PGlite (`npm run db`) runs every connection on one backend, so parallel queries from one pool can
// interleave and fail. One connection per process locally; Neon gets a real pool.
// shortcut: two processes (e.g. seed while the server runs) can still collide on PGlite; rerun if that happens.
/** Local PGlite or a Postgres on this machine (the demo seed only runs against these). */
export const isLocalDb = (u: string) => /@(127\.0\.0\.1|localhost)[:/]/.test(u);
/** Neon (production). Scripts that write production data require this plus an explicit --prod flag. */
export const isNeonDb = (u: string) => /^postgres(ql)?:\/\/[^/]*\.neon\.tech[:/]/.test(u);
const local = isLocalDb(url);

export const sql = (g.__campusSql ??= postgres(url, {
  max: local ? 1 : 5,
  prepare: false, // Neon's pooled URL (PgBouncer, transaction mode) can't keep prepared statements
  transform: postgres.camel, // course_code <-> courseCode
}));
