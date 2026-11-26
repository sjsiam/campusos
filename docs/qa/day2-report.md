# QA report: Day 2 screens (CO-09 Login, CO-10 Onboarding, CO-11 Today)

Date: 2026-11-25, ~19:30 WIB (Wednesday). Tester: QA session.
Environment: the Lead's running emulators (seeded) + `next dev`, opened at `http://127.0.0.1:3000`
in the Claude desktop app's built-in browser (Chromium), viewport emulated at 375×812.
Sources: `docs/team/BOARD.md` acceptance criteria, `docs/design/screens.md` §1–3 and §13, plus a code read.

**Verdict: CO-09 FAIL (sign-out missing, known), CO-10 PASS with 2 minor copy/label issues,
CO-11 FAIL (no "next" marker).** Plus 1 a11y bug across all screens (`<html lang>`).

## Bugs (each needs a Developer fix)

| ID | Sev | Ticket | Bug |
|---|---|---|---|
| QA-01 | High | CO-11 | No "Next" marker on Today |
| QA-02 | Medium | CO-09 | No sign-out control (known gap, but it is an acceptance criterion) |
| QA-03 | Medium | CO-10 | Reminders text says 15 minutes and omits deadlines; spec and BOARD say 30 min + deadlines |
| QA-04 | Low | all | `<html lang>` stays `en` after reload when the UI is Indonesian |
| QA-05 | Low | CO-10 | "Change classes" button says "Continue (n selected)", spec says `common.save` |

### QA-01 Today has no "Next" marker (CO-11 criterion 3, spec §3)
- Steps: sign in as `student@demo.campusos` before 08:00 WIB on a Wednesday (or any time before
  a class that day). Open `/today`.
- Expected: the first not-cancelled class that starts after now is labelled "Next" / "Berikutnya";
  only one card; also shown while another class is "Now".
- Actual: no card is ever labelled "Next". `lib/today.ts` `Row.state` only has
  `"past" | "now" | "upcoming"`, and `components/ClassCard.tsx` only renders `today.now`.
  The key `today.next` is unused. (Found by code read; at test time the only class today was past.)

### QA-02 No sign-out control (CO-09 criterion 3, spec §12)
- Steps: sign in as any user; look on Today, Assignments, Updates.
- Expected: a sign-out control that returns to `/login`.
- Actual: none. Listed by the Lead as a known gap; CO-09 cannot be Done without it.

### QA-03 Reminders step text is wrong (CO-10, spec §2 step 3)
- Steps: new account → onboarding → step 2 → Continue → step 3.
- Expected (spec `onb.remindBody`, BOARD CO-18/CO-20): "We'll remind you 30 minutes before class,
  before deadlines, and when a class is cancelled or moved." / "Kami akan mengingatkan 30 menit
  sebelum kelas, sebelum tenggat, dan saat kelas batal atau pindah."
- Actual: "We'll remind you 15 minutes before class and when a class is cancelled or moved." and
  "…15 menit sebelum kelas…" (`messages/en.json:38`, `messages/id.json:38`). Promises the wrong time.

### QA-04 `<html lang>` not set from the saved language on load
- Steps: on `/login`, tap "Bahasa Indonesia"; reload.
- Expected: `document.documentElement.lang === "id"` (screen readers pick Indonesian voice).
- Actual: UI is Indonesian but `lang="en"`. `setLang` sets it only on toggle; nothing sets it on
  load from `localStorage` (`lib/i18n.tsx`, `app/layout.tsx`).

### QA-05 Edit-classes button label (spec §2 step 2, last bullet)
- Steps: Today → "Change classes".
- Expected: button label `common.save` ("Save" / "Simpan").
- Actual: "Continue (2 selected)" / "Lanjut (2 dipilih)". Saving works and returns to Today.

## Developer test steps

| # | Step | Result |
|---|---|---|
| 1 | Signed out, `/today`, `/assignments`, `/updates` → `/login` | PASS (all three) |
| 1 | Login: no bottom nav, no scroll (scrollHeight 812 = viewport) | PASS |
| 1 | Language toggle switches login to Indonesian and back | PASS |
| 2 | "Continue with Google" opens emulator picker; student@ lands on `/today` | PASS. The built-in browser blocks popups, so this ran the `auth/popup-blocked` → redirect fallback path, which also works. |
| 2 | Closing the popup shows no error | NOT RUN (no popup in this browser). Code: `popup-closed-by-user` and `cancelled-popup-request` are ignored. Re-check in Chrome. |
| 3 | Add new account → auto-generate → `/onboarding` "Step 1 of 3" | PASS |
| 3 | Choosing Bahasa Indonesia switches immediately | PASS |
| 3 | Step 2: Continue disabled at 0 classes | PASS |
| 3 | Search `zzz` → no-match line | PASS ("Tidak ada kelas yang cocok dengan "zzz".") |
| 3 | `tke-20` filters (case-insensitive); count updates | PASS (3 courses, ADV hidden; "Lanjut (2 dipilih)") |
| 3 | Step 3 "Not now" → `/today` with only picked classes | PASS |
| 3 | Reload keeps profile | PASS; `users/{uid}` has `name`, `lang: "id"`, `classIds`; no `fcmTokens` field written |
| 3 | "Change classes" reopens step 2 with picks ticked; saving returns to Today | PASS (label: QA-05) |
| 4 | Room change: "→ ROOM MOVED", old room struck through | PASS ("Ruang 301" line-through, "Ruang 305") |
| 4 | Tomorrow tab shows a CANCELLED class | PASS (TKE-205, `bg-danger-soft`, name struck) |
| 4 | Due soon: relative labels | PASS ("DUE IN 6H", "2 DAYS"; ID "6 JAM LAGI", "2 HARI") |
| 4 | Times in WIB | PASS (machine is WIB; WIB-on-other-zone is covered by `lib/today.test.ts`) |

## Acceptance criteria (BOARD.md)

### CO-09 Google sign-in + auth guard: FAIL
| Criterion | Result |
|---|---|
| Signed-out `/today`, `/assignments`, `/updates` → login | PASS |
| Continue with Google → onboarding (first time) or `/today` (returning) | PASS |
| Sign-out control returns to login | FAIL (QA-02) |
| No Firebase keys/secrets in committed files | PASS for the working tree: no key in tracked files; `.env.example` present. Nothing is committed yet, so re-check at first commit. |

### CO-10 Onboarding: PASS (minor issues QA-03, QA-05)
| Criterion | Result |
|---|---|
| All seeded classes grouped by course with code, name, section, type; multi-select | PASS |
| Language choice switches UI immediately | PASS |
| Finishing writes `users/{uid}` with name, lang, classIds; reopening skips onboarding | PASS |
| Change classes and language later | PASS for classes (Today → "Change classes"); language via the header toggle. The toggle does not save `profile.lang`; only onboarding does. That matters for push texts later (spec §10 step 3), not for Day 2. |

### CO-11 Today timeline: FAIL
| Criterion | Result |
|---|---|
| Only user's classes on today's WIB weekday, sorted by start | PASS (after picking only ADV (Fri), Wed and Thu were empty) |
| Each item: start–end, course name, type, room | PASS |
| In-progress class "now", next class "next" | FAIL (QA-01). "Now" is implemented (`ring-2`, label), past = `opacity-60` confirmed. |
| Empty day shows the spec's empty state | PASS ("Tidak ada kelas hari ini." / "…besok." + "Selamat menikmati waktu luang.") |

## Cross-cutting checks
| Check | Result |
|---|---|
| 375px: no horizontal scroll on Login, Onboarding, Today | PASS |
| Onboarding step 2: last row not under sticky button | PASS |
| Bottom nav hidden on `/login`, `/onboarding`; shown on Today | PASS |
| EN/ID keys: `messages/id.json` has every `en.json` key, no extras | PASS (only `appName` identical, as intended) |
| No English left in ID mode | PASS except "Sec" (known gap) |
| Keyboard focus visible | PASS (Tab to header toggle: `:focus-visible`, 2px solid outline) |
| 44px touch targets | PASS: no visible `a`/`button`/`input`/`label` under 44px on Today |
| `<html lang>` matches UI | FAIL (QA-04) |

## State catalogue (screens.md §13)
| ID | State | Result |
|---|---|---|
| ST-01 | Auth gate loading spinner, no login flash | PASS by code (`SessionGate` shows `FullScreenSpinner` until auth + profile resolve); no flash seen |
| ST-02 | Login loading: button disabled + spinner | PASS by code (`disabled`, `aria-busy`, Spinner); too fast to observe |
| ST-03 | Login error `role="alert"`; closed popup silent | PASS by code; not triggered live |
| ST-04 | Onboarding classes loading: skeletons | PASS by code (3 skeletons, `h-28`) |
| ST-05 | No classes seeded: `onb.noClasses`, no button | PASS by code; not run (would need emptying the shared emulator) |
| ST-06 | No search match | PASS (live) |
| ST-07 | Load error + retry | PASS by code; not triggered |
| ST-08 | Saving spinner / save error line | PASS by code |
| ST-09 | Reminders step variants | PARTIAL: desktop shows soft prompt (live); iOS install variant code present, not run on iPhone (known) |
| ST-10 | Today loading: date line + 3 skeletons | PASS by code |
| ST-11 | Today empty day; Due soon still shown | PASS (live, both tabs) |
| ST-12 | Today error + retry; cached → offline banner | PASS by code for error + retry; not triggered (stopping emulators not allowed) |
| ST-13 | No due-soon items → section hidden | PASS (live) |
| ST-14 | Changed class badge + struck room; cancelled `bg-danger-soft`, not hidden | PASS (live) |

Notes (not bugs):
- A cancelled card shows the poster's note instead of "Lecturer absent" when a note exists
  (`ClassCard.tsx`). Spec wireframe shows "Lecturer absent". Designer to confirm which is wanted.
- Rules tests: `npm test` passed 21/21 (18 rules + 3 `lib/today`). The rules tests now use project
  id `demo-campusos-rules` so `clearFirestore()` cannot wipe the seeded `demo-campusos` data, and
  they find the emulator at `127.0.0.1:8080` when `FIRESTORE_EMULATOR_HOST` is unset.
- The test run created one emulator account ("Peach Peach", classes now `advising-a` only). The
  built-in browser is left signed in as that account. `npm run seed` does not remove it; harmless.
