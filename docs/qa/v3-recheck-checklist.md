# QA checklist: CO-35 v3 restyle + QA-02 / QA-05 / QA-06 re-check

Run when the Lead forwards the Developer's CO-35 report. Sources: `docs/design/screens.md` "v3"
section (wins over the older wireframes), `docs/design/system.md` v3, board `docs/design/board-v3/index.html`.
Viewports: 375×812 (main), 360 and 430 wide, plus 768 and 1280 for a layout sanity check.
Both languages; light and dark (`prefers-color-scheme`). Mark PASS / FAIL; a FAIL gets steps,
expected, actual, screenshot.

## A. Bug re-checks

| ID | Check | How |
|---|---|---|
| QA-02 | Sign out exists | Avatar in Today's app bar → Account sheet shows name, email, role, "Keluar" (danger outline). Tap → `/login`; `/today` then redirects to `/login`; Back button doesn't show data. Same from Assignments and Updates. |
| QA-05 | Reopened class picker says "Simpan" | Account → "Ubah kelas" → step 2 alone, button "Simpan" / "Save" (not "Lanjut · n kelas"); saving returns to the previous page with the new classes. First-run onboarding still says "Lanjut · {n} kelas". |
| QA-06 | Assignment limits match spec | Update `tests/api.auth.test.ts` V-06 to the Developer's final limits (spec: title 100, instructions 2000; links: v3 form has **one** link field, so confirm max 1 or 5 with Developer/Designer), flip `it.fails` → `it`, run `npm test`. Also check the form's `maxLength` matches the API. |
| QA-01 | Exactly one "Berikutnya" | v3 Today: one row labelled Next, also while a class is "Now"; none on a cancelled row. (Still open from Day 2.) |
| QA-03 | Reminders copy | Step 3 shows the real notification text; no "15 minutes" anywhere (`grep -n "15" messages/*.json`). |
| QA-04 | `<html lang>` | Set ID, reload any page: `document.documentElement.lang === "id"`. |

## B. Global (system.md v3)

- [ ] Tokens: no old colour names left (`grep -rnE "\b(bg|text|border)-(background|foreground|surface|warn|sun|ok)\b" app components`).
- [ ] Fonts: body Source Sans 3; times, durations, rooms, codes, countdowns in Barlow Semi Condensed with `tabular-nums` (check computed `font-family`).
- [ ] Teal app bar `bg-head`; yellow `mark` only on a changed value; red only for cancelled / overdue / sign out.
- [ ] No all-caps labels, no exclamation marks, times "08:00" in both languages.
- [ ] Every state is a word as well as a colour (Batal, Pindah ruang, Berikutnya, Sekarang).
- [ ] Touch targets ≥ 44px; body ≥ 16px; inputs ≥ 16px (no iOS zoom).
- [ ] Keyboard focus ring visible (`2px solid primary`).
- [ ] Dark mode: app bar `#0B2E2E`, text readable, no white flashes.
- [ ] Manifest/viewport `theme_color` `#0E5A5B`.
- [ ] No horizontal scroll at 360px, ID language (ST-40).

## C. Login `/login`

- [ ] Top bar: wordmark + language switch. No illustration, no decorative cards (`login.demo*` gone).
- [ ] Bottom block: "Masuk ke CampusOS" / "Sign in to CampusOS", `login.body`, Google button (primary `min-h-[52px]`), `login.hint`, "Yang baru" link → `/changelog`.
- [ ] States still work: button spinner while signing in, error line `role="alert"`, closed popup silent.
- [ ] Signed-out `/today` → `/login`; no bottom nav; no scroll on 375×812.

## D. Onboarding `/onboarding`

- [ ] Teal app bar "Langkah n dari 3" with back on steps 2–3.
- [ ] Step 1: radio list rows `min-h-[52px]`, hairlines; choosing ID switches immediately.
- [ ] Step 2: sections listed under each course with meeting times; checkbox rows with hairlines; search, no-match line, Continue disabled at 0; sticky "Lanjut · {n} kelas"; last row not hidden behind it.
- [ ] Step 3: shows the real notification preview, "Aktifkan pengingat" / "Nanti saja". On iPhone Safari: Home Screen steps instead, step **never skipped** (Developer to confirm; can't test without iPhone).
- [ ] Profile saved at end of step 2; reload skips onboarding.

## E. Today `/today` (use the "one sample day" seed if the Developer adds it)

- [ ] App bar row 1: date title, language switch, avatar. Row 2: `today.summary` ("5 kelas · 1 batal · 1 pindah") and "Lapor perubahan" **only for reps** (check student-demo vs rep-demo).
- [ ] Now band only during a class: room in `font-fig 44px bold`, class name, meta, "sampai {time}", "Pindah dari {was} oleh {by}, {at}" when moved. The same class also appears as a tinted row.
- [ ] Timetable rows: start / end / duration in the gutter ("1j 40m"); past rows muted; one "Berikutnya".
- [ ] Gap rows for free time ≥ 30 min: "Kosong 12:00–13:30 (1j 30m)".
- [ ] Moved row: new room highlighted (`mark`), old room shown.
- [ ] Cancelled row: "Batal" + "Dosen berhalangan" or "Asisten berhalangan" (lab) **plus** the rep's note as written. Never hidden. (Settles the Day 2 note.)
- [ ] "Tenggat dekat": 2 deadline rows with countdown in the gutter + "Semua" link; hidden when none.
- [ ] Tomorrow view (if still present) and empty day: empty state copy.
- [ ] Loading skeleton / error + retry still present (ST-10, ST-12).
- [ ] Tablet 768: two panes; desktop 1280: rail + week grid + side panel (sanity check only, CO-35 scope per Developer).

## F. After the pass

- [ ] `npm test` green (API tests need the three servers, see `api-auth-report.md`).
- [ ] `npm run lint` and `npm run build` pass (Developer's report; re-run if cheap).
- [ ] Results to `docs/qa/v3-report.md`.
