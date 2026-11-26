# QA checklist: "Fill from KRS" (onboarding step 2 and Change classes)

Feature (as briefed by the Lead): the student pastes the text of their KRS (Kartu Rencana Studi)
into onboarding step 2 or Change classes; the app ticks matching classes **in the browser**, shows
how many were found and how many are unknown, and **nothing is sent or stored**. Only the ticked
`classIds` are saved, the normal way, when the student taps Continue / Save.

Run on `http://localhost:3000` (seeded with the 11 real classes) at 360px and 1280px, EN and ID,
with a fresh account (onboarding) and with an existing one (Change classes). Mark PASS / FAIL with
steps, expected, actual. Confirm with the Developer first: matching rule (code + section? code only?)
and whether a paste adds to existing ticks or replaces them.

## Test data (fake student; never use a real NIM)

**K1, normal KRS** (codes + sections of 4 seeded classes, one unknown course, a header with NIM and name):
```
KARTU RENCANA STUDI
NIM : 2408107010999    Nama : MAHASISWA UJI COBA
Semester Ganjil 2026/2027
No Kode      Mata Kuliah                      Kelas  SKS
1  STIK1005  Logika Digital                   14     3
2  STIK1007  Praktikum Logika Digital         11     1
3  FFTT1007  Matematika I                     CE03   3
4  MKWU1006  Pembinaan Karakter I             D29    1
5  STIK9999  Mata Kuliah Tidak Ada            01     2
Total SKS: 10
```
Expected: 4 found (stik1005-14-lecture, stik1007-11-lab, fftt1007-ce03-lecture, mkwu1006-d29-lecture), 1 unknown (STIK9999).

**K2, messy copy-paste**: same rows, lowercase codes (`stik1005`), tabs instead of spaces, extra blank lines, `Kelas: 14` style, a code with a space (`STIK 1005`), Windows line endings (`\r\n`). Expected per the matching rule the Developer documents.

**K3, wrong section**: `STIK1005 Logika Digital 99 3`: course exists, section doesn't.

**K4, nothing useful**: a random paragraph of Indonesian text; and an empty paste.

**K5, hostile**: `<img src=x onerror=alert(1)>STIK1005 14` and `'; DROP TABLE classes; --`.

**K6, huge**: K1 repeated 2,000 times (~1 MB).

## Matching and UI

| ID | Check | Expected |
|---|---|---|
| KRS-01 | Paste K1 in onboarding step 2 | The 4 matching rows get ticked; "4 found · 1 unknown" (EN) / ID equivalent; Continue shows "Continue · 4 classes" |
| KRS-02 | Unknown list | STIK9999 is named (or counted) so the student knows what to add by hand; no crash |
| KRS-03 | K2 messy formats | Same 4 matched if the rule allows; anything not matched is counted unknown, never silently dropped |
| KRS-04 | K3 wrong section | Not ticked (or ticked only if the rule is code-only, then the section choice is visible); counted as unknown/ambiguous |
| KRS-05 | K4 random text / empty | "0 found" (or no message for empty); no ticks change; no error |
| KRS-06 | Paste twice (K1 then K1) | No duplicates; counts stay 4 / 1 |
| KRS-07 | Existing ticks, then paste | Behaviour matches the Developer's choice (add vs replace) and is clear in the UI; manual ticks can still be changed after a paste |
| KRS-08 | Change classes (Account → Ubah kelas) | Same results; "Simpan" saves; Today shows exactly the ticked classes |
| KRS-09 | Search box + paste | Paste works while a search filter is active; ticked rows outside the filter are still counted |
| KRS-10 | K6 huge paste | UI stays responsive (no freeze > ~1 s), result correct, no crash |
| KRS-11 | K5 hostile | Shown as plain text only; no alert, no HTML injected; no request made |
| KRS-12 | EN / ID | All new labels, placeholder, counts and button in both languages; no raw keys |
| KRS-13 | 360px and 1280px | Paste box and counts fit, no horizontal scroll; controls ≥ 44px; on desktop the column stays centred |
| KRS-14 | Accessibility | Paste field has a visible label; the found/unknown result is announced (`role="status"` / `aria-live`); keyboard-only works (Tab to field, paste, Tab to the button) |
| KRS-15 | iPhone Safari / Android Chrome | Long-press paste works; keyboard doesn't zoom the page (input ≥ 16px) |

## Privacy (nothing sent, nothing stored)

Method: before pasting, open the browser's Network log (built-in browser: `read_network_requests`;
Chrome DevTools: Network, "Preserve log") and note the request count; after pasting and before
tapping Continue / Save, compare. Then search every request URL, header and body for the NIM.

| ID | Check | Expected |
|---|---|---|
| KRS-P1 | Requests while pasting and matching | **None** caused by the paste (no `/api/*`, no analytics, no third party). Typing in the search box may not send either |
| KRS-P2 | Search all requests (incl. after Continue / Save) for `2408107010999`, `MAHASISWA UJI COBA`, `KARTU RENCANA` | Not found anywhere: not in URLs, query strings, headers, or bodies |
| KRS-P3 | The save request (`PUT /api/me`) body | Only `classIds` (plus `name`/`lang` as today); no KRS text, no NIM |
| KRS-P4 | `localStorage`, `sessionStorage`, IndexedDB, cookies, Cache Storage | No NIM, name or KRS text (search all values for the NIM digits) after paste, after Continue, and after reload |
| KRS-P5 | URL / history | The page URL and history entries never contain the pasted text |
| KRS-P6 | Paste field after saving / leaving | Cleared or gone; Back/forward doesn't restore it; reload doesn't restore it (no draft saving) |
| KRS-P7 | Browser autofill | Field has `autocomplete="off"` (so the browser doesn't remember the NIM as a form value) |
| KRS-P8 | Console | No `console.log` of the pasted text |
| KRS-P9 | Server logs (ask the Lead to check Vercel/dev server output once) | No KRS text or NIM appears |
| KRS-P10 | Copy text | The UI says the text stays on the device (EN/ID), so students trust it |

## Regression
- [ ] Onboarding without using the paste still works (search, tick, Continue disabled at 0).
- [ ] `npm test` green; `npm run lint` clean.
- [ ] If the Developer adds a pure parser in `lib/`, QA adds unit tests in `tests/` for K1–K6 (no DOM needed).
