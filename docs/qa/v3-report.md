# QA report: CO-35 v3 restyle + QA-01..06 re-check

Date: 2026-11-26, 00:10–00:40 WIB (Thursday). Checklist: `docs/qa/v3-recheck-checklist.md`.
Environment: Lead's dev server `http://127.0.0.1:3000` (Auth emulator + PGlite), built-in browser,
375×812 (plus 360×780), light and dark, EN and ID.

**Verdict: CO-35 PASS. QA-01..06 all fixed.** Open: 3 low items (L-1..L-3) and items blocked on
tickets that aren't built yet. `npm test`: 92 passed, 1 skipped (C-06, no `CRON_SECRET`).

## Bug re-checks

| ID | Result | Evidence |
|---|---|---|
| QA-01 | PASS | Temp classes on Thu: now 00:00–01:00, cancelled lab 01:05, class 01:10, class 04:00. Exactly one "Berikutnya", on 01:10 (skips the cancelled 01:05), shown while another class is "Sekarang". |
| QA-02 | PASS | Avatar → Account sheet → "Keluar" → `/login`; browser Back stays on `/login`. |
| QA-03 | PASS | Step 3 text: "30 menit sebelum kelas, sebelum tenggat, dan saat kelas batal atau pindah", plus a preview of the real notification. |
| QA-04 | PASS | ID saved → reload: `<html lang="id">`; switch to EN → `lang="en"`. |
| QA-05 | PASS | Account → "Ubah kelas" opens step 2 alone, title "Ubah kelas", picks ticked, button "Simpan"; saving returns to Today. First run still says "Lanjut · n kelas". |
| QA-06 | PASS | `tests/api.auth.test.ts` V-06 is a normal test now: title 100 / instructions 2000 / 5 links → 201; 101 / 2001 / 6 → 400; PATCH title 101 → 400. |

## Lead's extra items

- **V-06 flipped:** done (see QA-06).
- **`any` removed from tests:** done. `npx eslint tests/ --rule '{"@typescript-eslint/no-explicit-any":"error"}'` is clean
  and `tsc --noEmit` reports nothing in `tests/`. **The Developer can delete the `tests/**` override in `eslint.config.mjs`.**
- **`createdByName`:** PASS. `lib/items.ts` joins only `users.name`; a new test checks it equals the
  poster's display name and that list rows carry no `fcm*`, `token`, `lang`, `classIds`, `email`, `uid` or `role` keys.
  Note: the name is whatever the user set via `PUT /api/me`, so it is self-chosen, not verified. The
  trust signal must stay "is in `editors`", never the name. Showing the role next to it (spec
  `assign.addedBy` "{by}, {role}") should come from the server, not from the profile.

## CO-35 acceptance criteria (BOARD.md)

| Criterion | Result |
|---|---|
| Login, Onboarding, Today match the v3 board (tokens, fonts, layout) | PASS. See screen checks below. |
| Colours from tokens, no hard-coded hex in components | PASS: no hex in `app/` or `components/` except `manifest.ts`/`layout.tsx` theme colour (per spec); no old colour names |
| No behaviour change: Day 2 CO-09/10/11 steps still pass | PASS: routing, sign-in, onboarding 1–3, search/no-match, Continue disabled at 0, reload keeps profile, change classes, Today data |
| 375px: no horizontal scroll; 44px targets | PASS on scroll (375 and 360). Targets: see L-1 |

## Screen checks (v3)

**Global:** Source Sans 3 body; times in Barlow Semi Condensed + `tabular-nums`; app bar `rgb(14,90,91)`
= `#0E5A5B`; `theme-color` `#0E5A5B`; no uppercase text; focus ring kept; dark mode OK (bg `#0F1716`).

**Login:** PASS. Wordmark + language switch top, title/body/Google button (52px)/hint at the bottom,
no illustration, no scroll, no bottom nav. Missing "Yang baru" link: expected, `/changelog` is CO-39.

**Onboarding:** PASS. Teal app bar "Langkah n dari 3" with back; radio rows 52px; class rows 52px with
hairlines, meeting times per section ("Kelas A · Kuliah · Sen 08:00 · Rab 08:00"); sticky
"Lanjut · n kelas", disabled at 0; no-match line; step 3 notification preview. In this browser
notifications are "denied", so only "Nanti saja" shows (§10 row 6 behaviour).

**Today:** PASS. App bar date + summary ("4 kelas · 1 batal · 3 pindah"); no "Lapor perubahan" for a
student; now band with room in big figures, "sampai 01:00", "Pindah dari R-101 oleh Demo Class Rep,
00:15"; current row tinted; start / end / duration gutter; gap row "Kosong 01:50–04:00 (2j 10m)";
moved rows show the new room highlighted and the old one struck; cancelled lab row "Asisten
berhalangan" + the rep's note verbatim; "Tenggat dekat" rows with countdown and "Semua"; section
hidden when empty. EN: "Lab assistant absent", "Free … (2h 10m)", "Sec A" translated in ID as "Kelas A".

## Low items (not blocking)

| ID | Item | Owner |
|---|---|---|
| L-1 | App bar avatar is 40×40 and the language switch 44×40: under the 44px rule (system.md §6.1, BOARD CO-35). But system.md's own app-bar spec says "avatar (40px circle)" and the action button `min-h-10`. The spec contradicts itself; Designer to pick one. WCAG 2.2 AA (24px) is met. | Designer |
| L-2 | At 360px the meta line wraps as "… · Sec" / "A". Use a non-breaking space between "Sec"/"Kelas" and the letter. | Developer |
| L-3 | Account sheet shows name and email but no role (v3 table: "name, email, role"). | Developer |

## Not checked / blocked on other tickets

- "Lapor perubahan" app-bar action for reps: not built (CO-23). rep-demo sees no button yet.
- "Yang baru" → `/changelog` on Login: CO-39.
- iPhone Home Screen variant of step 3, tablet/desktop layouts (CO-37): not in this pass.
- Loading and error states: same code paths as Day 2, not re-triggered.
- The API still accepts `kind: "reschedule"`, which v3 removed. Harmless while no UI sends it; drop it
  when convenient (then V-04/V-05 tests change too).
- Seed data: a class "TKE-205 Struktur Data (test)" with section A also exists, so step 2 shows two
  "Kelas A" rows under TKE-205. Probably someone's test row; remove before the demo.

## Testing notes
- The Developer saved files during the run (00:13–00:14). Next's hot reload re-mounted onboarding
  while on step 3, which then showed the "Ubah kelas" edit mode. Re-ran with a fresh account after
  the edits: step 3 stays and "Nanti saja" → Today. Dev-only, not a bug.
- Temp classes `qav3-main` / `qav3-lab` were created for the Today check and deleted afterwards.
  The browser is left signed in as an emulator auto-generated account.
