# QA report: Day 6 (CO-37 responsive, CO-27 offline message, CO-39 release-notes link)

Date: 2026-11-26/27. `http://localhost:3000`, built-in browser. Viewports 375, 767, 768, 1023,
1024, 1280; EN and ID; light and dark; `student@demo` and `rep@demo`. Checklist: `test-plan.md`
"Day 6 checks". `npm test`: 95 passed, 1 skipped (C-06).

**Verdict: PASS with one spec FAIL (D6-1, sheets full-width on wide screens) and two low deviations.**

## R. Responsive layout (cut 1: desktop = tablet two-pane)

| ID | Result | Evidence |
|---|---|---|
| R-1 Today | PASS | 768: 72px icon rail · timetable 400 · side pane 296. 1024/1280: 220px rail with wordmark · timetable 400 · side pane 404/660 ("Perubahan minggu ini" + "Tenggat dekat"). No horizontal scroll at any width. |
| R-2 Updates | PASS | Feed + today's timetable pane (320 at 768, 380 at 1024). |
| R-3 Assignments | PASS | List + detail. Clicking a row changes the URL to `/assignments/{id}`, list stays put (x and scroll unchanged), selected row `aria-current="page"` + `bg-primary-soft`, detail on the right. Deep link `/assignments/a-lab-1` (full load) opens with that row selected and its detail; no Back button in two-pane (as spec). |
| R-4 Navigation | PASS | 72px icon rail at 768–1023, 220px rail at ≥1024, bottom nav < 768; one nav at a time. Rail links have accessible names (Hari ini / Tugas / Info kelas); active item marked. |
| R-5 Actions + sheets | **FAIL (D6-1)** | Actions reachable (rep's "Lapor perubahan" 161×44 in the timetable pane's app bar; language; avatar). But the Report change and Account sheets span the full width at 1280: the sheet's content is 1248px wide (segmented control, input and "Kirim ke 4 mahasiswa" stretched edge to edge). |
| R-6 Breakpoints | PASS | 767: bottom nav only, no side pane. 768: icon rail. 1023: icon rail 72. 1024: 220 rail. No duplicate nav, no scroll in between. |
| R-7 Wide screens, EN/ID, light/dark | PASS | 1280 dark: bg `rgb(15,23,22)`, readable; panes keep fixed widths so lines stay short; no control under 44px on any of the three pages at 768/1024/1280. |
| R-8 Phone regression (375) | PASS | Today, Assignments, Updates: bottom nav, no side pane, no horizontal scroll, no control under 44px; assignment detail is its own page with Back. |
| R-9 Wide login / onboarding / new / landing | PASS / low | `/login` centred column at 1280 ✓; `/assignments/new` centred column (form 422–848px), no rail ✓. Landing: one centred column; v3 asks for text left + screenshot right on desktop (D6-3). |

### D6-1 (Medium, spec mismatch) Sheets are full-width on tablet/desktop
- Steps: sign in as `rep@demo`, viewport 1280×800 (also 768), Today → "Lapor perubahan" (or the avatar → Account).
- Expected (`system.md` §5): "Sheets (Report change, Account, iPhone steps) on ≥ 768px: same sheet,
  `max-w-[480px] mx-auto` and bottom-attached, so it reads as a panel, not a full-width bar."
- Actual: the sheet panel is 1280px wide; its content column is 1248px, so the segmented
  control, note input and send button stretch across the whole screen.

### D6-2 (Low) `/assignments` on wide screens shows a "pick one" placeholder instead of the first item
- Spec (`system.md` §5 table): the detail pane's "default = first item in the list"; the empty-state
  text is only for an empty list ("Pilih tugas untuk melihat detail").
- Actual at 768/1024/1280: list on the left, right pane "Pilih tugas untuk melihatnya di sini."
  while the list has 5 items. Works fine, just differs from spec; Designer/Developer to pick one.

### D6-3 (Low) Landing has no desktop layout
At 1280 the landing page is the phone column centred. v3 table: "Desktop: text left, screenshot right".
Probably covered by the cuts; Designer to confirm.

## O. Offline message (no app shell, cut 3)

Simulated in the page (`navigator.onLine = false`, `offline` event, `fetch` to `/api/*` rejected);
the built-in browser has no DevTools network toggle. Real-device check still advised.

| ID | Result | Evidence |
|---|---|---|
| O-1 | PASS | Page with data open, go offline: banner "You're offline. Showing the last saved data." over the 3 items still shown; ID copy present in `messages/id.json`. |
| O-2 | PASS | Switching to Today / Assignments / Updates offline: each shows "Kamu sedang offline. Sambungkan ke internet lalu coba lagi." / "You're offline. Connect to the internet and try again." + "Coba lagi"; no spinner left running, no raw error. |
| O-3 | PASS | Rep, offline, Report change → Batal → Send: sheet stays open, `role="alert"` "Couldn't post. Try again.", no "Posted" banner, nothing sent. |
| O-4 | PASS (minor) | Back online: offline text disappears at once; "Coba lagi" reloads the data (3 items). There is no automatic refetch on `online`, so the page waits for the tap. Acceptable; noted. |
| O-5 | PASS | "Showing the last saved data" only appears while loaded data is on screen; pages that have nothing show the "connect and try again" text instead. No false promise. |

## C. Release-notes link (CO-39)

Checked by code. `NEXT_PUBLIC_REPO_URL` is a build-time value, and setting it means restarting the Lead's dev server, which I didn't do.

| ID | Result | Evidence |
|---|---|---|
| C-1 Unset | PASS | `app/page.tsx`: the link renders only `{repo && …}`; live landing at 375/1280 shows no link and no gap. |
| C-2 Set | PASS by code, not live | `href={repo}/blob/main/CHANGELOG.md` (trailing slashes trimmed), `target="_blank" rel="noopener noreferrer"`, `min-h-11`, label `land.changelog` (EN "Changelog" / ID "Catatan rilis"). Live check needs a dev-server restart with the env set, or the Vercel preview. |
| C-3 | PASS | No `/changelog` route or link left in `app/` or `components/`. |
| C-4 | PASS | `CHANGELOG.md` at repo root; `.env.example` documents `NEXT_PUBLIC_REPO_URL`. On Vercel it must be set **before the build** (`NEXT_PUBLIC_*` is inlined). |

## Testing notes
- The browser is left signed in as `rep@demo` on localhost, language EN, desktop size.
- Not covered: real tablet/desktop hardware, real offline (Wi-Fi off), keyboard-only walk through the panes at 1280 (focus ring was checked on phone earlier), the Designer's visual pass (in parallel).

## Re-check after the D6 fixes (2026-11-27, ~15:35–15:50)

To keep the Designer's shared `localhost` session signed in: rep@demo was checked on `localhost`
(own tabs, no sign-out), student@demo on `127.0.0.1:3000` (separate storage), and the signed-out
landing on `127.0.0.1` after signing my own student session out there.

| ID | Result | Evidence |
|---|---|---|
| D6-1 Sheets 480px on ≥ 768 | **STILL FAIL on :3000** | Report change and Account sheets measure 768 / 1024 / 1280 wide (buttons 736 / 992 / 1248), rep and student. Source is right: `app/globals.css:53` `@media (min-width: 768px) { dialog.sheet { margin: auto auto 0; max-width: 480px; } }`. But the CSS the dev server serves (`/_next/static/chunks/app_12imn6846b1er._.css`) has the base `dialog.sheet` rule and the reduced-motion rule, **not** this one; the computed style shows `max-width: none`. Either the dev server is serving a stale build of `globals.css` (edited 15:32:27) or the CSS pipeline drops the rule. **Ask:** Developer, check `npm run build` output for the rule; if it's there, the Lead restarts/touches the dev server and I re-check. If it's missing in the build too, try moving it under `@layer components` or using Tailwind classes on the `<dialog>` (`md:mx-auto md:max-w-[480px]`). |
| D6-2 Wide `/assignments` opens the first item | PASS | 768 / 1024 / 1280, rep and student: `/assignments` → `/assignments/a-sisdig-1`, row `aria-current`, detail "Kuis 2: perbaikan jawaban", no placeholder. Phone (375) still shows the list. |
| D6-3 Landing two columns ≥ 1024 | PASS | 1280: headline x168 w620, Google button 384 wide, screenshot x858; 1024: text x40, screenshot x730; 375: one column. No horizontal scroll. Release-notes link absent (env unset), as expected. |
| Side pane cap 640 | PASS | Today at 1280: rail 220 · timetable 400 · side pane 640 (was 660). Updates at 1280: feed + 380 today pane. |
| Pane top spacing | PASS (measured, visual is the Designer's) | Timetable section starts below the pane app bar (y96 student, y120 rep with the "Lapor perubahan" row); side pane from y0. |
| Student vs rep | PASS | Student: no "Lapor perubahan", "Tambah" or "Hapus" at any width; rep has "Lapor perubahan" (161×44). |
| 375 regression | PASS + L-7 | Today/Updates/Assignments: bottom nav, no side pane, no horizontal scroll. New low: **L-7** the "All" link beside "Due soon" is 17×44 in EN (44 high but only 17 wide); give it `min-w-11` or horizontal padding. "Semua" in ID is wider. |

Not covered: the visual look of the fixes (Designer's pass, in parallel). `[::1]:3000` can't be used
as a third origin (the Auth emulator only listens on 127.0.0.1, so auth never resolves there).

### D6-1 re-check after the dev-server restart

**D6-1: PASS.** As rep@demo at 768×1024 on `localhost:3000`: the Report change sheet has computed
`max-width: 480px`, measures 480 wide at x144 (144px either side, so centred), bottom gap 0
(bottom-attached), and its widest button is 448px. The Lead verified the Account sheet at 1280
(480px, centred). Cause was a stale dev server, not the code.

Open: L-7 ("All" link 17px wide in EN at 375), with the Developer.

## Real USK timetable (11 classes) — 2026-11-26, ~16:30 WIB

**Tests:** `tests/api.auth.test.ts` now uses `SEEDED_OTHER = "fftt1001-23-lecture"` (rep-demo
doesn't edit it) and `stik1005-14-lecture` instead of `sisdig-a` (rep-demo edits STIK1005 and
STIK1009). Seed confirmed via `GET /api/classes`: 11 classes, editors as expected. `npm test`:
**96 passed, 1 skipped (C-06)**.

**Live check** (`localhost:3000`, rep@demo, enrolled in all 11 classes like student@demo).
v3 Today has no "Tomorrow" tab, so Friday and Saturday were viewed by shifting the page's
`Date` (page-only override, then waiting for Today's 60 s clock tick); real date restored after.

| Check | Result | Evidence |
|---|---|---|
| Thu (real day), 360 | PASS | "2 classes · 1 cancelled · 1 moved"; STIK1001 08:00–09:40 room "F01 - 305" highlighted over struck "A25 - 201"; gap "Free 09:40–16:35 (6h 55m)"; MKWU1002 16:35 cancelled with the rep's note. |
| Fri 11:00 overlap (STIK1005 10:45–12:25 + STIK1007 lab 10:45–11:35), 360 | PASS | Both rows at 10:45; lab "Now" and in the now band; STIK1005 cancelled (seeded update), struck, "Lecturer absent" + note, not marked Now. |
| Sat 08:30 overlap (STIK1009 08:00–09:40 + STIK1011 lab 08:00–08:50), 360 and 1280 | PASS (see D6-4) | Both rows "Now"; gap "Free 09:40–14:00 (4h 20m)"; exactly one "Next" (MKWU1006 14:00, "Sec D29"). Due soon shows the Sat 16:00 lab report. |
| Long room "Laboratorium Fakultas Teknik 7" / "… 5" | PASS | Now band: wraps to 2 lines at 360 and 1280, no clipping; row meta: one line at 360, no horizontal scroll. |
| "Kelas CE03"-style sections | PASS | Class picker: "Kelas CE03 · Kuliah · Sel 08:00", "Kelas D29 · Kuliah · Sab 14:00", rows 52px; Today shows "Sec D29"/"Kelas D29". |
| 1280 | PASS | Rail · timetable · side pane ("Changes this week": cancelled MKWU1002, moved STIK1001, cancelled STIK1005; "Due soon"); no horizontal scroll. |

**D6-4 (Low, design question):** with two classes running at once (Sat 08:00 pair), the now band
shows only one of them (the lab that ends first, 08:50); the other is "Now" in its row only. A
student normally attends one of the pair, so this is probably fine; Designer to decide whether the
band should prefer the lecture, show both, or stay as is.

Notes: the language in the shared pane was switched to ID by another session during the check
(not a bug). Tuesday (CE03 in Today) and the other weekdays weren't rendered live; same code path.
