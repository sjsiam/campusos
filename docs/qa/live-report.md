# QA report: production, signed-out checks

Site: https://campusos-sudo.vercel.app · Date: 2026-11-26 (evening WIB) · No sign-in, no data posted,
cron never called with the secret.

**Verdict: PASS, with one finding for Siam (LIVE-1: release-notes link 404s because the repo is private).**

## API without credentials (curl)

| Request | Result |
|---|---|
| `GET/PUT /api/me`, `POST /api/me/fcm-tokens` | 401 `missing ID token` |
| `GET/POST /api/classes`, `PATCH/DELETE /api/classes/stik1005-14-lecture` | 401 |
| `GET /api/assignments?classIds=…`, `POST`, `PATCH/DELETE /api/assignments/x` | 401 |
| `GET /api/updates?classIds=…`, `POST`, `PATCH/DELETE /api/updates/x` | 401 |
| `Authorization: Bearer garbage` | 401 `invalid ID token` |
| Forged unsigned token (`alg: none`, `role: admin`) | 403 from Vercel's firewall (never reaches the app) |
| Forged RS256-looking token (`role: admin`, fake signature) | 401 `invalid ID token` → **AU-06 holds in production** (no emulator trust) |
| Token in a cookie only | 401 |
| `/api/users/x` | 404 (no such route) |
| `POST /api/cron/notify` no header / `Bearer wrong` / `Bearer undefined` | 401 `unauthorized` |
| `GET /api/cron/notify` | 405 |

No body contains SQL, stack traces or table names.

## Bundle and headers
- 13 JS chunks from `/`, `/login`, `/today` scanned: no `DATABASE_URL`, Neon/Postgres URL, `CRON_SECRET`,
  service-account or private key. Only the public Firebase web API key (expected).
- The client's emulator branch is dead in production: `"true" !== env.NEXT_PUBLIC_USE_EMULATORS` (not set),
  so it never connects to `:9099`.
- `strict-transport-security: max-age=63072000; includeSubDomains; preload` on HTTPS.

## Manifest, icons, PWA
| Item | Result |
|---|---|
| `/manifest.webmanifest` | 200, `start_url /today`, `standalone`, `theme_color #0E5A5B`, `background_color #FFFFFF` |
| `/icons/icon-192.png`, `/icons/icon-512.png`, `/icons/maskable-512.png` | 200 PNG, 192², 512², 512² |
| `icon.png` (64²), `apple-icon.png` (180²) | 200 PNG |
| `/sw.js` | 200 `application/javascript` |
| `theme-color` meta | `#0E5A5B` light / `#0B2E2E` dark |

## Pages (built-in browser)
| Check | Result |
|---|---|
| Landing 375 light, EN | PASS: headline, body, Google button 52px, Today screenshot (real timetable, alt text), footer; no horizontal scroll |
| Landing 375 dark | PASS: bg `rgb(15,23,22)`, no horizontal scroll |
| Landing 1280 dark (and light) | PASS: two columns (text x168 w620, screenshot x858) |
| Landing in ID | PASS: `lang="id"`, "Masuk dengan Google", "Catatan rilis" |
| Release notes link | Present, `https://github.com/sjsiam/campusos/blob/main/CHANGELOG.md`, new tab, `noopener noreferrer`, 44px. **Target 404s for visitors: LIVE-1** |
| `/login` | PASS: "Masuk ke CampusOS", Google button, hint; no nav, no scroll |
| Signed-out `/today` | → `/login` |
| Console | No errors or warnings on `/` and `/login`; every request 200 (fonts, CSS, JS, image) |

### LIVE-1 (Medium, needs Siam) Release-notes link opens a GitHub 404 for everyone outside the team
- Steps: open https://campusos-sudo.vercel.app signed out → "Release notes" / "Catatan rilis".
- Expected: the changelog.
- Actual: `https://github.com/sjsiam/campusos/blob/main/CHANGELOG.md` → 404 for a signed-out visitor.
  The repository is **private** (`gh repo view`: `PRIVATE`); the file exists on `main`.
- Options: make the repo public (Siam's call), or unset `NEXT_PUBLIC_REPO_URL` on Vercel and redeploy
  (link hides itself), or point it at a public copy.

## Not covered yet (needs sign-in on production)
Onboarding, Today/Assignments/Updates with real accounts, rep posting, push delivery from the GitHub cron,
install on real phones. Script for those: `docs/qa/demo-script.md`.

## CO-19 reminder windows (unit tests, 2026-11-26)

`lib/schedule.test.ts` (Developer) already covered: class reminder 30 min before with the 15-min
grace, a session just after midnight, cancelled sessions skipped, room change → new room, a change
posted inside the window sends only the update alert, deadlines at 24 h and 1 h, push texts.

Added `tests/schedule.reminders.test.ts` (14 tests, whole file runs with `TZ=UTC` like Vercel):
- **UTC guard:** asserts the process offset is 0, so the WIB results below can't come from the machine zone.
- **Saturday:** both 08:00 sessions (STIK1009 lecture + STIK1011 lab) fire at 07:30 WIB = 00:30 UTC; nothing at 07:29 or after the grace; a cancelled lecture is skipped while the lab still fires; Sat 23:50 → Sunday 00:15 session (week wraps 6 → 0); no reminders on a day without slots.
- **Updates for their own date only:** next Saturday's cancellation doesn't affect this Saturday; this Saturday's room change puts the new room in the job.
- **Deadline across midnight:** due Sun 00:30 → 1 h reminder Sat 23:30, 24 h reminder Sat 00:30 (Fri 17:30 UTC); orphan deadline (class deleted) sends nothing.
- **No double send:** within a window (cron every 5 min, window 15 min) the job ids are identical on every run (class, due1/due24, update alert), so the route's `insert … on conflict do nothing` claim sends each once. The claim itself was exercised in-process earlier (C-06, `day5-report.md`).

All pass; `npm test`: **110 passed, 1 skipped**. Nothing needs moving to `lib/`.

## CO-26 real push (2026-11-26, Lead with Siam)
- Direct FCM test to Siam's 2 saved tokens: 2 sent, 0 failed; notification shown on Siam's phone.
- Real flow: Siam posted a class update (STIK1007 absent, 2026-11-27); notify run 45819655999 sent it (2 sent, 0 failed); alert shown on the phone. PASS.
- Device: iPhone, installed Home Screen app (CO-28: redirect sign-in and push both PASS on a real device).
