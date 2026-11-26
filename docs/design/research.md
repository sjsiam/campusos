# Visual research for CampusOS (2026-11-25)

Why: Siam rejected the first board (generic blue on white). Before proposing new directions I
looked at real screens, not articles. All references were viewed as public store screenshot
pages in the built-in browser; nothing was signed in to, downloaded or installed. Crops are in
`docs/design/research/` for the team's internal reference only (they are other companies' work;
do not ship or publish them).

## What I looked at

| # | Reference | Crop | What it does well visually | What we take |
|---|---|---|---|---|
| 1 | **Structured** (day planner, iOS) | `01-structured.png` | The day is one vertical spine. Each item is a coloured capsule on the spine whose length shows its duration; time sits left in small type, title right. Very little chrome. | A continuous day line with duration you can *see*; the "now" position on that line. |
| 2 | **Access by KAI** (Indonesian rail, 10M+ installs) | `02-access-by-kai.jpg` | Saturated purple header band carrying a greeting ("Selamat Pagi") and the user's name; a white card overlaps the band; round coloured service icons in a row. The grammar every Indonesian student knows from daily apps. | Header band as the "where you stand now" zone; overlap card; round action icons. |
| 3 | **Gojek** (Indonesian super-app) | `03-gojek.jpg` | One committed brand colour owns the whole surface; chunky rounded heavy type; big friendly numerals; bold rounded panels. Confident, not corporate. | Commit to one colour at surface scale; heavy rounded numerals for the one number that matters (minutes to class). |
| 4 | **SBB Mobile** (Swiss rail) | `04-sbb-connections.jpg` | Timetable rows: departure time bold at left, arrival at right, a dotted journey line between, platform ("Pl. 7") and a black train-type tag. Red only for the header and the primary action. Dense but calm. | Schedule set in a timetable's column rhythm; room shown the way a platform is; status in its own column; one accent used sparingly. |
| 5 | **Todoist** quick add | `05-todoist-quick-add.jpg` | As you type "by Friday 13:00", the parsed date is highlighted inside the text and turned into chips (date, person, priority) under the input. Entry feels like one sentence. | For the Post-update form: show the result as a sentence/preview while the rep taps, so posting feels like one action. |
| 6 | **My Study Life** (student planner) | `06-mystudylife.jpg` | Competent, but the category default: navy + bright blue, chat bubbles, stacked white rounded cards. | Anti-reference. Our first board landed exactly here. Avoid navy+blue SaaS look. |
| 7 | **Google Calendar** schedule view | `07-google-calendar.jpg` | Events as solid colour blocks, day number in a circle at left, a thin "now" line with a dot crossing the list. Colour fills, not outlines. | The "now" line across a list; filled blocks read faster outdoors than outlined cards. |

Also noted (not captured): Ruangguru's store page is marketing art only, but its teal brand and
the KAI/Gojek pattern confirm that Indonesian students' daily apps use one strong brand colour
in a header band, round icons and heavy rounded type.

## Patterns across the good ones

1. **One colour owns a region** (KAI header, Gojek surface, SBB header). Grey screens with one
   blue accent read as unfinished.
2. **Time is the left column, always tabular**, and the thing you need (platform / room) is the
   second-loudest element (SBB, Structured).
3. **Status is a separate column or chip, never a colour alone** (SBB delay text, Todoist chips).
4. **Filled shapes beat outlined cards** for glanceability (Google Calendar, Structured).
5. **Entry by tapping parts of a sentence** (Todoist) is faster than a form of fields.

## Anti-patterns to avoid
- Navy + bright blue + white stacked cards (My Study Life, our board v1).
- Thick coloured left rail on rounded cards (flagged by the design check on v1).
- Decorative gradients and illustration in the working screens (store art is not UI).

## Where this goes
Three directions in `docs/design/directions/` (published as "CampusOS design directions"):
- **Papan Jadwal** (departure board): references 4, 7, 6-as-anti.
- **Benang Emas** (gold thread): references 1, 7, plus Aceh songket colours.
- **Beranda** (super-app home): references 2, 3, 5.

## Method note
Process followed: `frontend-design` + `impeccable` (shape → new-work). Product truth was written to
`docs/design/PRODUCT.md` from TEAM.md and the Lead's orders instead of a live interview, because
the team's chain of command routes Siam's answers through the Lead. The impeccable roll
(seed:dbbfb8866c25a0e1) assigned the 7th of my seven grounded worlds (Aceh songket → Benang
Emas). The six catalogue challengers (type specimen, dance notation, reference-setting page,
Crouwel grid, monochrome marketing, vertical video feed) were all declined for this product;
the disciplines kept from them are listed on the directions page.

Seven grounded worlds, ordered by resonance with this audience:
1. Station departure board (KAI/KRL, airport FIDS): rooms as platforms, changes as delays.
2. Indonesian super-app home (Gojek, KAI): colour band, greeting, round service icons.
3. Day spine (Structured, Google Calendar): time-proportional blocks on one line.
4. The printed KRS / jadwal kuliah weekly grid from SIAKAD.
5. Train e-ticket / boarding pass with perforated stub.
6. The faculty notice board (papan pengumuman) with stamped notices.
7. Aceh songket: deep red and black cloth with gold thread.
