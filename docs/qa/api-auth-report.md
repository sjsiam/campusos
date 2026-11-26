# QA report: API authorization (CO-43, tests for CO-42)

Date: 2026-11-25. Tests: `tests/api.auth.test.ts` (case IDs = `docs/qa/api-auth-test-plan.md`).
`tests/firestore.rules.test.ts` removed (`firestore.rules` is gone).

**Result: `npm test` green: 87 passed, 1 expected fail (QA-06), 1 skipped (C-06).**
78 tests are in `api.auth.test.ts` (2 of them spawn a production-config subprocess); the rest are `lib/` unit tests.
No authorization hole found. One validation mismatch with the design spec (QA-06, low).

## How to run

`npm test` needs these already running (the tests start nothing):
1. Auth emulator on `127.0.0.1:9099` (`npm run emulators`)
2. PGlite Postgres on `127.0.0.1:54329`, migrated (`npm run db`, `npm run db:migrate`, `npm run seed`)
3. `next dev` on `127.0.0.1:3000` with `NEXT_PUBLIC_USE_EMULATORS=true`

Overrides: `API_URL`, `FIREBASE_AUTH_EMULATOR_HOST`. Set `CRON_SECRET` (same value as the server)
to also run C-06. If the API is down, the suite stops with a message saying what to start.

Data safety: seeded demo data is not modified. Each run creates two classes `qa1-<run>` and
`qa2-<run>`, writes only to them, and deletes them at the end (cascades to their items). Left behind
by design: profile row `qa-student` (no delete route) and emulator users `qa-student`, `qa-rep-b`,
`qa-claim`. A run that crashes mid-way can leave `qa1-*`/`qa2-*` classes; delete them as admin.

## Findings

### QA-06 (Low) Assignment length limits differ from the design spec
Spec (`docs/design/screens.md` §9): title max 100, instructions max 2000, max 5 links.
API (`lib/validate.ts`): title 200, instructions 5000, links 10. The note limit (200) matches.

```
POST /api/assignments   Authorization: Bearer <rep-demo>
{"classId":"qa1-…","title":"xxxx…(101 chars)","dueAt":"2026-11-26T…Z"}
→ 201 Created   (expected 400)
```
Same for `instructions` of 2001 chars and 6 links. Either tighten the schema or have the
Designer change the spec; the test is `it.fails` and must be flipped to `it` when settled.

### Note (by design, keep in mind): emulator mode trusts any token
With `NEXT_PUBLIC_USE_EMULATORS=true` the server accepts unsigned tokens, so a hand-edited token
(`sub: admin-demo`, `role: admin`) created a class (201, checked manually, then deleted). That is
how the emulator works. Production is protected by two checks, both tested (AU-04/AU-06):
firebase-admin without the emulator rejects these tokens (`no "kid" claim`), and `lib/admin.ts`
throws on Vercel when the emulator flag is set. **Never set `NEXT_PUBLIC_USE_EMULATORS` or
`FIREBASE_AUTH_EMULATOR_HOST` in Vercel.** Add that to the CO-31 deploy checklist.

## Results per case

| ID | Case | Result |
|---|---|---|
| AU-01 | No token on all 15 protected route+method pairs → 401 | PASS |
| AU-02 | Garbage token → 401 | PASS |
| AU-03 | Expired token → 401 | PASS |
| AU-04 | Tampered token rejected (production config, subprocess) | PASS. In emulator mode it is accepted, see note |
| AU-05 | Wrong `aud`/`iss` → 401 | PASS |
| AU-06 | Unsigned token rejected without emulator; `lib/admin.ts` throws on Vercel + emulator flag | PASS |
| AU-07 | Token only in query string / cookie → 401 | PASS |
| AU-08 | Error bodies leak no SQL, table names or stack | PASS |
| R-01 | Signed-out reads → 401 | PASS |
| R-02 | Student reads classes, assignments, updates → 200 | PASS |
| R-03 | Student creates update/assignment → 403, nothing inserted | PASS |
| R-04 | Student edits/deletes update/assignment → 403, unchanged | PASS |
| R-05 | Student adds self to editors → 403 | PASS |
| R-06 | Student creates/deletes class → 403 | PASS |
| R-07 | Unknown route → 404 | PASS |
| R-08 | Rep creates for own class → 201, `createdBy` = rep-demo | PASS |
| R-09 | Rep creates for another class (test class and seeded `strukdat-a`) → 403 | PASS |
| R-10 | Unknown class → 404 | PASS |
| R-11 | `createdBy` in body → 400 | PASS |
| R-12 | Rep edits own class slots → 200 | PASS |
| R-13 | Rep changes editors → 403, unchanged | PASS |
| R-14 | Rep edits another class → 403 | PASS |
| R-15 | Rep edits update note → 200 | PASS |
| R-16 | PATCH `classId` / `createdBy` → 400, row unchanged (updates and assignments) | PASS |
| R-17 | Rep deletes class → 403 | PASS |
| R-18 | Own profile read + update | PASS |
| R-19 | Other user's profile: no route (`/api/users/:uid` 404), `uid` in body → 400, no data leaked | PASS |
| R-20 | Admin creates class, sets editors, posts for any class, deletes (204, then 404) | PASS |
| R-21 | `role: classrep` claim is not admin → 403 | PASS |
| N-01 | `createdBy` in create body → 400 | PASS |
| N-02 | `createdBy` in edit body → 400, unchanged | PASS |
| N-03 | Profile body with `role`/`editors`/`uid`/`admin` → 400; user still can't create a class | PASS |
| N-04 | Editor of class B edits/deletes class A items by id → 403 | PASS |
| N-05 | Move item to another class → rejected, unchanged | PASS |
| N-06 | Editor removed by admin → 403 at once with the same token | PASS |
| – | Missing item → 404; own item delete → 204 | PASS |
| – | Same FCM token twice → stored once; extra field → 400 | PASS |
| V-01 | Unknown fields → 400 | PASS |
| V-02 | Wrong types (6 update/assignment cases, profile `classIds`, `lang:"fr"`) → 400 | PASS |
| V-03 | Unknown `kind` → 400 | PASS |
| V-04 | `room_change` without `newRoom`, `reschedule` without `newTime` → 400 | PASS |
| V-05 | Bad date / time / slot day → 400 | PASS |
| V-06 | Note > 200 → 400 | PASS |
| V-06 | Title > 100, instructions > 2000, > 5 links → 400 | **FAIL (QA-06)** |
| V-07 | `javascript:`, `data:`, `ftp:`, URL with space → 400 | PASS |
| V-08 | Malformed JSON, empty body, `null`, `text/plain` → 400 | PASS |
| V-09 | 1 MB body → 400, server still answers | PASS |
| S-01/02/04/05 | 4 payloads (`'; DROP TABLE…`, `' OR '1'='1`, `\' $1 % _`, `<script>`) stored verbatim in note, newRoom, title, instructions, lecturer, slot room, profile name; tables intact; lists still scoped | PASS (S-04 LIKE search: no search endpoint exists, nothing to test) |
| S-03 | Injection in `classIds` filter → 400; in path ids → 404; in body `classId` → 400 | PASS |
| C-01 | Notify without Authorization → 401 | PASS |
| C-02 | Wrong secret (4 variants) → 401 | PASS |
| C-03 | Server without `CRON_SECRET`: `Bearer undefined`/`null`/empty → 401 | PASS (dev server has no `CRON_SECRET`, so this is the real case) |
| C-04 | User ID token instead of secret → 401 | PASS |
| C-05 | GET → 405 | PASS |
| C-06 | Correct secret twice, second sends nothing new | SKIPPED: no `CRON_SECRET` on the dev server. Run with it set on both sides. |

Answers to the plan's open questions, as built: reads are open to any signed-in user (old rule
kept); "exists but not yours" is 403 and "missing" is 404; unknown fields are rejected with 400.
