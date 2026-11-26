# CampusOS ticket board

Owner of this file: Planning. Status changes only on the Lead's command (Done = Siam approved).
Build window: Day 1 = Tue 2026-11-24 … Day 6 = Sun 2026-11-29. **Demo: Mon 2026-11-30.**
Statuses: `Todo` / `In progress` / `In QA` / `Done`.

Rules of the board
- **Design approved: board v3, Siam 2026-11-26** (`docs/design/board-v3/index.html`, `screens.md` v3,
  `system.md` v3 are the source of truth). "Siam ✓ design ✅" in Depends on = met by v3. Any screen
  added later still needs Siam's design approval before it is built. (Blue board and Beranda were
  rejected on 2026-11-25.)
- A Developer ticket goes to `In QA` only after `npm run lint` and `npm run build` pass.
- "Due" means ready for QA by the end of that day.
- Campus time is WIB (UTC+7, `Asia/Jakarta`) everywhere: reminders, timeline, "today".

## Summary

| ID | Ticket | Owner | Due | Depends on | Status |
|---|---|---|---|---|---|
| CO-01 | Next.js 16 scaffold, Tailwind, Firebase client (`lib/firebase.ts`) | Developer | Day 1 | – | Done |
| CO-02 | Shared types `lib/types.ts` | Developer | Day 1 | CO-01 | Done |
| CO-03 | Firestore helpers `lib/data.ts` | Developer | Day 1 | CO-02 | Done |
| CO-04 | `firestore.rules` (users, classes, assignments, updates) | Developer | Day 1 | CO-02 | Done |
| CO-05 | i18n EN/ID (`lib/i18n.tsx`, `messages/`) | Developer | Day 1 | CO-01 | Done |
| CO-06 | Bottom nav (Today / Assignments / Updates) + page shells | Developer | Day 1 | CO-05 | Done |
| CO-07 | Web app manifest `app/manifest.ts` | Developer | Day 1 | CO-01 | Done |
| CO-08 | Spec: login, onboarding, Today timeline | Designer | Day 2 | – | Done (covered by screens.md v3) |
| CO-09 | Google sign-in + auth guard | Developer | Day 2 | CO-08, Siam ✓ design ✅ | Done (QA PASS) |
| CO-10 | Onboarding: pick classes + language | Developer | Day 2 | CO-08, Siam ✓ design ✅, CO-09 (sample seed data until CO-13) | Done (QA PASS) |
| CO-11 | Today timeline | Developer | Day 2 | CO-08, Siam ✓ design ✅, CO-10 | Done (QA PASS) |
| CO-12 | Firestore rules tests (emulator) | QA | Day 2 | CO-04 | Superseded by CO-43 (Neon) |
| CO-13 | Seed script with real CE timetable | Developer | Day 2 | timetable confirmed by Siam 2026-11-26 | Done (11 real USK classes; QA PASS, npm test 96) |
| CO-14 | Set-role script (custom claim + class editors) | Developer | Day 2 | seed data | Done (QA PASS) |
| CO-15 | Spec: assignments list, detail, editor form | Designer | Day 3 (morning) | – | Done (covered by screens.md v3) |
| CO-16 | Assignments list + detail (no "done" tabs / mark-done: cut) | Developer | Day 3 | CO-15, Siam ✓ design ✅, CO-10 | Done (QA PASS) |
| CO-17 | Assignment editor form (create + delete only, no edit) | Developer | Day 4 | CO-15, Siam ✓ design ✅, CO-14 | Done (QA PASS) |
| CO-18 | `lib/schedule.ts` (next sessions, reminder times) | Developer | Day 3 | CO-02 | Done (QA PASS) |
| CO-19 | Unit tests for `lib/schedule.ts` | QA | Day 3 | CO-18 | Todo |
| CO-20 | Notify route `app/api/cron/notify/route.ts` (reminders + update alerts via FCM; data from Neon) | Developer | Day 4 (port to Neon) | CO-18, CO-26, CO-42 | Done (built; real FCM send unverified) |
| CO-21 | Spec: updates feed, short update form, change badge | Designer | Day 4 (morning) | – | Done (covered by screens.md v3) |
| CO-22 | Updates feed | Developer | Day 4 | CO-21, Siam ✓ design ✅, CO-10 | Done (QA PASS) |
| CO-23 | Short update form (absent + room change only; reschedule removed, migration 002) | Developer | Day 4 | CO-21, Siam ✓ design ✅, CO-14 | Done (QA PASS) |
| CO-24 | Change badges on Today timeline (cancelled + room change; no reschedule badge) | Developer | Day 4 | CO-11, CO-22, Siam ✓ design ✅ | Done (QA PASS) |
| CO-25 | GitHub Actions cron `.github/workflows/notify.yml` (every 5 min) | Developer | Day 4 | CO-20, CO-23 | Done (built; real FCM send unverified) |
| CO-26 | FCM permission prompt + token saving | Developer | Day 3 | CO-09, Siam ✓ design ✅ | Built, push untested (needs Siam's Firebase project) |
| CO-27 | PWA icons + service worker + offline message (offline shell cut) | Developer | Day 5 | CO-07, CO-26 | Done (icons + manifest + offline message; shell cut) |
| CO-28 | Spec + build: iPhone add-to-home-screen hint | Designer → Developer | Day 5 | CO-27, Siam ✓ design ✅ | Done (real-iPhone look unverified) |
| CO-29 | Complete Indonesian text | Developer | Day 5 | all UI tickets | Todo |
| CO-30 | Neon production database: schema + migrations 002 and 003 applied, `DATABASE_URL` in Vercel (no Firestore rules deploy) | Developer | Day 5 | CO-42, CO-43, Neon project created ✅ (Siam 2026-11-26), Siam go-ahead | Done (schema 001–003 + 11 real classes via `npm run seed:classes --prod`; Vercel env set) |
| CO-31 | Deploy app to Vercel (incl. `CRON_SECRET`, admin creds) | Developer | Day 5 | CO-30, Siam go-ahead | Done (live at https://campusos-sudo.vercel.app; API 401 unauthenticated, cron 200 with secret; firebase-admin pinned ^13.10.0, Node 24.x) |
| CO-32 | Polish: empty / loading / error states already built only | Designer → Developer | – | – | Cut (Siam 2026-11-26; states stay as built) |
| CO-33 | Demo accounts (team's own Google accounts) | Developer | Day 6 | CO-14, CO-31 | Todo |
| CO-34 | Demo script + full regression on deployed app | QA | Day 6 | CO-31, CO-33 | Todo |
| CO-35 | Restyle built screens to the approved design (Login, Onboarding, Today) | Developer | Day 4 | CO-36, Siam ✓ design ✅ | Done (QA PASS) |
| CO-36 | New design direction + board: all screens at phone/tablet/desktop, landing, docs, changelog | Designer | Day 3 | Beranda rejected (2026-11-25) | Done (board v3 approved by Siam 2026-11-26) |
| CO-37 | Responsive: tablet two panes; desktop reuses the tablet layout (week timetable cut) | Developer | Day 5 | CO-36, Siam ✓ design ✅ | Done (QA + Designer PASS; tablet two panes, desktop reuses them) |
| CO-38 | Public landing page at `/` (signed-out, one screen; links to README and `CHANGELOG.md` on GitHub) | Developer | Day 5 | CO-36, Siam ✓ design ✅, CO-09 | Done (two columns ≥1024 px; release-notes link via `NEXT_PUBLIC_REPO_URL`) |
| CO-39 | `/changelog` page rendered from `CHANGELOG.md` | Developer | – | – | Cut (Siam 2026-11-26; replaced by a landing link to `CHANGELOG.md` on GitHub, CO-38) |
| CO-40 | `/docs` pages (student guide, editor guide) | Developer | after demo | CO-36, Siam ✓ design ✅ | Cut (after demo, Siam 2026-11-25) |
| CO-41 | `CHANGELOG.md` (Keep a Changelog), updated each day | Planning | Day 3, then daily | – | In progress |
| CO-42 | Move data layer to Neon Postgres + API route handlers with token-checked access | Developer | Day 3–4 (≈1.5–2 days) | Siam decision 2026-11-25 | Done (Developer checks, Lead curl check, QA suite 95 green) |
| CO-43 | API authorization tests (replace the Firestore rules tests) | QA | Day 4 | CO-42 (tests can be written from the criteria on Day 3) | Done (95 green) |

## Status refresh (Lead, 2026-11-26; from `docs/qa/v3-report.md`, `docs/qa/day4-report.md`)
- QA PASS, `npm test` 95 green: CO-09, 10, 11, 14, 16, 17, 18, 22, 23, 24, 35 → Done. QA-01..06 fixed.
- Designer specs CO-08, CO-15, CO-21 → Done (covered by `docs/design/screens.md` v3).
- CO-26 built; real push untested until Siam's real Firebase project exists.
- CO-23: reschedule kind removed (migration 002); updates are absent + room change only.
- Cut (accepted earlier): Assignments "done" tabs / mark-done are not built.
- Migrations 002 and 003 must be run on Neon as part of CO-30.
- Open low bug: QA-07, impossible dates (e.g. 2026-02-30) accepted by `POST /api/updates` (`docs/qa/day4-report.md`).
- Cuts 1–4 still pending with Siam.

Note on IDs: the Lead's schedule groups "rules tests" and "`lib/schedule.ts` + test" with
Developer work; they are split here because QA owns `tests/` and Developer owns `lib/`.
CO-26 moved to Day 3 so tokens exist before the notify route (CO-20) is built.
CO-20 reached QA before CO-26: the route is built and tested, but no tokens are saved yet, so a
real send can only be checked after CO-26 and a real Firebase project exist.

## QA results Day 2 (Lead, 2026-11-25; history: all fixed and re-checked PASS on 2026-11-26, `docs/qa/v3-report.md`)
| Ticket | Verdict | Open bugs |
|---|---|---|
| CO-09 | FAIL | QA-02 no sign-out control (Account sheet, screens.md §12) |
| CO-10 | PASS with issues | QA-03 reminders copy says 15 min, must say 30 min + deadlines; QA-05 edit-classes button must say Save |
| CO-11 | FAIL | QA-01 no "Next" marker |
| all screens | – | QA-04 `<html lang>` not set from saved language on load |
| CO-17 (API) | Low | QA-06 assignment length limits in `lib/validate.ts` (title 200 / instructions 5000 / links 10) differ from screens.md §9 (100 / 2000 / 5); details `docs/qa/api-auth-report.md` |
CO-09/10/11 stay In progress until these are fixed and re-checked; QA-02, QA-05 and QA-06 are being
fixed together with CO-35 (Developer, 2026-11-26).

## Before the demo (Lead, 2026-11-26; from `docs/qa/day5-report.md`, `docs/qa/day6-report.md`)
All build tickets are Done or cut; L-7 fixed (44×44, verified by the Lead); CO-13 Done (real
timetable, confirmed by Siam 2026-11-26). CO-30 and CO-31 Done: live at https://campusos-sudo.vercel.app
(repo github.com/sjsiam/campusos, private; all work committed on `main`). What remains is Siam-gated:
1. GitHub secrets `APP_URL` and `CRON_SECRET` (the CO-25 cron workflow is paused until then).
2. Add the Vercel domain to Firebase Auth authorized domains (Google sign-in on the live site).
3. CO-33 demo accounts → CO-34 demo script + regression on the live site.
4. Indonesian proofread (CO-29).
- **Security (still to do):** reset the Neon role password (it was shared in chat), then update
  `DATABASE_URL` in Vercel.
- Still unverified on the live site: real FCM push (CO-20/25/26), the iPhone hint on a real iPhone (CO-28).

## Plan Days 5–6 (Planning, 2026-11-26; all cuts decided)
Supersedes the earlier re-plans. Design gate met (board v3, 2026-11-26); CO-42/CO-43 Done.

Cuts decided by Siam:
- 2026-11-25: CO-40 `/docs` after the demo; CO-17 create + delete only (no edit, no "done" tabs);
  CO-24 no reschedule badge (reschedule removed entirely, migration 002); CO-38 one screen.
- 2026-11-26: (1) CO-37 desktop reuses the tablet two-pane layout; (2) CO-39 `/changelog` page →
  landing link to `CHANGELOG.md` on GitHub; (3) CO-27 offline shell → offline message only;
  (4) CO-32 polish dropped. Not taken: tablet → centred phone layout; iPhone hint → text line.

| Day | Developer | QA | Planning | Siam (needed) |
|---|---|---|---|---|
| 5 Sat 11-28 | CO-37 tablet two panes, CO-27 offline message, CO-38 changelog link, QA-07 fix, CO-29 Indonesian text; evening: CO-30/31 deploy | CO-20/25/27/28/38 now; CO-37, CO-29 as they land | CHANGELOG, board | Firebase + Neon projects and deploy go-ahead **by Day 5 midday**; ID proofread; real timetable (CO-13) |
| 6 Sun 11-29 | Morning: CO-33 demo accounts, CO-13 seed if timetable arrived; then prod bug fixes only | CO-34 demo script + regression on production | Board final | Approve the demo run |

**Honest read: the build work now fits** (Day 5 is a normal day, Day 6 is accounts, QA and fixes).
The remaining risk is outside the code: without the Firebase and Neon projects and the deploy
go-ahead by Day 5 midday, deploy slips to Day 6, real push is first tried on demo eve, and the
demo would fall back to the local emulators.

## Decisions applied (Siam, 2026-11-25; see TEAM.md)
- Google-only sign-in. Demo accounts are the team's own Google accounts.
- No Blaze plan, so no Cloud Functions. Notifications = Next.js route handler + GitHub Actions cron
  every 5 min (CO-20, CO-25). GitHub cron may run a few minutes late; acceptable. New-update alerts go
  out on the next cron run.
- Real timetable from Siam/Alfiz by Day 2 midday. Until then CO-10/CO-11 use the sample seed data.
- Campus time is WIB (Asia/Jakarta, UTC+7).
- Neon database and Vercel deploys still need Siam's explicit go-ahead on Day 5.
- **Data moves to Neon Postgres** (Siam, 2026-11-25 later). Firebase stays only for Google sign-in
  (Auth) and push (FCM). Route handlers verify the Firebase ID token and do the access checks
  `firestore.rules` did. No Supabase; assignment files stay as links. CO-03/CO-04 stay Done as
  history; CO-42 replaces them, CO-43 replaces CO-12.

## Day 1 (Done)

**CO-01..CO-07** — delivered before this board existed; accepted as Done per the Lead.

## Day 2 — Wed 2026-11-25

### CO-08 Spec: login, onboarding, Today timeline — Designer
- [ ] `docs/design/` has one spec per screen: login, onboarding (classes step, language step), Today.
- [ ] Each spec lists every text string as an i18n key with EN and ID copy.
- [ ] Today spec covers: class card (time, course, type, room), "now/next" state, empty day.
- [ ] Layout is defined for a 360 px wide viewport.

### CO-09 Google sign-in + auth guard — Developer
- [ ] Signed-out user opening `/today`, `/assignments` or `/updates` is sent to the login screen.
- [ ] "Continue with Google" signs in and lands on onboarding (first time) or `/today` (returning).
- [ ] A sign-out control exists and returns the user to the login screen.
- [ ] No Firebase keys or secrets in committed files (only `.env.local`, documented in `.env.example`).

### CO-10 Onboarding: pick classes + language — Developer
- [ ] User sees all seeded classes (sample seed data until CO-13 lands) grouped by course, shows code, name, section, type; can select several.
- [ ] Language choice (English / Bahasa Indonesia) switches the UI immediately.
- [ ] Finishing writes `users/{uid}` with `name`, `lang`, `classIds` (`fcmTokens` untouched); reopening the app skips onboarding.
- [ ] User can change classes and language later (e.g. from a settings entry).

### CO-11 Today timeline — Developer
- [ ] Shows only the user's classes whose slot `day` equals today in WIB, sorted by `start`.
- [ ] Each item shows start–end, course name, type and room.
- [ ] The class in progress is marked "now"; the next one is marked "next".
- [ ] A day with no classes shows the empty state from the spec.

### CO-12 Firestore rules tests — QA (superseded by CO-43 after the move to Neon)
- [ ] Tests in `tests/` run against the Firestore emulator with one command, documented in `docs/qa/`.
- [ ] Covers: user reads/writes only own `users` doc; student cannot create assignment/update; editor of class A can create for A but not B; editor cannot change `editors` or `createdBy`.
- [ ] Admin (custom claim `role=admin`) can create/delete classes; nobody else can.
- [ ] All tests pass on the current `firestore.rules`, or the FAIL is reported with the rule line.

### CO-13 Seed script with real CE timetable — Developer
- [ ] `scripts/` script reads the filled `docs/planning/timetable-template.md` (or a CSV made from it) and writes `classes` rows to Postgres (Neon or the local dev database) after CO-42.
- [ ] One `CampusClass` per course code + section + type; its rows become `slots[]`; `editors` starts empty.
- [ ] Running it twice does not create duplicates (stable doc IDs, e.g. `IF101-A-lecture`).
- [ ] Works against the emulator and, with Siam's go-ahead, the real project.

### CO-14 Set-role script — Developer
- [ ] `scripts/` script sets the custom claim `role` for a user by email (student/classrep/labassistant/lecturer/admin).
- [ ] For non-student roles it adds the user's uid to `editors` of the given class IDs (and can remove it).
- [ ] Prints what changed; running it twice is harmless.
- [ ] After the user signs in again, rules treat them as an editor (checked by QA via CO-12 scenarios).

## Day 3 — Thu 2026-11-26

### CO-15 Spec: assignments list, detail, editor form — Designer
- [ ] Specs for list (grouped by due: overdue, today, this week, later), detail, and create/edit form.
- [ ] The form uses one uniform format: class, title, instructions, links, due date + time (WIB).
- [ ] Validation messages and all strings given as i18n keys in EN and ID.

### CO-16 Assignments list + detail — Developer
- [ ] List shows assignments only for the user's `classIds`, sorted by `dueAt`, grouped as in the spec.
- [ ] Each row shows title, course and due date/time in WIB; overdue rows are visibly marked.
- [ ] Detail shows instructions and links; links open in a new tab.

### CO-17 Assignment editor form — Developer (Day 4; create + delete only, Siam 2026-11-25)
- [ ] Only editors of a class (or admin) see "Add assignment" for that class; students do not.
- [ ] Empty title or missing due date blocks saving with the spec's message.
- [ ] Saved assignment appears in the list for every student in that class after reload.
- [ ] Editor can delete their class's assignment (with a confirm step); it disappears for students after reload.
- [ ] No edit for the demo (cut by Siam); editing moves to after the demo.

### CO-18 `lib/schedule.ts` — Developer
- [ ] Pure functions (no Firebase): today's sessions for a set of classes, and next occurrence of a slot after a given time.
- [ ] Reminder times: class start −30 min; assignment `dueAt` −24 h and −1 h.
- [ ] All date maths in WIB (`Asia/Jakarta`, UTC+7) regardless of the device or server time zone (Vercel runs in UTC).
- [ ] Applies a `ClassUpdate` for a date (room change / new time / absent) to that day's session.

### CO-19 Unit tests for `lib/schedule.ts` — QA
- [ ] Tests cover: Sunday/Saturday wrap, class at 07:30 with reminder at 07:00, deadline at 00:30 with −1 h reminder the previous day.
- [ ] A test runs with `TZ=UTC` and still gets WIB results.
- [ ] Room-change, reschedule and absent updates applied correctly for that date only.
- [ ] Runs with one command, documented in `docs/qa/`.

### CO-20 Notify route `app/api/cron/notify/route.ts` — Developer (port to Neon on Day 4)
- [ ] Reads classes, assignments, updates, users and FCM tokens from Postgres via the CO-42 data layer; no Firestore reads left.
- [ ] Request without the correct `CRON_SECRET` header gets 401 and sends nothing; the secret lives only in env vars.
- [ ] Sends via firebase-admin FCM: class reminders 30 min before each session, deadline reminders 24 h and 1 h before `dueAt`, and an alert for each `updates` doc created since it was last alerted, to students whose `classIds` contain the class.
- [ ] All times computed in WIB (`Asia/Jakarta`) via `lib/schedule.ts`; a run up to 10 min late still sends each due reminder.
- [ ] No duplicates: each reminder/alert is marked sent in Postgres, so calling the route twice in a row sends nothing new.
- [ ] Skips a session marked absent; uses the new room/time for changed sessions; text in each student's `lang`; invalid FCM tokens are removed.

### CO-35 Restyle built screens to the approved design — Developer (Day 4)
- [ ] Login, Onboarding (3 steps) and Today match the Siam-approved CO-36 board (tokens, fonts, layout).
- [ ] Colours come from tokens in `app/globals.css` (no hard-coded hex in components); text contrast still meets WCAG AA (system.md §6).
- [ ] No behaviour change: QA re-runs the CO-09/10/11 steps in `docs/qa/day2-report.md` and they still pass.
- [ ] 375 px: no horizontal scroll; 44 px touch targets kept.

## Day 4 — Fri 2026-11-27

### CO-21 Spec: updates feed, short update form, change badge — Designer
- [ ] Specs for feed item (kind, class, date, new room/time, note, poster role), the form, and the badge on a Today card.
- [ ] The form fits on one phone screen; fields shown depend on kind.
- [ ] All strings as i18n keys in EN and ID.

### CO-22 Updates feed — Developer
- [ ] Shows updates only for the user's classes, newest first.
- [ ] Each item shows kind, course, affected date, new room/time when set, note, and that it came from a verified editor.
- [ ] Empty state from the spec when there are no updates.

### CO-23 Short update form — Developer
- [ ] Only editors of the class (or admin) can open it; students never see the entry point.
- [ ] Kind = room change requires new room; reschedule requires new time; absent requires neither.
- [ ] Posting creates a `updates` doc with `createdBy` = poster uid; it shows in the feed for that class's students.

### CO-24 Change badges on Today — Developer
- [ ] A Today card whose class has an update for today's date shows the badge from the spec.
- [ ] Room change shows the new room on the card (old room struck through); absent shows the class as cancelled.
- [ ] No reschedule badge for the demo (cut by Siam); reschedule updates still appear in the Updates feed.
- [ ] Updates for other dates do not affect today's cards.

### CO-25 GitHub Actions cron `.github/workflows/notify.yml` — Developer
- [ ] Runs on `schedule` every 5 minutes (`*/5 * * * *`) and on manual `workflow_dispatch`.
- [ ] Calls the production notify URL with the `CRON_SECRET` header from a GitHub Actions secret (never in the file).
- [ ] Job fails (red in Actions) when the route returns non-2xx.
- [ ] A new update posted by an editor reaches a subscribed phone within ~10 minutes.

### CO-26 FCM permission prompt + token saving — Developer
- [ ] After onboarding the user is asked to enable notifications (not on first page load).
- [ ] Granting saves the token via `addFcmToken`; the same token is not stored twice.
- [ ] Denying leaves the app fully usable and shows how to enable it later.

## Day 5 — Sat 2026-11-28

### CO-27 PWA icons + service worker + offline message — Developer (offline shell cut, Siam 2026-11-26)
- [ ] Manifest icons at 192 and 512 px plus a maskable icon and an Apple touch icon; Lighthouse "installable" passes.
- [ ] Service worker handles FCM background messages (notification shows with app closed on Android Chrome).
- [ ] Opening the app offline shows the app's own offline message in the current language, not the browser error page. No cached app shell (cut).

### CO-28 iPhone add-to-home-screen hint — Designer → Developer
- [ ] Designer spec in `docs/design/` (Share → Add to Home Screen steps, EN + ID).
- [ ] Shown only on iOS Safari when not already installed (`display-mode: standalone` false).
- [ ] Can be dismissed and stays dismissed on that device.

### CO-29 Complete Indonesian text — Developer
- [ ] `messages/id.json` has every key in `messages/en.json` (no missing keys; QA checks with a script or test).
- [ ] With language = Indonesian, no English text remains on any screen (dates and weekdays included).
- [ ] Notification texts (CO-20) exist in both languages.

### CO-30 Neon production database — Developer (needs Siam's go-ahead)
- [ ] The Neon project exists (created by a human, NEEDS SIAM) and the schema plus migrations 002 (reschedule removed) and 003 (`assignments.created_at`) are applied to it.
- [ ] `DATABASE_URL` is set in Vercel env vars only (never in the repo); CO-43 tests passed first.
- [ ] Production data seeded with the real timetable (CO-13) and demo roles (CO-14).
- [ ] No Firestore rules or Cloud Functions deployed; Firebase is used only for Auth and FCM.

### CO-31 Deploy app to Vercel — Developer (needs Siam's go-ahead)
- [ ] Production URL loads on HTTPS; env vars set in Vercel, none in the repo.
- [ ] The Vercel domain is added to Firebase Auth authorized domains; Google sign-in works there.
- [ ] Installable on Android Chrome and iPhone Safari from the production URL.
- [ ] `CRON_SECRET` and firebase-admin service account set as Vercel env vars; a test update on a seeded class produces a notification on a real phone after the next cron run.

## Day 6 — Sun 2026-11-29

### CO-32 Polish of existing states — CUT (Siam 2026-11-26; criteria below kept for after the demo)
- [ ] Only states already built (screens.md §13 catalogue) are polished to the approved design; no new states added.
- [ ] Every data screen shows a loading state, never a blank screen or layout jump.
- [ ] Network/permission errors show a readable message in the current language.

### CO-33 Demo accounts — Developer
- [ ] Three of the team's own Google accounts are set up as student, class rep (editor of one demo class) and lecturer (editor of one demo class) via CO-14.
- [ ] Student is enrolled so Today shows at least one class on demo day (Mon 2026-11-30).
- [ ] Account list (emails, roles, classes; no passwords) written to `docs/qa/` for QA.

### CO-34 Demo script + full regression — QA
- [ ] `docs/qa/demo-script.md`: a step-by-step 5-minute demo covering core (a), (b), (c) in both languages.
- [ ] Every ticket's acceptance criteria re-checked on the production URL; results PASS/FAIL per ticket.
- [ ] Demo run once end to end on a real phone without errors.

## Added scope (Siam + Alfiz, 2026-11-25 later)

### CO-36 New design direction + board — Designer
- [ ] One new direction on the board (Beranda and the blue board are not reused), with phone (375 px), tablet (768 px) and desktop (1280 px) mockups of Today, Assignments, Updates.
- [ ] Mockups also for landing `/`, `/changelog` (and `/docs` unless cut).
- [ ] `docs/design/system.md` tokens + `screens.md` updated to match; strings stay as i18n keys EN/ID.
- [ ] Siam's approval recorded (date + any changes requested) in `docs/design/`.

### CO-37 Responsive layout — Developer
- [ ] At 360, 768 and 1280 px every signed-in screen has no horizontal scroll and text stays ≥16 px.
- [ ] Tablet (768 px): two panes as in the approved design (e.g. list + detail).
- [ ] Desktop (1280 px) reuses the tablet two-pane layout (week timetable + side panels cut, Siam 2026-11-26); navigation is not a stretched phone bottom bar.
- [ ] Phone remains the default: install, push and the add-to-home-screen hint still work.

### CO-38 Landing page `/` — Developer
- [ ] Signed-out visitor at `/` sees the landing page; a signed-in user goes straight to `/today` (or onboarding).
- [ ] One screen only (Siam 2026-11-25): name, one-line pitch, sign-in button, links to the GitHub README and to `CHANGELOG.md` on GitHub (base URL from `NEXT_PUBLIC_REPO_URL`), in EN and ID. No `/changelog` page (CO-39 cut).
- [ ] No invented numbers or testimonials; works at 360/768/1280 px.

### CO-39 `/changelog` — CUT (Siam 2026-11-26; replaced by the landing link in CO-38)
- [ ] Renders `CHANGELOG.md` from the repo at build time; no webhook, no separate site.
- [ ] Public (no sign-in); headings and lists readable at 360 px.
- [ ] Updating `CHANGELOG.md` and redeploying updates the page; nothing else needed.

### CO-40 `/docs` — Developer (cut to after the demo, Siam 2026-11-25)
- [ ] Public pages: "For students" (install, pick classes, notifications) and "For class reps / lecturers" (post an update, add an assignment).
- [ ] Content from `docs/design/screens.md` flows, EN and ID; linked from landing.

### CO-41 `CHANGELOG.md` — Planning
- [ ] Follows Keep a Changelog 1.1.0, with an `Unreleased` section listing only what is built.
- [ ] Updated at the end of each day from reports; QA verdicts noted where a feature is not yet passing.

## Database move (Siam, 2026-11-25 later)

### CO-42 Move data layer to Neon + API route handlers — Developer (≈1.5–2 days, Day 3–4)
- [ ] Postgres schema for users, classes (+ slots, editors), assignments, updates, FCM tokens and notification sent-markers, applied by a migration command; documented in `ARCHITECTURE.md`.
- [ ] The browser no longer reads or writes Firestore: every read/write goes through `app/api/...` route handlers, and the `lib/types.ts` contract is unchanged for the screens.
- [ ] Every route verifies the Firebase ID token (401 without/invalid) and enforces the old rules: own profile only; only editors of a class (or admin) create/update/delete its assignments and updates; editors cannot change editors or `createdBy` (403 otherwise).
- [ ] Seed (CO-13) and set-role (CO-14) scripts write to Postgres; local dev runs with one documented command set (ARCHITECTURE.md §7) without a real Neon project.
- [ ] `npm run lint`, `npm run build` and existing `lib/` tests pass.

### CO-43 API authorization tests — QA
- [ ] Tests in `tests/` call the route handlers with tokens for student, editor of class A, admin and no token; run with one command documented in `docs/qa/`.
- [ ] Cover every case CO-12 covered (own profile only; student cannot post; editor of A posts to A not B; editor cannot change `editors`/`createdBy`; only admin manages classes), now as HTTP 401/403/200.
- [ ] Use a local or throwaway database, never production data.
- [ ] All pass, or each FAIL is reported with the route and request.

## After the demo
- CO-40 `/docs`; assignment edit and "done" tabs (CO-17); CO-32 polish; CO-39 `/changelog` page;
  offline app shell (CO-27); desktop week timetable (CO-37).
- **D6-4** (Lead decision 2026-11-26): when two classes overlap (e.g. Fri STIK1005 + STIK1007 lab),
  Today's "now" band shows only one of them. Kept as is for the demo (`docs/qa/day6-report.md`).
- QA-07: impossible dates (e.g. 2026-02-30) accepted by `POST /api/updates`, unless fixed before.

## Cut / stretch (not scheduled)
Crowd map and Wi-Fi status reports (1-hour expiry). Only if every core ticket is Done before Day 6.
