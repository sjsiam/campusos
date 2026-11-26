# API authorization test plan (Neon Postgres + Next.js route handlers)

Owner: QA. Replaces `tests/firestore.rules.test.ts` once the API ships (Siam, 2026-11-25:
data in Neon Postgres; Firebase only for Google sign-in and FCM).
Every case below becomes an automated test in `tests/` when the Developer reports the API ready.

## Setup the tests assume (Developer to confirm)

- **Tokens:** Firebase Auth emulator issues ID tokens for test users; the API verifies them with
  firebase-admin (`verifyIdToken`). Custom claim `role: "admin"` set via the emulator.
- **Database:** a throwaway Postgres (Neon branch or local), given as `DATABASE_URL` for the test
  run. **Tests truncate tables, so this must never point at the demo or production database.**
- **Fixtures** (same as the old rules tests): class `A` with `editors = [repA]`, class `B` with
  `editors = [repB]`, update `u1` and assignment `a1` on class A created by repA, profile for
  `student1`. Users: `student1` (no rights), `repA`, `repB`, `admin1` (claim `role: admin`).
- **Route names** below are placeholders (`/api/classes`, `/api/classes/:id`, `/api/updates`,
  `/api/updates/:id`, `/api/assignments`, `/api/assignments/:id`, `/api/me`, `/api/users/:uid`).
  Map them to the real routes when the Developer reports them.
- "Denied" means **403** for a valid token without rights, **401** for no/bad token, **404** for
  a missing resource. A denied write must leave the database unchanged (each write test re-reads
  the row afterwards).

## 1. Authentication (every route except `/api/cron/notify` and public pages)

| ID | Case | Expected |
|---|---|---|
| AU-01 | No `Authorization` header, each route and method | 401, no data in body |
| AU-02 | `Authorization: Bearer garbage` | 401 |
| AU-03 | Expired ID token | 401 |
| AU-04 | Token with a tampered payload (uid changed, signature kept) | 401 |
| AU-05 | Valid token from another Firebase project (wrong `aud`) | 401 |
| AU-06 | Production config rejects unsigned emulator tokens (`alg: none`): run with `FIREBASE_AUTH_EMULATOR_HOST` unset | 401 |
| AU-07 | Token in a query string or cookie only, no header (unless the Developer documents cookie auth) | 401 |
| AU-08 | 401/403/500 bodies contain no stack trace, SQL, or table names | pass |

AU-06 matters: if the emulator env var leaks into Vercel, firebase-admin accepts forged tokens.

## 2. Carried over from `tests/firestore.rules.test.ts`

### Signed-out user
| ID | Case | Expected |
|---|---|---|
| R-01 | Read classes, assignments, updates, users without a token | 401 (all) |

### Student (no editor rights)
| ID | Case | Expected |
|---|---|---|
| R-02 | Read classes, assignments, updates | 200 |
| R-03 | Create an update or an assignment for class A | 403, nothing inserted |
| R-04 | Edit or delete update `u1` | 403, row unchanged |
| R-05 | Add themself to `A.editors` | 403 |
| R-06 | Create a class | 403 |
| R-07 | Unknown route / unlisted resource | 404, no data |

### Class editor (repA, editor of A only)
| ID | Case | Expected |
|---|---|---|
| R-08 | Create an update and an assignment for class A | 201 |
| R-09 | Create an update or assignment for class B | 403, nothing inserted |
| R-10 | Create for a class id that does not exist | 404 or 400, nothing inserted |
| R-11 | Post as someone else (see also N-02) | stored `createdBy` = repA |
| R-12 | Edit class A's slots | 200 |
| R-13 | Change `A.editors` (add a friend, or empty it) | 403, editors unchanged |
| R-14 | Edit class B | 403 |
| R-15 | Edit `u1` note | 200 |
| R-16 | Change `classId` or `createdBy` of `u1` or `a1` | rejected (400/403), row unchanged |
| R-17 | Delete a class | 403 |

### Users
| ID | Case | Expected |
|---|---|---|
| R-18 | Read and update own profile | 200 |
| R-19 | Read or write another user's profile (`/api/users/repA` as student1) | 403 or 404, no data leaked |

### Admin (claim `role: admin`)
| ID | Case | Expected |
|---|---|---|
| R-20 | Create a class; change `A.editors` | 201 / 200 |
| R-21 | Claim `role: classrep` (or any non-`admin` value) creating a class | 403 |

## 3. New cases for the API

### Server decides identity (N)
| ID | Case | Expected |
|---|---|---|
| N-01 | Body `{"createdBy": "repB"}` on create (update and assignment) | 201, stored `createdBy` = token uid (repA) |
| N-02 | Body `createdBy` on edit | ignored or 400; stored value unchanged |
| N-03 | Profile update body with `uid`, `role: "admin"` or `editors` | ignored or 400; user gains no rights (re-check R-06 as that user) |
| N-04 | repB edits or deletes `u1` (class A) by id | 403 (IDOR check: rights come from the row's class, not the request) |
| N-05 | repA moves `u1` to class B via `classId` in the body | rejected, row unchanged |
| N-06 | repA removed from `A.editors` by admin, then posts for A with the same still-valid token | 403 (rights read from the database each request, not cached in the token) |

### Input validation (V)
| ID | Case | Expected |
|---|---|---|
| V-01 | Extra unknown field (`{"isAdmin": true}`, `{"id": "x"}`) | 400, or field dropped; never stored |
| V-02 | Wrong types: `kind: 5`, `date: true`, `links: "x"`, `dueAt: "tomorrow"`, `classIds: "A"` | 400 |
| V-03 | `kind` not in `absent / room_change / reschedule` | 400 |
| V-04 | `room_change` without `newRoom`; `reschedule` without `newTime` | 400 |
| V-05 | `date` not `YYYY-MM-DD`; `newTime` not `HH:MM`; slot `day` outside 0-6 | 400 |
| V-06 | Over-long text (note > 200, title > 100, instructions > 2000, > 5 links) | 400 |
| V-07 | Link not `http(s)://` (`javascript:alert(1)`) | 400 |
| V-08 | Malformed JSON, empty body, wrong `Content-Type` | 400, no 500 |
| V-09 | Very large body (≥ 1 MB) | 413 or 400, no crash |

### SQL injection (S): stored and returned as plain text
For each text field (`note`, `newRoom`, assignment `title`, `instructions`, profile `name`,
class `room`), and for id path params and query params (`?classIds=`):

| ID | Payload | Expected |
|---|---|---|
| S-01 | `'; DROP TABLE updates; --` | stored verbatim; table still exists |
| S-02 | `' OR '1'='1` | stored verbatim; list endpoints return only the rows they should |
| S-03 | `A' OR '1'='1` as a class id in the path or `classIds` filter | 404/400 or empty, never other classes' rows |
| S-04 | `\'` and `$1` and `%` and `_` (escaping and LIKE wildcards in search) | stored verbatim; search for `%` matches only literal `%` |
| S-05 | `<script>alert(1)</script>` | stored verbatim; UI renders it as text (manual check) |

### Cron notify route (C)
| ID | Case | Expected |
|---|---|---|
| C-01 | No `Authorization` header | 401, no FCM sent, nothing marked sent |
| C-02 | `Bearer wrong-secret`, and a secret one character off | 401 |
| C-03 | `CRON_SECRET` unset on the server, header `Bearer ` (empty) | 401 (fails closed) |
| C-04 | A valid Firebase ID token instead of the secret | 401 |
| C-05 | GET instead of POST | 405 |
| C-06 | Correct secret, called twice in a row | 200 both; second run sends nothing new |

## 4. Open questions for the Developer / Lead
1. **Who may read what:** the old rules let any signed-in user read every class, assignment and
   update. Keep that, or limit to the user's `classIds`? Tests R-02 follow the old rule until told otherwise.
2. Error codes: confirm 403 vs 404 for "exists but not yours" (R-19, N-04).
3. Unknown fields: reject with 400 or silently drop (V-01)? Either passes; pick one so tests are exact.
4. Test database: which `DATABASE_URL` the tests may truncate (Neon test branch or local Postgres).
