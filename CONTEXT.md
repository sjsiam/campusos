# CampusOS — Start here

One-page orientation for a new human or AI teammate. Everything here links to the real source.

## What it is
A mobile-first PWA for Computer Engineering students at Universitas Syiah Kuala: class schedule
with reminders, an assignment tracker, and verified class-change alerts, in English and Indonesian.
Built by Sudo Squad (GDG ITB case 1) in 6 days, demo on **2026-11-30**.
Why and for whom: [PRD.md](PRD.md). What exactly: [SPEC.md](SPEC.md).

## Stack
Next.js 16 (App Router, TypeScript, Tailwind v4) · Neon Postgres via API route handlers ·
Firebase Auth (Google only) and FCM only ·
firebase-admin in a Next.js route for notifications · GitHub Actions cron · Vercel.
Next.js 16 differs from older versions: read [AGENTS.md](AGENTS.md) before writing Next code.
Full picture: [ARCHITECTURE.md](ARCHITECTURE.md).

## Where things live
| Need | Go to |
|---|---|
| Team rules, roles, file ownership | [docs/team/TEAM.md](docs/team/TEAM.md) |
| Tickets, status, plan per day | [docs/team/BOARD.md](docs/team/BOARD.md) |
| How we work (short) | [WORKFLOW.md](WORKFLOW.md) |
| Design and screen specs | [DESIGN.md](DESIGN.md), [docs/design/](docs/design/) |
| Code map, data model, security | [ARCHITECTURE.md](ARCHITECTURE.md) §3–5 |
| Test plan and QA reports | [docs/qa/](docs/qa/) |
| Timetable to seed | [docs/planning/timetable-template.md](docs/planning/timetable-template.md) |
| What changed | [CHANGELOG.md](CHANGELOG.md) |

## Key decisions
| Date | Decision |
|---|---|
| 2026-11-24 | Mobile-first PWA, EN + ID, Firebase + Vercel. |
| 2026-11-25 | Google sign-in only; demo accounts are the team's own Google accounts. |
| 2026-11-25 | No Blaze plan → no Cloud Functions; notify route + GitHub Actions every 5 min. |
| 2026-11-25 | Campus time is WIB (Asia/Jakarta) everywhere. |
| 2026-11-25 | Data moves to Neon Postgres; Firebase only for Google sign-in + FCM; files are links (CO-42). |
| 2026-11-25 | Blue board and Beranda board rejected; no UI built until a new design is approved. |
| 2026-11-25 | Added: responsive tablet/desktop, landing page (`/docs` after the demo). |
| 2026-11-26 | Board v3 design approved. Cuts: desktop reuses tablet layout, no `/changelog` page (GitHub link), offline message only, no extra polish. |
Full wording: [TEAM.md › Decisions](docs/team/TEAM.md).

## Run it
Emulators, seed data, dev server and tests: [ARCHITECTURE.md §7 Local development](ARCHITECTURE.md).
Use `http://127.0.0.1:3000`, not `localhost` (sign-in redirect).
