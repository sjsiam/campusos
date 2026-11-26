# QA report: "Fill from KRS" (commit 965e087)

Date: 2026-11-26 (evening WIB). Checklist: `docs/qa/krs-fill-checklist.md`.
Local: `http://127.0.0.1:3000` (emulator, 11 real classes), a fresh auto-generated account, 360 and
1280px, EN and ID. Live: https://campusos-sudo.vercel.app signed out (the feature sits behind sign-in).

**Verdict: PASS. Privacy holds: the pasted text is never sent or stored.** One parser bug (KRS-1,
Medium) and one documented limitation (KRS-2, Low).
`npm test`: **129 passed, 2 expected fail (KRS-1), 1 skipped (C-06)**; lint and types clean.

## Privacy (the key check)

Method: before pasting, a recorder in the page wrapped `fetch`, `XMLHttpRequest`, `sendBeacon` and
`WebSocket.send` (URL + body), plus the Resource Timing list. Pasted K1 (fake NIM `2408107010999`,
name `MAHASISWA UJI COBA`) via a real `paste` event + input, read it, saved, finished onboarding,
then reopened Change classes and pasted more. Searched everything for the NIM, the name,
`KARTU RENCANA`, `STIK9999` and `Total SKS`.

| ID | Result | Evidence |
|---|---|---|
| KRS-P1 | PASS | **0 requests** while pasting, typing and tapping Read. Later in Change classes (empty, random, hostile, 1.1 MB pastes) only plain `GET /api/classes` etc., all with empty bodies. |
| KRS-P2 | PASS | None of the needles in any request URL or body (fetch/XHR/beacon/WebSocket), nor in any Resource Timing URL, through to Today loading. |
| KRS-P3 | PASS | `PUT /api/me` body is exactly `{"name":"Raccoon Olive","lang":"en","classIds":["stik1005-14-lecture","stik1007-11-lab","fftt1007-ce03-lecture","mkwu1006-d29-lecture"]}`. |
| KRS-P4 | PASS | After reading, after saving, and after reload: no needle in `localStorage` (only `lang`, `updatesSeenAt`), `sessionStorage` (empty), IndexedDB (`firebaseLocalStorageDb`, `firebase-heartbeat-database`, all stores read), cookies or Cache Storage. |
| KRS-P5 | PASS | URL and `history.state` never contain the text. |
| KRS-P6 | PASS | The sheet unmounts on Read/close: the field is empty on every reopen (after Read, after ✕ with text typed, after a no-match). After reading, the NIM/name are gone from the DOM; only the unknown code "STIK9999" stays, in the result message, as intended. |
| KRS-P7 | PASS | `autocomplete="off"`, `autocorrect="off"`, `spellcheck="false"` on the field. |
| KRS-P8 | PASS | No console output from the paste. |
| KRS-P9 | Not checked | Server logs: nothing reaches the server to log (P1/P2), so there's nothing to look for. |
| KRS-P10 | PASS | Copy under the field: "Read on this phone only. The text isn't sent or saved." / "Dibaca di HP ini saja. Teksnya tidak dikirim atau disimpan." |
| Live | PASS | Deployed bundles contain the KRS strings and the parser (client side). No server route: `POST /api/krs`, `/api/krs/parse`, `/api/me/krs` → 404. |

## Matching and UI

| ID | Result | Evidence |
|---|---|---|
| KRS-01 | PASS | K1 in onboarding step 2: STIK1005·14, STIK1007·11 (lab), FFTT1007·CE03, MKWU1006·D29 ticked; "Continue · 4 classes"; sheet closes. |
| KRS-02 | PASS | "Found 4 of your classes. Check them, then continue." + "Not in CampusOS yet: STIK9999", in a `role="status"` region. |
| KRS-03 | PASS (unit) | Lowercase, tabs, blank lines, `Kelas: 14`, `(Kelas : D29)`, CRLF → same 4. `STIK 1005` with a space isn't read (KRS-2). |
| KRS-04 | PASS / note | `Kelas : 99` on a known code → not ticked, listed "STIK1005 · 99". Without the word "Kelas", a course with one class in CampusOS is ticked by code even if the row says 99 (documented fallback). |
| KRS-05 | PASS | Random text → `role="alert"` "No course codes found. Copy the whole KRS page and try again.", sheet stays open; Read disabled while empty. |
| KRS-06 | PASS (unit) | Duplicates collapse. |
| KRS-07 | PASS: **adds** | A manual tick (STIK1013) survives a paste; the paste only adds. Ticks can still be changed afterwards. |
| KRS-08 | PASS | Change classes: same sheet; button "Save" / "Simpan". |
| KRS-09 | PASS | A paste clears the search box so all ticked rows are visible. |
| KRS-10 | PASS | 1.1 MB paste in the UI: read + render ≈ 0.2 s; unit: 1 MB in < 1 s. |
| KRS-11 | PASS | `<img src=x onerror=alert(1)>STIK1003 Kelas 11 '; DROP TABLE…`: no alert, no `<img>` added, STIK1003 ticked. |
| KRS-12 | PASS | EN and ID strings for button, title, label, privacy line, Read/Baca, found/unknown/none. |
| KRS-13 | PASS | 360: sheet full width, no horizontal scroll, controls ≥ 44px ("Isi dari KRS" 48px). 1280: sheet 480px centred. |
| KRS-14 | PASS | Field has a visible `<label>` and `aria-describedby` to the privacy line; result in `role="status"`, error in `role="alert"`; Tab order Close → field → Read. |
| KRS-15 | Not run | Real phones (long-press paste). Field is 16px, so iOS won't zoom. |

### KRS-1 (Medium) A repeated table header makes the row above it read "Kelas SKS"
Multi-page KRS printouts repeat the header `No Kode Mata Kuliah Kelas SKS`. The parser takes
everything up to the next code as the current row, so the header's "Kelas SKS" reads as section "SKS".
- Known course, row without a section cell, header after it:
  `1 MKWU1002 Kewarganegaraan\nNo Kode Mata Kuliah Kelas SKS\n2 STIK1013 Biologi 13 3`
  → expected MKWU1002 ticked; **actual: not ticked, shown as "Not in CampusOS yet: MKWU1002 · SKS"**.
  Without the header the same text ticks it.
- Unknown course before a header: shows "STIK9999 · SKS" instead of "STIK9999".
- Not affected: the SIAKAD jadwal layout with `(Kelas : x)` on each row.
- Suggested fix (Developer): only accept a "Kelas" value that contains a digit (every real section
  does: 23, CE03, D29, 14; "SKS"/"NO" don't), or skip header-looking lines. Tests ready:
  `tests/krs.parse.test.ts` "KRS-1 repeated header" (`it.fails`): flip to `it` when fixed.

### KRS-2 (Low, by design) A code written with a space isn't read
`STIK 1005` (space inside the code) is neither ticked nor listed as unknown, so it's silently skipped.
SIAKAD writes codes without spaces, so this only hits hand-typed text. Optional: allow `\s?` between
letters and digits.

## Tests added
`tests/krs.parse.test.ts` (14 tests): K1 normal KRS against the 11 real classes (and the NIM/name
never appear in the result); K2 messy formats; K3 wrong section (labelled vs unlabelled); K4 random
text, empty, NIM/NIP digit runs; K5 HTML/SQL; K6 1 MB under 1 s; KRS-1 repeated header (2 expected fails, 1 passing control).
The Developer's `lib/krs.test.ts` (7 tests) already covers the SIAKAD layouts, lecture+lab pairs and duplicates.

## Notes
- The fresh test account "Raccoon Olive" was created in the emulator for this run (local only).
- Production: no sign-in, nothing saved. The three 404 probes were POSTs with a dummy `{"text":"QA"}` body to routes that don't exist.
