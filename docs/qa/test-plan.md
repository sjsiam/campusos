# CampusOS manual test plan

Owner: QA. Updated 2026-11-26 for board v3, the Neon/API move and Siam's cuts 1–4
(desktop reuses the tablet two-pane layout; no `/changelog` page, landing links to GitHub
`CHANGELOG.md`; no offline app shell, offline message only; no CO-32 polish).

Run on a real Android phone (Chrome) and a real iPhone (Safari, iOS 16.4+) for sign-off.
The built-in browser / desktop Chrome with emulation is fine for a first pass. Locally use
**`http://localhost:3000`** (the Auth emulator follows the page host).

**Accounts** (seed, emulator): `student@demo` (student), `rep@demo` (class rep, editor of
`sisdig-a` / TKE-201 only), `admin@demo` (claim `role: admin`), plus Siti Rahma / Fajar Maulana /
Dra. Cut Meutia as posters. Production demo accounts: CO-33 list in `docs/qa/`.
Note: `npm run seed` deletes and re-creates the demo users, which signs out open demo sessions.

Mark each line PASS / FAIL. A FAIL gets: device + browser, account, exact steps, expected, actual, screenshot.

## Automated
- [ ] `npm test` green (API tests need Auth emulator, `npm run db`, `next dev`; see `api-auth-report.md`)
- [ ] `npm run lint` and `npm run build` pass

## 1. Sign-in, landing, onboarding
- [ ] Signed out: `/` shows the landing page; `/today`, `/assignments`, `/updates` go to `/login`
- [ ] Sign in from landing or `/login` → onboarding (first time) or `/today`; signed-in `/` → `/today`
- [ ] Landing "changelog" link: shown only when `NEXT_PUBLIC_REPO_URL` is set, points to GitHub `CHANGELOG.md`, opens in a new tab (see Day 6 checks)
- [ ] Onboarding 1–3: language switches at once; class search; "Lanjut · n kelas" disabled at 0; step 3 never skipped (iPhone Safari: Home Screen steps; iOS Chrome/Firefox: "use Safari")
- [ ] Account sheet: name, email, role; change classes ("Simpan"); language; reminders state; "Keluar" → `/login`

## 2. Today (`/today`)
- [ ] Only the user's classes on today's WIB weekday, sorted by start; times stay WIB with the phone in another time zone
- [ ] Now band during a class; one "Berikutnya" (skips cancelled); gap rows ≥ 30 min; past rows muted
- [ ] Room change: new room highlighted, old struck; cancelled: "Dosen/Asisten berhalangan" + note verbatim, never hidden
- [ ] "Tenggat dekat" rows; hidden when none; empty day shows the empty state
- [ ] Reps see "Lapor perubahan"; students don't
- [ ] 360px: no horizontal scroll; controls ≥ 44px

## 3. Assignments
- [ ] Groups Lewat tenggat / Hari ini / Minggu ini / Nanti; only the user's classes
- [ ] Detail: course, title, countdown + due WIB, instructions, links (new tab, `noopener`), "Ditambahkan oleh {name}, {role} · {date}"
- [ ] Editors only: "Tambah" and "Hapus tugas"; student by URL to `/assignments/new` sees "not allowed"
- [ ] New form: title/due required, `javascript:` link rejected, read-back "… WIB", max 100 / 2000 / 1 link field
- [ ] Delete asks "Hapus untuk n mahasiswa?" with [Hapus] [Jangan]
- (Cut: mark as done / Done tab, editing an assignment.)

## 4. Updates and Report change
- [ ] Feed newest first; unread tinted "· Baru"; own posts not "Baru" and not counted in the badge; "(kamu)"; poster role "ketua kelas / asisten lab / dosen terverifikasi"
- [ ] Report sheet (editors only): kind Batal / Pindah ruang (no reschedule), session list, new room required for Pindah ruang, note optional, "Kirim ke n mahasiswa"
- [ ] Posted change shows on Today and Updates right away
- [ ] Push for a new update arrives on a subscribed phone after the next cron run (every 5 min; GitHub may be a few minutes late), only for students of that class

## 5. EN / ID
- [ ] Every label switches on every screen; no raw keys; dates/weekdays localised ("Kam 26 Nov")
- [ ] Choice survives reload; `<html lang>` matches
- [ ] Longest Indonesian strings fit at 360px

## 6. PWA, reminders and push
### Android (Chrome)
- [ ] Chrome offers install (manifest + 192/512/maskable icons); installed app opens `/today` standalone, teal theme
- [ ] Reminders notice on Today (permission "default"): [Aktifkan] / [Nanti] / ✕; permission prompt only after a tap
- [ ] Granted → Account shows "Aktif"; denied → "Diblokir" + how-to, app still usable
- [ ] Class reminder 30 min before, deadline 24 h and 1 h before, update alert; tap opens the right screen; no duplicates
### iPhone (Safari, iOS 16.4+)
- [ ] Safari tab: Today notice "Di iPhone, pengingat hanya jalan setelah…" + "Lihat caranya" sheet; Share / Add to Home Screen glyphs look right
- [ ] Home Screen app: correct icon/name, opens standalone, content clear of notch and home bar; sign in again (separate storage), onboarding skipped
- [ ] Permission can be granted from the Home Screen app; push arrives with the app closed

## 7. Offline (message only, no app shell)
- [ ] App open, then go offline: the offline message shows on Today, Assignments, Updates (EN and ID); no crash, no endless spinner
- [ ] Back online: message disappears; data loads again (reload or retry)
- [ ] Not expected (cut): opening the app from cold while offline. The browser's own offline page is acceptable.

## 8. Layout at tablet and desktop (cut 1: desktop = tablet two-pane)
See Day 6 checks below.

## 9. Security spot checks (deployed build)
- [ ] API without token → 401; student POST to `/api/updates` → 403 (devtools/curl)
- [ ] `/api/cron/notify` without the secret → 401
- [ ] Client bundle has only the public Firebase web config; no `DATABASE_URL`, `CRON_SECRET`, service account; `NEXT_PUBLIC_USE_EMULATORS` / `FIREBASE_AUTH_EMULATOR_HOST` **not** set on Vercel
- [ ] `.env.local` not committed

## Day 6 checks (responsive, offline message, changelog link)

Run when the Developer reports them done. Accounts: `student@demo` and `rep@demo`.

### R. Tablet 768 and desktop 1280 (two panes at both; no week grid, no 220px rail required)
| ID | Viewport | Check |
|---|---|---|
| R-1 | 768×1024, 1024×768, 1280×800 | Today: timetable pane + second pane (changes + due soon) side by side; nothing cut off; no horizontal scroll |
| R-2 | same | Updates: feed + today's timetable pane |
| R-3 | same | Assignments: list + detail side by side; picking a row updates the detail without a page jump; deep link `/assignments/{id}` opens with that item selected |
| R-4 | same | Navigation: rail or bottom nav per the Developer's build (system.md: 72px icon rail); active item marked; labels or `aria-label` on icon-only items |
| R-5 | same | App-bar actions (language, avatar, "Lapor perubahan" for reps, "Tambah") reachable; sheets (Account, Report change) look right and don't stretch edge to edge awkwardly |
| R-6 | 767 → 768 → 1023 → 1024 | Resize across breakpoints: no broken in-between state, no duplicated nav |
| R-7 | 1280, EN + ID, light + dark | Line lengths readable (content not stretched to 1280px); focus ring visible with keyboard Tab through the panes |
| R-8 | 360 / 375 | Phone layout unchanged (regression: Today, Assignments, Updates, Report sheet) |
| R-9 | 1280 | Landing: text left, screenshot right; login and onboarding centred, not stretched |

### O. Offline message
| ID | Check |
|---|---|
| O-1 | Signed in on Today, go offline (devtools "Offline" or Wi-Fi off): message shows in the current language (EN and ID) |
| O-2 | Switch tabs while offline (Assignments, Updates): message on each; no endless spinner, no raw error |
| O-3 | Try "Lapor perubahan" / "Tambah" while offline: clear failure message, input kept, no false "Posted" |
| O-4 | Back online: message goes away (without a reload if the build listens to `online`); retry loads data |
| O-5 | Copy check: "Menampilkan data terakhir" ("Showing the last saved data") must not be promised if no data is cached. With the Firestore cache gone, ask the Developer what is shown and match the text |

### C. Changelog link on the landing page
| ID | Check |
|---|---|
| C-1 | `NEXT_PUBLIC_REPO_URL` unset (local default): no changelog link, no empty gap where it would be |
| C-2 | Set (needs a dev server restart; ask the Lead): link shown in EN ("Changelog") and ID ("Catatan rilis"), href = `{REPO_URL}/blob/main/CHANGELOG.md` (or as the Developer documents), new tab with `rel="noopener noreferrer"` |
| C-3 | No `/changelog` route is linked anywhere in the app (`grep -rn "/changelog" app components`) |
| C-4 | `CHANGELOG.md` exists at repo root and the link target would resolve once pushed |

## End-to-end demo path (both phones, before the demo on 2026-11-30)
1. iPhone: open the production URL in Safari, see the landing page, add to Home Screen, open it, sign in as the student, allow notifications. Android: install via Chrome, sign in as the rep.
2. Student: Today shows the day's classes, now band and "Berikutnya"; switch ID ↔ EN.
3. Rep (Android): "Lapor perubahan" → Pindah ruang → today's session → new room → "Kirim ke n mahasiswa".
4. Student: the change shows on Today and Updates at once (reload if needed); the push arrives after the next cron run (≤ ~10 min).
5. Rep: "Tambah" an assignment due tomorrow 23:59; student sees it under "Hari ini"/"Minggu ini" with the right WIB time.
6. Rep: show there is no way to post for a class they don't edit (only verified editors).
7. Student: Account → "Keluar"; `/today` asks to sign in.

Fallback if push is late on stage: show the change on Today/Updates (it is the same event the cron sends), and say the alert follows within the next cron run.
