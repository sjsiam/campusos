# QA report: Day 5 checks (CO-38 landing, CO-27 manifest/icons, CO-28 iPhone hint, CO-20 notify)

Date: 2026-11-26, 00:35–01:00 WIB. Lead's dev server `http://127.0.0.1:3000` (Auth emulator + PGlite).

**Verdict: PASS on everything I could run. One environment blocker (S-1) stopped the live
iPhone-hint walk-through; that item was checked with a logic script + code read instead.**
`npm test` unchanged: 95 passed, 1 skipped.

## CO-27 Manifest + icons: PASS

| Check | Result |
|---|---|
| `/manifest.webmanifest` | 200, valid JSON: name/short_name CampusOS, `start_url /today`, `display standalone`, `theme_color #0E5A5B`, `background_color #FFFFFF` |
| `/icons/icon-192.png` | 200 `image/png`, 192×192 |
| `/icons/icon-512.png` | 200 `image/png`, 512×512 |
| `/icons/maskable-512.png` | 200 `image/png`, 512×512, `purpose: maskable`; the "C" sits well inside the 80% safe zone |
| Apple touch icon | `<link rel="apple-touch-icon" sizes="180x180">` → 200, 180×180 |
| Favicon | `<link rel="icon">` → `icon.png` 64×64, 200 |
| Theme colour | `<meta name="theme-color">` `#0E5A5B` light / `#0B2E2E` dark |
| `/sw.js` | 200 `application/javascript` |

Note: `/favicon.ico` is 404. Harmless because the page declares `icon.png`; only clients that
ignore `<link rel=icon>` would ask for it.

## CO-38 Landing `/`: PASS

| Check | Result |
|---|---|
| Signed out, 375 and 360px, EN and ID | Wordmark + language switch (44px); headline (`h1`), body, Google button (52px), real Today screenshot (`alt` translated: "Tangkapan layar Hari ini" / "Screenshot of the Today screen"), footer "Dibuat oleh Sudo Squad untuk GDG ITB case 1"; no bottom nav; no horizontal scroll (scrollWidth 360) |
| `<html lang>` follows the switch | `id` → `en` ✓ |
| Sign in from landing | Emulator picker → `student@demo` → lands on `/today` ✓ (at ~00:40, before S-1) |
| Signed-in user opens `/` | Sent straight to `/today` ✓ |
| "Catatan rilis" link (v3 table) | Not present. The source comment says it waits for Siam's changelog decision, so not filed. |

## CO-28 iPhone hint: PASS (logic + code), live run BLOCKED by S-1

`pushState()` from `lib/push.ts`, run with stubbed browsers (script: scratchpad `ios-hint.mts`), plus
the onboarding rule `state === "install" && /CriOS|FxiOS|EdgiOS/`:

| Browser | `pushState()` | Onboarding step 3 shows |
|---|---|---|
| iPhone Safari tab, iOS 18 | `install` | Home Screen steps |
| iPhone Safari tab, old iOS (no Push API) | `install` | Home Screen steps |
| iPhone, installed (`standalone`) | `default` | permission prompt + notification preview |
| iPhone Chrome (`CriOS`) | `install` | "Open this page in Safari…" |
| iPhone Firefox (`FxiOS`) | `install` | "Open this page in Safari…" |
| iPad (desktop UA + touch) | `install` | Home Screen steps |
| Mac Safari (no touch) | `default` | permission prompt |
| Android Chrome | `default` | permission prompt |

Never skipped: `app/onboarding/page.tsx` goes from step 2 to step 3 whenever it isn't the
"change classes" edit, with no browser condition (the Day 2 `!("Notification" in window)` skip is gone).
In the `install` state the sticky bar shows only "Not now" (no permission button), as the spec says.
Today's notice uses the same `pushState()`, so it shows the iPhone text + "Show me how" sheet there.

Not live-tested: the rendered screens with an iPhone UA (S-1), and a real iPhone.
Minor gap vs spec §10 row 2: an *installed* iPhone on iOS < 16.4 returns `unsupported` (no message)
instead of the `notif.iosOld` text. Very rare; not filed.

## CO-20 Notify route: PASS (C-06 run in-process)

The dev server has no `CRON_SECRET`, and restarting it isn't allowed, so I called the route
handler directly with `tsx` (scratchpad `notify-c06.mts`), with `CRON_SECRET=qa-local-secret`,
`NEXT_PUBLIC_USE_EMULATORS=true` (no FCM send), against the same PGlite database:

| Call | Result |
|---|---|
| No `Authorization` | 401 |
| `Bearer nope` | 401 |
| Correct secret, 1st call | 200, 3 jobs claimed (`update-u-matdis-1`, `update-u-strukdat-1`, `update-u-lab-1`), `emulated: true`, `sent: 0` (no demo user has an FCM token) |
| Correct secret, 2nd call | 200, `jobs: []`: **no double send** ✓ |

Cleanup: the 3 `notifications` rows this run claimed (`emulated = true`, claimed during the run) were deleted.
Not covered: a real FCM send, and `sent > 0` (needs a token + VAPID key). The HTTP-level test C-06 in
`tests/api.auth.test.ts` still skips without `CRON_SECRET`; the 401 cases C-01..C-05 pass over HTTP.

## S-1 (environment, blocks live UI checks) Emulator sign-in fails in the built-in browser since ~00:45

- Steps: built-in browser → `http://127.0.0.1:3000/login` (or `/`) → "Continue with Google" →
  emulator picker → any account (`student@demo`, or a new auto-generated one).
- Expected: back on the app, signed in, routed to `/today` or `/onboarding` within a few seconds.
- Actual: "Loading" for ~30s, then the login page with "Sign-in failed. Please try again."; console:
  `FirebaseError: Firebase: Error (auth/network-request-failed)`. Network: the redirect handler and
  the emulator `iframe` load (200), but no `accounts:signInWithIdp` call follows.
- Same flow worked at ~00:15, ~00:27 and ~00:40 in this session. The emulator answers fine from the
  shell and from the page (`accounts:lookup` 400 in 8 ms). No service worker registered. Clearing the
  emulator origin's storage didn't help. `lib/auth.ts` (00:40), `app/login/page.tsx` (00:36) and
  `components/Session.tsx` (00:36) changed shortly before, but nothing in them looks related.
- Ask: Lead/Developer, please try one sign-in in regular Chrome at `http://127.0.0.1:3000`. If it
  works there, it's the built-in browser's state and I'll re-run the live iPhone-hint walk-through
  in a fresh profile; if it fails there too, it's a regression for the Developer.

## Testing notes
- The test accounts the emulator now lists (Peach Peach, Peach Mountain, Algae Raccoon, Panda Orange)
  are mine from onboarding runs; harmless, and gone on the next emulator restart.
- The console also showed the Developer's transient build error for the landing screenshot import
  (`today-screenshot.png` → now `.jpg`); the page renders the image fine now.

## Re-check after the S-1 fix (2026-11-26, ~01:15 WIB)

`lib/firebase.ts` now connects to the Auth emulator on the page's own host. All checks below on
**`http://localhost:3000`** (use localhost from now on).

| Item | Result | Evidence |
|---|---|---|
| S-1 | **CLOSED** | Signed out via Account → "Keluar", opened `/`, "Masuk dengan Google" → emulator picker → `student@demo` → on `/today` ~1.5 s after the pick. No "Sign-in failed", no console error. |
| Signed-in `/` → `/today` | PASS | Opening `/` with the existing localhost session went straight to `/today`. |
| Landing, light, 375px, ID | PASS | White bg, teal wordmark/button, headline + body + "Masuk dengan Google" + screenshot; `lang="id"`; no horizontal scroll. |
| Landing, dark, 375px, ID | PASS | bg `rgb(15,23,22)`, text `rgb(230,238,236)`, light teal button; `theme-color` `#0B2E2E` for dark; no horizontal scroll. The screenshot stays a light-mode picture (expected). |
| Retaken landing screenshot | PASS | `public/today-screenshot.jpg` (750×1624): "Pindah dari Ruang 204 oleh Siti Rahma, **07:58**" in the now band and "… · Fajar Maulana, **09:47**" on the cancelled lab row; nav badge 4. |
| Seed change (posts at fixed daytime times) | PASS | `npm test`: 95 passed, 1 skipped (C-06). The API tests build their own classes and the `lib/` tests use fixed fixtures, so none depend on seed times. |

Left for a real iPhone (per Lead): the Share / Add-to-Home-Screen glyphs and the live step-3 hint
(logic already verified above). C-06 over HTTP still needs `CRON_SECRET` on the dev server.
Note for whoever runs the API tests: `tests/api.auth.test.ts` defaults to `http://127.0.0.1:3000`.
That's fine (server-side token checks don't care about the page host); set `API_URL` to use localhost.
