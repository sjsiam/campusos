# Product

<!-- impeccable:product-schema 1 -->

Source: written by the Designer from `docs/team/TEAM.md`, `docs/team/BOARD.md` and the Lead's
orders (2026-11-24/25). Not yet confirmed by Siam line by line; facts marked *(inferred)* are
the Designer's reading.

## Platform

web (mobile-first PWA, installed to the Home Screen on Android and iPhone)

## Users

Computer Engineering (Teknik Komputer) students at Universitas Syiah Kuala, Banda Aceh, many of
them international students who read English more easily than Indonesian. They check the app on
a phone between classes, walking across campus, often outdoors in bright tropical light or in a
corridor waiting for a room to open *(inferred)*. Secondary users: class reps, lab assistants and
lecturers who post class changes and assignments from the same phone, usually in a hurry.

## Product Purpose

One place for a student's day: (a) lectures, labs and advising with reminders and a daily
timeline, (b) assignments in one uniform format, (c) lecturer-absence, room-change and
reschedule notices posted only by verified class reps, lab assistants or lecturers.
Success: a student never walks to an empty or wrong room, never misses a deadline, and class
reps actually post changes (the main risk is reps not updating, so posting must take under
30 seconds).

## Positioning

Today class changes travel through WhatsApp groups, mixed with chat, in Indonesian only
*(inferred)*. CampusOS gives verified, structured changes attached to the exact class session,
in English and Indonesian, with a push notification.

## Operating Context

Weekly timetable in WIB (Asia/Jakarta). Rooms like "Ruang 301", "Lab Elektronika". Course codes
like TKE-201. Students already use WhatsApp, Google Classroom / the university e-learning, and
Indonesian super-apps daily *(inferred)*.

## Capabilities and Constraints

Next.js 16 + Tailwind v4, Firebase (Auth with Google only, Firestore, FCM). No UI library.
Bilingual EN/ID. 6-day prototype (demo 2026-11-30). Stretch only: crowd map, Wi-Fi status.

## Brand Commitments

Name: CampusOS. Team: Sudo Squad (GDG ITB case 1). No logo or palette is binding yet; the first
blue board was not approved and Siam asked for a different design.

## Evidence on Hand

Seed timetable (`scripts/seed.ts`), the timetable template, the screen specs in
`docs/design/screens.md`. No real users, quotes or metrics: do not invent any.

## Product Principles

1. The right room at the right time beats everything else on screen.
2. A change must be impossible to miss and impossible to fake.
3. Posting a change is faster than typing it into WhatsApp.
4. Readable for someone whose first language is neither English nor Indonesian.

## Accessibility & Inclusion

WCAG 2.x AA contrast, 44px touch targets, 16px minimum body text, works at 360px with
Indonesian strings, readable outdoors on a phone *(inferred)*.
