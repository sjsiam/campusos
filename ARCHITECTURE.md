# CampusOS architecture

CampusOS is a mobile-first progressive web app (PWA) that brings the Computer Engineering (USK)
class schedule, assignments and verified class-change alerts into one place, in English and
Indonesian. Phones are the first target; tablet and desktop get a two-pane layout ✅ (CO-37).
This file describes the app **as built**. Keep it in sync when the architecture changes.

Status key: ✅ built · 🚧 in progress · 📋 planned

## 1. System overview

```mermaid
flowchart LR
  subgraph Phone["Student / class rep phone"]
    PWA["CampusOS PWA<br/>Next.js 16 client pages"]
    SW["Service worker<br/>(push) 📋"]
  end

  subgraph Vercel["Vercel (hosting) 📋"]
    Pages["Next.js app<br/>pages + manifest<br/>landing, /docs, /changelog 📋"]
    API["/api/* route handlers ✅<br/>verify ID token, check access"]
    Notify["POST /api/cron/notify ✅"]
  end

  subgraph Firebase["Firebase (Spark / free plan)"]
    Auth["Authentication<br/>Google sign-in"]
    FCM["Cloud Messaging<br/>(push)"]
  end

  DB[("Neon Postgres<br/>(DATABASE_URL)")]
  GH["GitHub Actions cron<br/>every 5 min ✅"]

  PWA -- "loads" --> Pages
  PWA -- "Firebase JS SDK" --> Auth
  PWA -- "fetch + Bearer ID token" --> API
  API -- "verifyIdToken" --> Auth
  API -- "SQL (postgres.js)" --> DB
  GH -- "Bearer CRON_SECRET" --> Notify
  Notify -- "SQL" --> DB
  Notify -- "firebase-admin" --> FCM
  FCM -- "push" --> SW
```

**Firebase is only for identity and push.** The browser signs in with Google through Firebase Auth
and gets a short-lived ID token. All data lives in Postgres and is reached **only** through the
app's own route handlers (`app/api/**`), which verify that token with firebase-admin and do every
access check. The browser never talks to the database.

**Neon Postgres replaced Firestore** (Siam, 2026-11-25; see `docs/team/TEAM.md` Decisions). Firebase
stays for sign-in and push; no Supabase; assignment files stay as links, so no file storage is
needed. Access checks that `firestore.rules` did are now server code in the route handlers.

**Why no Cloud Functions:** they require the paid Blaze plan. The scheduled job runs as a Next.js
route handler called by a GitHub Actions cron instead.

## 2. Tech stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 16 (App Router, Cache Components, TypeScript), Tailwind CSS v4, Geist font, date handling in WIB (Asia/Jakarta) |
| PWA | `app/manifest.ts` (Next.js metadata), service worker for push 📋 |
| Auth | Firebase Authentication, Google sign-in (popup; full-page redirect for iOS home-screen apps and when the popup is blocked) |
| API | Next.js route handlers, Firebase ID token check (`firebase-admin` `verifyIdToken`), request bodies validated with `zod` |
| Database | Postgres: Neon in production, PGlite (`npm run db`) locally. Client: `postgres` (postgres.js), plain SQL, migrations in `db/migrations/*.sql` |
| Push | Firebase Cloud Messaging, sent by `firebase-admin` from the notify route |
| Scheduler | GitHub Actions cron, every 5 min (`.github/workflows/notify.yml`) ✅ |
| Hosting | Vercel (frontend + route handlers) 📋 |
| Docs | `CHANGELOG.md` on GitHub, linked from the landing page when `NEXT_PUBLIC_REPO_URL` is set ✅ (no in-app `/docs` or `/changelog`) |
| i18n | Static JSON dictionaries `messages/en.json`, `messages/id.json` |
| Testing | Vitest (unit tests in `lib/`), API authorization tests against a local DB + Auth emulator (QA, `tests/`) |

## 3. Code map

```
app/
  page.tsx                             public landing page ✅
  login/, onboarding/, today/, updates/ screens ✅
  assignments/                         layout.tsx keeps the list beside the detail on ≥ 768px ✅
  api/
    me/route.ts                        GET/PUT own profile
    me/fcm-tokens/route.ts             POST add own push token
    classes/route.ts, classes/[id]/    GET all; POST, PATCH, DELETE (admin / editors)
    assignments/, assignments/[id]/    GET ?classIds=; POST, PATCH, DELETE (editors / admin)
    updates/, updates/[id]/            same as assignments
    cron/notify/route.ts               reminder + alert sender
  manifest.ts, layout.tsx              PWA manifest; root layout with the auth gate
components/                            Session (auth gate + routing rule), BottomNav (AppShell: bottom nav
                                       on phones, side rail ≥ 768px), Timetable, UpdateItem, AssignmentList, ui
lib/
  types.ts         shared data types (the frontend/backend contract)
  firebase.ts      client Firebase init (Auth only), emulator switch
  auth.ts          signInWithGoogle, signOut, redirectResult, useAuth() → { user, role, loading }
  data.ts          client data helpers: call /api/* with the user's ID token
  api.ts           server: caller() token check, requireEditor/requireAdmin, error mapping
  items.ts         server: shared assignment/update handlers
  validate.ts      server: zod schemas for every request body
  db.ts            server: postgres.js client (DATABASE_URL)
  admin.ts         server: firebase-admin (verify tokens, FCM)
  today.ts         Today timeline logic in WIB (past / now / next / upcoming)   + today.test.ts
  schedule.ts      which reminders/alerts are due now, and their EN/ID text   + schedule.test.ts
  i18n.tsx         useT() hook, language saved per device
  push.ts          client: notification permission + FCM token (CO-26)
public/sw.js       service worker: shows FCM pushes, opens the app on tap
db/migrations/     001_init.sql, 002_no_reschedule.sql (applied in name order by npm run db:migrate)
messages/          en.json, id.json
scripts/           migrate.ts, seed.ts (demo data), set-role.ts (custom claims),
                   token.ts (emulator ID token for curl), admin.ts (emulator admin init)
tests/             owned by QA
.github/workflows/ notify.yml (cron for the notify route)
firebase.json      Auth emulator only
```

## 4. Data model (Postgres, `db/migrations/`)

Columns are snake_case in SQL; the app sees camelCase (postgres.js `transform: postgres.camel`).

| Table | Columns | Written by (through the API) |
|---|---|---|
| `users` | **uid** (Firebase uid, PK), name, lang (`en`/`id`), class_ids text[], fcm_tokens text[] | the user themself |
| `classes` | **id**, course_code, course_name, section, type (`lecture`/`lab`/`advising`), lecturer, slots jsonb `[{day, start, end, room}]`, editors text[] (uids) | admin; editors may change everything but `editors` |
| `assignments` | **id** (uuid), class_id → classes (cascade), title, instructions, links text[], due_at timestamptz, created_by | class editors or admin |
| `updates` | **id** (uuid), class_id → classes (cascade), kind (`absent`/`room_change`; reschedule removed in v3), date (`YYYY-MM-DD`, campus date), new_room, note, created_by, created_at | class editors or admin |
| `notifications` | **id** (job id, the dedupe key), kind, class_id, claimed_at, sent, failed, removed, emulated | notify route only |
| `schema_migrations` | name, applied_at | `npm run db:migrate` |

Read-only extras in responses: `GET /api/classes` adds `studentCount` (users with the class in `class_ids`);
`GET /api/assignments` and `GET /api/updates` add `createdByName` (`users.name` of the poster).

Slots and editors stay inside the class row (jsonb / text[]): they are always read with the class
and small, so separate tables would only add joins.

Roles live in Firebase Auth **custom claims** (`student`, `classrep`, `labassistant`, `lecturer`,
`admin`), set with `npm run set-role -- <uid> <role>`. Only `admin` grants extra rights in the API.
Edit rights for a class come from its `editors` list, so a class rep can only post for their own
classes. Assignment documents are links (Drive, e-learning), not uploads.

## 5. Security

- **Authentication:** every `/api/*` data route needs `Authorization: Bearer <Firebase ID token>`;
  `lib/api.ts` `caller()` verifies it with firebase-admin (signature, expiry, project) and takes the
  uid and `role: admin` claim from it. Missing or invalid → 401.
- **Authorization** (same rules the old `firestore.rules` had, now in route handlers):
  - Profiles: `/api/me` only ever reads or writes the caller's own row; there is no route that
    takes another uid.
  - Any signed-in user can read classes, assignments and updates.
  - Only a class's editors or an admin can create, change or delete its assignments and updates
    (`requireEditor`, 403 otherwise, 404 for an unknown class). `createdBy` is always the token's
    uid; a body that contains `createdBy` is rejected. `classId` and `createdBy` can never change.
  - Editors can change their class but not its `editors`; only an admin can create or delete a
    class or change `editors`.
  - `notifications` and `schema_migrations` have no API at all.
- **Validation:** every body is parsed by a strict zod schema (`lib/validate.ts`): unknown keys,
  wrong types, bad dates/times, non-http(s) links and over-long text are a 400. IDs in the URL or
  query string are checked against `[A-Za-z0-9_-]`.
- **SQL:** postgres.js tagged templates only, so every value is a bound parameter. The single
  `unsafe()` call runs the repo's own migration files.
- **Notify route:** requires `Authorization: Bearer $CRON_SECRET` (constant-time compare) and refuses
  every request when the secret is not set.
- **Emulator mode** (`NEXT_PUBLIC_USE_EMULATORS=true`) makes the API accept unsigned emulator tokens;
  `lib/admin.ts` refuses to start in that mode on Vercel.
- **Secrets:** `DATABASE_URL`, `CRON_SECRET` and `FIREBASE_SERVICE_ACCOUNT` exist only as Vercel/GitHub
  secrets, never in the repo and never as `NEXT_PUBLIC_` variables. HTTPS everywhere (Vercel default).
- **Tests:** API authorization tests (QA) replace the old Firestore rules tests.

## 6. Main flows

**Sign in and onboarding**
1. Student signs in with Google → `useAuth()` gets the user and role.
2. First visit (no `classIds` yet) → Onboarding: pick language, pick classes, allow reminders (on
   iPhone: first add to Home Screen, since iOS only allows web push for installed apps, iOS 16.4+).
3. `saveProfile()` → `PUT /api/me`. "Turn on reminders" (onboarding step 3, the Today notice or the Account sheet)
   asks for permission in the tap handler; once granted, `lib/push.ts` registers `public/sw.js`, gets the FCM
   token and sends it with `POST /api/me/fcm-tokens` (no duplicates). It repeats silently on every start so a
   rotated token is saved. Without `NEXT_PUBLIC_FIREBASE_VAPID_KEY` the token step is skipped (local dev).

**Every data call**
```mermaid
sequenceDiagram
  participant UI as Screen
  participant D as lib/data.ts
  participant A as /api/* route
  participant F as Firebase Auth (admin)
  participant DB as Postgres
  UI->>D: listUpdates(classIds)
  D->>D: auth.currentUser.getIdToken()
  D->>A: GET /api/updates?classIds=… + Bearer token
  A->>F: verifyIdToken(token)
  A->>A: validate input, check editor/admin for writes
  A->>DB: parameterised SQL
  DB-->>A: rows
  A-->>D: JSON (dates as ISO strings)
  D-->>UI: objects with Date fields
```

**Daily timeline**
`lib/today.ts` builds today's list in WIB from the user's classes and the updates for those classes:
past, now, next and upcoming classes, with room-moved / cancelled marks and free-time gaps, plus
assignments due soon.

**Posting a change (class rep)** ✅
Rep taps "Report change" in the app bar (Today, Updates) → sheet: class, kind (cancelled / room moved), session →
`createUpdate()` → `POST /api/updates`, rejected unless the rep is in that class's `editors`.

**Public pages**
`/` is the signed-out landing page ✅ (signed-in visitors are sent to `/today`): headline, Google sign-in and a
real screenshot of Today (`public/today-screenshot.jpg`, retake after visible UI changes). "Release notes" links to
`CHANGELOG.md` on GitHub (hidden until `NEXT_PUBLIC_REPO_URL` is set); `/docs` and `/changelog` are cut. Icons (`public/icons/`, `app/icon.png`,
`app/apple-icon.png`) and fonts (`app/fonts/`) are in the repo, so nothing is fetched from Google at build time.

**Reminders and alerts**
```mermaid
sequenceDiagram
  participant GH as GitHub Actions (every 5 min)
  participant R as /api/cron/notify
  participant DB as Postgres
  participant F as FCM
  GH->>R: POST + Bearer CRON_SECRET
  R->>DB: classes, updates for today onward, assignments due in 25 h
  R->>R: dueJobs(): class in 30 min, deadline in 24 h / 1 h, new update
  loop each job
    R->>DB: INSERT notifications (id) ON CONFLICT DO NOTHING RETURNING id
    Note over R: skip the job if no row came back (already sent)
    R->>DB: students whose class_ids contain the class
    R->>F: send in each student's language (500 tokens per batch)
    R->>DB: record result, remove dead tokens
  end
```
The job id is the primary key, so a job is sent at most once, even if two runs overlap. GitHub cron
can start a few minutes late, so alerts may arrive about 5-15 minutes after an update is posted.

## 7. Local development

No Neon or Firebase account needed. Three terminals:

```bash
npm install
npm run emulators          # 1: Firebase Auth emulator (project demo-campusos), UI at :4000
npm run db                 # 2: local Postgres (PGlite) on 127.0.0.1:54329, data in .pglite/
npm run db:migrate         #    apply db/migrations (safe to repeat)
npm run seed               #    demo users (Auth) + classes, assignments, updates (Postgres)
npm run dev                # 3: open http://127.0.0.1:3000 (not localhost: sign-in redirect needs the same host)
```

`.env.local`:
```
NEXT_PUBLIC_USE_EMULATORS=true
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:54329/postgres
```
Any other Postgres works too (Docker, Postgres.app, a Neon dev branch): point `DATABASE_URL` at it.

Useful:
```bash
npm test                                   # unit tests (+ QA's API tests)
npm run -s token -- rep-demo               # print an emulator ID token for a uid
curl -H "Authorization: Bearer $(npm run -s token -- rep-demo)" http://127.0.0.1:3000/api/me
npm run set-role -- <uid> admin            # custom claim in the Auth emulator
```
Demo users: `student-demo` (student@), `rep-demo` (rep@, editor of `sisdig-a`), `admin-demo`
(admin@, `role: admin`). To start over, stop `npm run db`, delete `.pglite/`, and repeat migrate + seed.

## 8. Deployment 📋

1. Neon: create a project, copy the **pooled** connection string, run
   `DATABASE_URL=<it> npm run db:migrate` once from a laptop.
2. Firebase project (Spark plan): enable Google sign-in, add the Vercel domain to authorized
   domains, create a service account key for `FIREBASE_SERVICE_ACCOUNT`.
3. Vercel: set the `NEXT_PUBLIC_FIREBASE_*` variables (including `NEXT_PUBLIC_FIREBASE_VAPID_KEY` for push), `DATABASE_URL`, `CRON_SECRET`,
   `FIREBASE_SERVICE_ACCOUNT`. Do **not** set `NEXT_PUBLIC_USE_EMULATORS`.
4. GitHub: add the repository secrets `APP_URL` (the Vercel URL) and `CRON_SECRET` (same value as
   on Vercel). The `Notify` workflow fails while they are missing; run it once by hand
   (`workflow_dispatch`) to check.
5. Later schema changes: add `db/migrations/00N_*.sql`, run `npm run db:migrate` against Neon
   before deploying the code that needs it.

Deploys need Siam's go-ahead.

## 9. Known limits

- The first version covers Computer Engineering only; the timetable is entered by hand.
- No AI; simple time rules decide reminders.
- Language choice is per device, not per account, for the UI; push text uses the profile's `lang`.
- Crowd map and Wi-Fi status (1-hour reports) are stretch goals and not designed into the data model yet.
- `<html lang>` is `en` in the server HTML and switches to the saved language right after load.
- Every data call costs one extra round trip through the API; fine at class scale. No offline data
  cache or app shell (cut): a load that fails while offline shows a plain offline message (CO-27);
  `public/sw.js` handles push only.
- Local PGlite serves one query at a time per process, so the dev server uses a single connection.
