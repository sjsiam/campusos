# Changelog

All notable changes to CampusOS are recorded here.
Format: [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/). Ticket IDs refer to
[docs/team/BOARD.md](docs/team/BOARD.md). Deployed to https://campusos-sudo.vercel.app on 2026-11-26; no version released yet.

## [Unreleased]

### Added
- Live deployment on Vercel with the production database on Neon and the 11 real CE classes (CO-30, CO-31).
- Installable web app: manifest, app icons, and an offline message when there is no connection (CO-07, CO-27).
- Data stored in Postgres (Neon) behind API routes that check the Firebase sign-in token: only a
  class's verified editors can post its assignments and updates (CO-42), with authorization tests (CO-43).
- English and Indonesian interface with a language switch; page language follows the choice (CO-05).
- Google sign-in, sign-out from the Account sheet, and a guard for signed-out visitors (CO-09).
- Onboarding: choose language, pick classes, reminders step; change classes later (CO-10).
- Today timeline in campus time (WIB) with "now" and "next" markers, cancelled and room-changed
  classes, and upcoming deadlines (CO-11, CO-24).
- Assignments: list, detail, and a create/delete form for class editors (CO-16, CO-17).
- Updates feed and a short form for editors to report a lecturer absence or room change (CO-22, CO-23).
- Notification permission prompt and device registration (CO-26). Real push not yet tested.
- Reminder and alert sender: class 30 min before, deadlines 24 h and 1 h before, new updates
  (CO-20), called every 5 minutes by a scheduled GitHub workflow (CO-25). Not yet tested against a
  real Firebase project.
- Real Computer Engineering timetable (11 USK classes) in the seed data (CO-13).
- Demo seed data and a script to give users roles and class edit rights (CO-14).
- New visual design (board v3) across all built screens (CO-35).
- Tablet and desktop layout: two panes side by side; phones keep the bottom navigation (CO-37).
- Public landing page for signed-out visitors, with links to the README and release notes (CO-38).
- "Add to Home Screen" hint for iPhone users (CO-28). Not yet checked on a real iPhone.

### Known gaps
- Assignments cannot be edited or marked done (cut for the demo).
- Reschedule notices are not supported; only absence and room change.
- When two classes overlap, Today's "now" band shows only one of them.
- The app does not work offline; it shows an offline message.
- Push notifications are untested on real devices, and scheduled reminders are paused until the
  GitHub workflow secrets are set.
