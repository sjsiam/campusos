# CampusOS — Product requirements (summary)

Short summary. Sources of truth: product summary and decisions in
[docs/team/TEAM.md](docs/team/TEAM.md), product context in
[docs/design/PRODUCT.md](docs/design/PRODUCT.md), tickets in [docs/team/BOARD.md](docs/team/BOARD.md).

## Problem
Computer Engineering students at Universitas Syiah Kuala get class changes (lecturer absent, room
moved, rescheduled) through busy WhatsApp groups, mostly in Indonesian only. Schedules, deadlines and
changes live in different places, so students miss deadlines or walk to an empty or wrong room.
Details: [PRODUCT.md › Positioning](docs/design/PRODUCT.md#positioning).

## Users
- **Students** (many international) checking a phone between classes.
- **Verified editors:** class reps, lab assistants, lecturers who post changes and assignments.
See [PRODUCT.md › Users](docs/design/PRODUCT.md#users).

## Goals
1. A student always knows today's classes, rooms and deadlines in one place.
2. Class changes reach every affected student fast, and only from verified people.
3. Posting a change is quicker than typing it into WhatsApp (target: under 30 seconds).
4. Usable in English and Indonesian.

## Core features (must ship for the 2026-11-30 demo)
- **(a) Schedule:** lectures, labs, advising; daily timeline; reminders 30 min before class.
- **(b) Assignment tracker:** one uniform format (class, title, instructions, links, due in WIB);
  reminders 24 h and 1 h before the deadline.
- **(c) Verified updates:** lecturer absent / room change / reschedule, posted only by class
  editors, with a push alert and a badge on Today.
Ticket-level detail: [SPEC.md](SPEC.md).

## Also in scope (added 2026-11-25)
Responsive tablet two-pane layout (desktop reuses it), an offline message, and a one-screen public
landing page linking to the README and changelog on GitHub. Cut 2026-11-25/26: `/docs` (after the
demo), `/changelog` page, desktop week timetable, offline app shell, extra polish.
See [TEAM.md › Decisions](docs/team/TEAM.md) and the re-plan in [BOARD.md](docs/team/BOARD.md).

## Stretch (only if all core is done)
Crowd map and Wi-Fi status reports that expire after 1 hour.

## Success measure
Survey students before and after a **2-week trial**. Proposed questions (to confirm): missed deadlines, trips to a wrong or empty
room, and time to hear about a class change. Plus: share of class changes posted in CampusOS
by reps during the trial. No numbers exist yet; none are claimed.

## Out of scope
- Supabase or file uploads (assignments use links). Data lives in Neon Postgres; Firebase is used
  only for Google sign-in and push (decided 2026-11-25).
- Grades, attendance, chat, LMS sync, a separate docs site, Cloud Functions (no Blaze plan).
- Native apps (PWA only).
