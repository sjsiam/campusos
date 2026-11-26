# CE timetable template (for CO-13 seed script)

Fill this with the real Computer Engineering timetable for the current semester. The seed script
(CO-13) turns it into `classes` documents matching `CampusClass` in `lib/types.ts`.

## How to fill it
- **One row per weekly meeting (slot).** A class that meets twice a week gets two rows with the same
  course code, section and type. Rows with the same `courseCode` + `section` + `type` become one
  class; each row becomes one entry in its `slots`.
- **courseCode**: as printed on the official timetable, no spaces (e.g. `TKE201`).
- **courseName**: official name. Indonesian is fine; it is shown as-is in both languages.
- **section**: class/parallel letter or number (`A`, `B`, `01`). Use `-` if there is only one.
- **type**: exactly one of `lecture`, `lab`, `advising`.
- **lecturer**: full name with title as students know it. Lab: the responsible lecturer or `Lab assistant`.
- **day**: `Mon` `Tue` `Wed` `Thu` `Fri` `Sat` `Sun` (stored as 1–6, 0 for Sunday).
- **start / end**: 24-hour `HH:MM` in WIB (campus time), e.g. `07:30`, `13:50`.
- **room**: room as written on campus signs (e.g. `Lab Jarkom`, `Ruang 3.2`).
- Leave nothing blank. If unsure, write `?` and list it under "Open items" below.
- Do **not** put student names, NIMs, phone numbers or emails here. Editors (class reps, lab
  assistants, lecturers) are assigned later with the set-role script (CO-14), not in this file.

## Timetable

| courseCode | courseName | section | type | lecturer | day | start | end | room |
|---|---|---|---|---|---|---|---|---|
| FFTT1001 | Fisika I | 23 | lecture | Safrizal, S.T., M.T. | Wed | 08:00 | 10:30 | F01 - 301 |
| FFTT1007 | Matematika I | CE03 | lecture | Dr. Hendrik Leo, S.T., M.T. | Tue | 08:00 | 10:30 | F01 - 205 |
| MKWU1002 | Kewarganegaraan | 45 | lecture | Hasbi Ali, S.Pd, M.Si | Thu | 16:35 | 18:15 | 11.02.005 |
| MKWU1006 | Pembinaan Karakter I | D29 | lecture | Dr. Ir. Kahlil, S.T., M.Eng. | Sat | 14:00 | 14:50 | MKPK |
| STIK1001 | Pengantar Teknik Komputer | 14 | lecture | Ir. Sayed Muchallil, S.T., M.Sc., IPM | Thu | 08:00 | 09:40 | A25 - 201 |
| STIK1003 | Pengantar Rekayasa dan Desain | 11 | lecture | Prof. Dr. Ir. Yuwaldi Away, M.Sc | Mon | 10:45 | 12:25 | Balee Muasyarah |
| STIK1005 | Logika Digital | 14 | lecture | Zulhelmi, S.T., M. Sc. | Fri | 10:45 | 12:25 | F01 - 303 |
| STIK1007 | Praktikum Logika Digital | 11 | lab | Niza Aulia, S.ST., M.T. | Fri | 10:45 | 11:35 | Laboratorium Fakultas Teknik 7 |
| STIK1009 | Pemrograman I | 14 | lecture | Ardiansyah, BSEE., M.Sc | Sat | 08:00 | 09:40 | A21 - 201 |
| STIK1011 | Praktikum Pemrograman I | 14 | lab | Ardiansyah, BSEE., M.Sc | Sat | 08:00 | 08:50 | Laboratorium Fakultas Teknik 5 |
| STIK1013 | Biologi | 13 | lecture | Hendrix Indra Kusuma | Mon | 14:00 | 15:40 | F01 - 311 |

## Mapping to `CampusClass`

| Template column | `CampusClass` field |
|---|---|
| courseCode | `courseCode` |
| courseName | `courseName` |
| section | `section` |
| type | `type` (`ClassType`) |
| lecturer | `lecturer` |
| day, start, end, room | one `Slot` in `slots[]` (`day` as `Date#getDay` number) |
| *(generated)* | `id` = `<courseCode>-<section>-<type>`, e.g. `TKE201-A-lecture` |
| *(set later by CO-14)* | `editors` = `[]` at seed time |

## Open items

**Confirmed by Siam 2026-11-26:** all items below accepted as written (Biologi lecturer shown
without title; weekly same day/time/room; both overlaps are real).

- STIK1013 Biologi: lecturer's title is cut off in the screenshot ("S.P…"). Siam to confirm.
- Only meeting 1 was in the screenshots; each class is assumed to meet weekly at the same day, time
  and room. Siam to confirm none change later in the semester.
- STIK1007 (lab, Fri 10:45–11:35) overlaps STIK1005 (lecture, Fri 10:45–12:25), and STIK1011 (lab,
  Sat 08:00–08:50) overlaps STIK1009 (lecture, Sat 08:00–09:40). Copied as on the official
  timetable; Siam to confirm.
- Lecturer NIPs are left out on purpose (no personal IDs in the repo).

Filled by: Lead, from Siam's screenshots of the official USK timetable (meeting 1). Date: 2026-11-26.
