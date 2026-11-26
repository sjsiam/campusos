# QA report: Day 4 pass (Assignments, Updates, Report change, Reminders)

Date: 2026-11-26, 00:20–00:45 WIB (Thursday). Lead's dev server `http://127.0.0.1:3000`,
seed = v3 sample day. Built-in browser at 375×812 and 360×780, EN and ID, as `student@demo`
and `rep@demo` (editor of `sisdig-a` / TKE-201 only).

**Verdict: PASS. No blocking bug.** One new API finding (QA-07, low), three low UI nits.
`npm test`: **93 passed, 1 expected fail (QA-07), 1 skipped (C-06)**.

## API tests (`tests/api.auth.test.ts`)

| Change | Result |
|---|---|
| V-04 rewritten for v3: `reschedule` → 400 (with or without `newTime`), `newTime` field → 400, PATCH to `reschedule` → 400; `room_change` with room → 201, blank room → 400; `absent` → 201 | PASS |
| V-05 dropped the `newTime` cases; added `2026-1-5` (bad format) | PASS |
| New: `GET /api/classes` `studentCount` is a bare number. Enrolling one user raises it by 1; rows carry only class fields + `studentCount`; no student uid in the body | PASS |
| New: 30 Feb → 400 | **FAIL → QA-07** (marked `it.fails`) |

### QA-07 (Low) Impossible calendar dates are accepted
```
POST /api/updates   Authorization: Bearer <rep-demo>
{"classId":"sisdig-a","kind":"absent","date":"2026-02-30","note":"qa-feb30"}
→ 201 {"date":"2026-02-30", …}      (expected 400; row deleted again)
```
Cause: `lib/validate.ts` checks `Date.parse("2026-02-30T00:00:00Z")`, and V8 rolls it over to
2 Mar instead of returning NaN. Fix: also check the parsed date formats back to the same string
(`new Date(...).toISOString().slice(0, 10) === d`). The UI only sends dates from a date picker or
known sessions, so this only matters for hand-made requests. Flip the test to `it` once fixed.

## Screens

### Assignments
| Check | Student | Rep |
|---|---|---|
| List groups Overdue / Today / This week / Later with countdown gutter ("Late 10 h", "23 h left", "2 d left") | PASS | PASS |
| "Add" in app bar | hidden ✓ | shown ✓ |
| `/assignments/new` by URL | "Only this class's reps, lab assistants and lecturer can add assignments." ✓ | form ✓ |
| Detail: course line, title, countdown, due "… WIB", instructions, link (`target=_blank rel=noopener noreferrer`), "Added by …" | PASS | PASS |
| "Delete assignment" | hidden ✓ | own class only ✓ (hidden on TKE-205, which rep doesn't edit) |
| New form: empty submit → "Enter a title." + "Choose a due date and time." | – | PASS |
| `javascript:alert(1)` link → "Links must start with http:// or https://.", focus to the field | – | PASS |
| "In 1 week" → read-back "Thu 3 Dec, 23:59 WIB"; `maxLength` title 100 / instructions 2000 = API | – | PASS |
| Post → detail with "Saved. Students in this class can see it now." | – | PASS |
| Delete → inline "Delete for all 4 students? This can't be undone." [Delete] [Keep]; Keep cancels; Delete removes and returns to list | – | PASS |

### Updates feed
| Check | Result |
|---|---|
| Newest first; unread items tinted `bg-2` with "· New"; nav badge "4 New" cleared after opening | PASS |
| Trust line under the title; student has no post action, rep has "Report change" | PASS |
| Rep's own items say "Demo Class Rep (you)" | PASS |
| Each item: kind, time, course, session + old → new room, note verbatim, poster + "verified poster" | PASS |

### Report change sheet (rep)
| Check | Result |
|---|---|
| Opens from the app bar on Today and Updates; editors only (student sees no button) | PASS |
| Class line, kind segmented (Cancelled / Room moved), sessions (today pre-selected, next, other date), note, "Send to 4 students" | PASS |
| No kind → "Choose what changed.", focus to the kind control; Room moved without room → "Enter the new room.", focus to input | PASS |
| Post "QA Ruang 9" → sheet closes, "Posted. Students are being notified.", Today row shows the new room highlighted at once, summary "2 moved", item on top of Updates with "(you)" | PASS (test update deleted afterwards) |

### Reminders
| Check | Result |
|---|---|
| Browser permission "denied": Today shows no notice; Account row "Blocked in browser settings" + how-to text | PASS |
| Simulated "default" (permission getter overridden in the page): Account row "Turn on" → tap → "On", no error shown, no crash; FCM token call fails without a VAPID key and is swallowed, per spec §10 | PASS |
| Today notice in "default" state | NOT VERIFIED: the simulation can't reach it, because Today stays mounted and reads the permission once. Re-check on a fresh profile or a phone. |
| Push delivery | Not testable (no VAPID key) |

### Language and layout
EN and ID: every label on Assignments, Updates, Report sheet and New assignment switches; no English left in
ID ("Lewat tenggat", "Kirim ke 4 mahasiswa", "pengirim terverifikasi", "Kelas A"). No horizontal
scroll at 360px on any of them.

## Low items (not blocking)

| ID | Item | Owner |
|---|---|---|
| L-4 | The rep's own new post shows "· New" in their own feed. Your own post shouldn't count as unread. | Developer |
| L-5 | Poster line says "verified poster" / "Added by Siti Rahma"; spec has the role ("Verified class rep", "Added by {by}, {role} · {at}"). The Account sheet now shows the role, so the data exists. | Developer |
| L-6 | Seed: the cancelled TKE-201 update for Sat 28 Nov says "Saya dinas ke Medan" (a lecturer's voice) but is posted by Demo Class Rep. Cosmetic, demo data only. | Developer |
| L-3 | Fixed: the Account sheet shows "class rep TKE-201". | – |

## Testing notes
- **Reseeding signs everyone out.** `scripts/seed.ts:78` deletes and re-imports the demo users, so
  any open demo session dies (the stored session vanished at ~00:25). Not an app bug; say so before
  reseeding during a demo rehearsal.
- The Developer was editing `app/layout.tsx` fonts during the run. The console shows their transient
  build errors ("Font loader values must be explicitly written literals"); a reload fixed it. Not filed.
- One run of `npm test` hit transient 500s (PGlite collision while the seed ran); the re-run was clean.
- Test data created by me (one update, one assignment, one 30-Feb update) was deleted again. The
  browser is left signed in as `rep@demo` with language ID.

## Re-check after fixes (2026-11-26, ~00:35 WIB)

Migration 003 (`assignments.created_at`) applied locally by the Developer. `npm test`:
**95 passed, 1 skipped (C-06)**, no expected-fails left. Lint (with `no-explicit-any` on) and
`tsc` clean for `tests/`.

| ID | Result | Evidence |
|---|---|---|
| QA-07 | PASS | V-05 "30 Feb → 400" is a normal test now and passes. |
| L-5 API | PASS | Privacy test allows exactly `createdByRole`, checks it is one of `student / classrep / labassistant / lecturer / admin` on every row (`classrep` for rep-demo), and still rejects any other `fcm`/`token`/`lang`/`classIds`/`email`/`uid`/`role` key. |
| L-4 | PASS | As rep@demo, posted a cancellation from "Lapor perubahan": own item has no tint and no "Baru", nav badge stays empty on Today and Updates. (Test update deleted.) |
| L-5 UI | PASS | Feed: "Demo Class Rep (kamu) · ketua kelas terverifikasi", "Fajar Maulana · asisten lab terverifikasi". Detail: "Ditambahkan oleh Siti Rahma, ketua kelas · Kam 26 Nov". |
| L-1 | PASS | 375px, rep@demo: no visible link/button/input under 44×44 on Today, Assignments, assignment detail, Updates, the Account sheet. Report sheet: only the 20px radio dots (inside 52px clickable rows) and the note's text label, both fine. |
| L-6 | Not re-checked | Seed text; no QA-visible behaviour. |

Still open: Today reminders notice in "default" state (needs a fresh profile or phone), push delivery (no VAPID key).
