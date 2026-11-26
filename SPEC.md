# CampusOS — Functional spec (index)

Each feature points to its tickets (acceptance criteria) in [docs/team/BOARD.md](docs/team/BOARD.md)
and its screen spec in [docs/design/screens.md](docs/design/screens.md). Those files are the source
of truth; this page only maps them. Design is being redone (CO-36); screen visuals may change,
behaviour may not without a ticket change.

## Accounts and setup
- **Google sign-in, auth guard, sign-out** — CO-09; screens.md §1 Login, §12 Account sheet.
- **Onboarding: language, classes, reminders step** — CO-10; screens.md §2.
- **Change classes / language later** — CO-10; screens.md §12.
- **Roles and class editors** (admin script, no UI) — CO-14; access checks in API routes CO-42, tests CO-43.

## (a) Schedule
- **Today timeline** (WIB, now / next markers, empty day) — CO-11; screens.md §3.
- **Class data** from the real CE timetable — CO-13; [docs/planning/timetable-template.md](docs/planning/timetable-template.md).
- **Schedule logic** (sessions, reminder times, applying updates) — CO-18, tests CO-19.
- **Class reminder 30 min before** — CO-20 (notify route), CO-25 (5-min cron); texts screens.md §11.

## (b) Assignments
- **List + detail** — CO-16; screens.md §4, §5.
- **Editor form (editors only): create + delete, no edit for the demo** — CO-17; screens.md §9.
- **Deadline reminders 24 h and 1 h before** — CO-20, CO-25; screens.md §11.

## (c) Verified class updates
- **Updates feed** — CO-22; screens.md §6.
- **Post update (absent / room change / reschedule)** — CO-23; screens.md §7.
- **Change badges on Today: cancelled + room change (no reschedule badge)** — CO-24; screens.md §3.
- **Alert on new update** (next cron run) — CO-20, CO-25; screens.md §11.

## Notifications and install
- **Permission prompt + token saving** — CO-26; screens.md §10.
- **PWA icons, service worker, offline message (no offline shell)** — CO-27.
- **iPhone add-to-home-screen hint** — CO-28; screens.md §8.

## Cross-cutting
- **English + Indonesian** — CO-05, CO-29.
- **Empty / loading / error states as built** — screens.md §13 (polish CO-32 cut).
- **Responsive: tablet two panes; desktop reuses them** — CO-37.
- **Restyle built screens to approved design** — CO-35, design CO-36.

## Public pages
- **Landing `/` (one screen, links to the GitHub README and [CHANGELOG.md](CHANGELOG.md) on GitHub)** — CO-38, CO-41. `/changelog` page cut (CO-39).
- **`/docs`** — CO-40, after the demo (Siam 2026-11-25).

## Release
- **Neon database + `DATABASE_URL` in Vercel** — CO-30. **Vercel** — CO-31 (both need Siam's go-ahead).
- **Demo accounts and demo script** — CO-33, CO-34.

Data model and security: [ARCHITECTURE.md](ARCHITECTURE.md) §4–5 (being rewritten for Neon by CO-42).

## Data layer
- **Neon Postgres + API route handlers with Firebase ID-token checks** — CO-42; tests CO-43.
