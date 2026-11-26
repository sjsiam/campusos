# Critique: CampusOS board · Beranda (rejected 2026-11-25)

Alfiz rejected the board as "too AI slop". This is an honest look at why, before anything is
redesigned.

**Method.** The `impeccable` critique flow and `frontend-design`'s anti-generic guidance.
- **Assessment A:** an independent design review run by a separate agent that had not seen my
  reasoning (I designed the board, so I should not grade it alone). It went through all 14
  rendered plates on the published page, in light/English and dark/Indonesian.
- **Assessment B:** done here. It is the impeccable detector run on the source, plus my own
  screenshots of the published page from the earlier check, and a count of the CSS.
- **Degraded run:** B ran in this context, not in its own agent, so treat it as one reviewer, not
  two.

Source: `docs/design/board-beranda/index.html`.

## Verdict

**The execution is the problem, not the direction.** Teal + yellow and the familiar
Indonesian super-app feel are still a defensible choice: students live in Gojek and KAI, and the
look signals "local and dependable".

The slop comes from two things:
- **Copying the super-app's surface without its reasons:** greeting header, a row of round
  "services", floating promo cards, stickers, soft shadows.
- **One rounded-card recipe everywhere.**

The product thinking is specific: the room as the main thing, the WIB read-back, "Send to 38
students", verified senders, the honest iPhone install states. The pixels are not. Swap the logo
and course codes and a gym or clinic app could ship the same screens.

## AI tells, where they are, and what a designer would do instead

| # | Tell (where) | Why it reads as generated | What a human designer would do |
|---|---|---|---|
| 1 | **"Good morning, Siti" greeting** over a big date, avatar circle and language pill (Today, Reminders, Account, Hint) | It is the default LLM dashboard opener. It spends about a quarter of the screen before any data. In KAI the greeting is tiny; here it is a headline. | Drop the greeting. Put date and status in one compact line ("Rab 25 Nov · 3 kelas · 1 batal") and start with the current class. |
| 2 | **Tilted "Moved!" sticker** with drop shadow (Today hero, Login) | Borrowed whimsy: rotate(4deg) plus an exclamation mark is the stock way to look playful. Real change alerts are flat and loud. | Flat change line: old room struck through, new room in a high-contrast band, a word ("Pindah ruang") and the sender. Yellow means exactly one thing: changed. |
| 3 | **Pastel round icon buttons** everywhere: 4 shortcuts on Today, 3 "services" in the report sheet, kind discs in Updates, discs in Links, Account rows and the bell | The icon-in-a-tinted-circle is the most repeated generated UI motif. KAI has a services row because it has five real products; ours has three jobs, and three of the four shortcuts copy the bottom nav (with duplicated badges). | Cut the shortcut row. Keep one rep-only action. Kinds become text plus a small glyph. The report sheet uses a plain three-way segmented control. |
| 4 | **Everything in a rounded white card on a pale-teal field** (all lists, Account, editor, Updates) | The "SaaS card kit". The CSS has 31 fully-rounded pills and 12 blocks at the same 18px radius, plus 16/22/26px variants, with no hairline list or table anywhere. | A timetable is a list on a time axis. Use edge-to-edge rows with hairlines, a time gutter, and gaps shown as gaps. Keep cards only for the one thing that floats, if any. |
| 5 | **Uniform rhythm**: same padding, same 16px gutter, same gap in every block | Nothing is more important than anything else, so the only hierarchy device is the giant room number. | Vary density on purpose: tight rows for the schedule, more air around the current class, strong type steps. |
| 6 | **Decorative sample cards on Login** ("Ruang 305 / Moved!", "13 hours left") | The classic generated landing-page "floating product preview". | A plain sign-in with one sentence about what it is for. The landing page (new scope) can show real screens. |
| 7 | **Generic teal #00696B + amber** | Reads as a Material 3 tonal palette from one seed colour. Nothing in it is tied to USK or Aceh. (The reviewer said USK's identity is navy and yellow; I have not checked that.) | Keep teal/yellow as the base but take the exact values from something real: USK identity or signage, or desaturate the tints. Yellow only for "changed", red only for "cancelled/overdue". |
| 8 | **Rubik for everything**: headings, body, times, course codes | Soft rounded shapes on everything add to the toy feel. Times and codes have no typographic voice of their own. | Two voices: a sturdy UI sans for text, and tabular or condensed figures for times, rooms and codes (what SBB does). |
| 9 | **Too-tidy, contradictory sample data** | Every state appears exactly once on one perfect day (one past, one moved, one cancelled, one next, one overdue). It also contradicts itself: Today says the 13:30 lab is *cancelled*, while the push example says the same TKE-201P 13:30 *moved to Lab Komputer 2*. | One consistent fake day with real mess: two classes back to back, a long gap, a lab that runs 3 hours, an assignment with a long Indonesian title, a note with a typo. Every plate tells the same story. |
| 10 | **Marketing copy**: "Your classes, assignments and class changes in one place.", "Moved!", "Enjoy the free time." | Tagline filler and exclamation marks are generated-copy tells. | Plain, specific labels: "Masuk dengan akun Google USK", "Pindah ke Ruang 305". |
| 11 | **Same soft shadow on hero, banners, FAB and sheets** (`0 10px 24px -14px`) | Decoration, not elevation. | No shadows on content. Only a real overlay (the sheet) gets one. |
| 12 | **Three styles for one action**: yellow "+" disc on Today, yellow pill FAB on Updates, "+" in the Assignments band | Each screen invented its own entry point. | One consistent "Lapor perubahan" entry, in one place and one style. |
| 13 | **Symmetry and centring**: three equal circles, centred headings in sheets, an empty gap above the services in the report sheet | Symmetry is the default when nobody decided. The gap is a layout bug that reads as filler. | Left-aligned, content-sized, with no dead space. |
| 14 | **Material 3 copy-paste**: the pill indicator behind the active nav icon, the tonal "secondary" buttons | Reads as a template rather than this product. | A plain standard tab bar. Show the active tab with weight and colour only. |
| 15 | **Logo**: a map pin in a yellow circle | A stock "location" glyph; nothing to do with classes. | A wordmark only until the team has a real mark. |

Reviewer's heuristic scores (0 = no problem, 4 = severe):
- **Biggest problems:** consistency/standards 3, aesthetic/minimalist 3, match with the real
  world 2, efficiency 2.
- **Cognitive load:** Today has about 8 competing focal points.
- **Colour meaning:** it is never explained whether yellow means urgency, rep actions or the
  brand.

## What the real apps have that ours lacks

Compared with the crops in `docs/design/research/`:

- **SBB Connections (`04-sbb-connections.jpg`)**
  - Dense hairline rows; times in strong tabular weight on the left, arrival on the right.
  - Platform and train type as small coded chips; red only for disruption.
  - Almost no card chrome. Changes live in the row, not in a sticker.
  - *Ours lacks:* density, a typographic hierarchy built from numbers, colour restraint.
- **Google Calendar (`07-google-calendar.jpg`)**
  - A date gutter on the left and events as filled blocks stacked edge to edge on a time axis.
  - A thin "now" line, and free time visible as space.
  - *Ours lacks:* any sense of time between classes. The 09:40–13:30 gap is invisible.
- **Access by KAI (`02-access-by-kai.jpg`)**
  - The services row routes to five real, separate products.
  - The balance card shows real numbers; the greeting is small text, not a headline.
  - Promo clutter and imperfection make it feel lived in.
  - *Ours lacks:* the reason for its shapes. We copied the services row and the band without the
    services.

**Common thread:** real apps get their hierarchy from typography and position. Our board gets
it from containers, tints and badges. They are built around real constraints (platforms, delays,
durations); our board is built around showing off each component once.

## Worth keeping

1. **The room is the most important thing** ("Ruang 305" large, the course second).
2. **The report form's logic:**
   - class and session pre-filled, session chips;
   - "Send to 38 students";
   - the WIB read-back in the editor.
3. **Verified-sender lines and the honest notification states:** blocked, iPhone not installed,
   with the real iPhone Settings path.
4. **Teal + yellow as the base**, with tighter meanings.

## Fix plan for the next board (not started; needs the Lead's go-ahead)

1. **Strip the costume.** Remove the greeting, tilted sticker, shortcut row, Login floaters,
   map-pin logo, decorative shadows and the Material nav indicator.
2. **Today becomes a timetable.** A time gutter with edge-to-edge hairline rows and gaps shown
   as gaps. The current class stays largest, as a full-width band instead of a floating card.
   Changes are flat rows: old room struck, new room bold, sender named.
3. **Colour has jobs, not moods.**
   - Teal: shell and primary actions.
   - Yellow: "changed" only.
   - Red: "cancelled / overdue" only.
   - Take exact values from USK's real identity if it fits; otherwise desaturate the tints.
4. **Two type voices.** A sturdy UI sans for text, plus tabular or condensed figures for times,
   rooms and codes. Build hierarchy from size and weight steps, not boxes.
5. **One radius scale by role.** Small radius on inputs and chips, none on list rows. Pills only
   for real toggles.
6. **One entry point for reps**, "Lapor perubahan", in the same place on every screen. The
   report sheet uses a segmented control, not three pastel circles.
7. **One consistent, messy sample day** used on every plate, including the push examples,
   checked for contradictions before publishing.
8. **Plain copy.** No taglines, no exclamation marks. Indonesian copy read by Alfiz or Siam.
9. **Show it at real density first.** Render Today with a full day (6–7 rows) and compare it
   side by side with the SBB and Google Calendar crops before polishing anything else.

## New scope for the next board

From TEAM.md, Decisions (Siam + Alfiz, later on 2026-11-25):

- **Responsive layouts.**
  - Phone stays the primary PWA.
  - Tablet: two panes, Today/timetable beside Updates or the assignment detail.
  - Desktop: a week timetable grid plus side panels, with the same tokens and components.
- **Public landing page at `/`** for signed-out visitors. It says what CampusOS does for USK
  Computer Engineering students, shows real screens (not floating mock cards), and links to
  sign-in, `/docs` and `/changelog`. It is a "persuade" surface, so it can carry more expression
  than the app, but in the same world.
- **`/docs` and `/changelog` pages** in the same app. These are reading surfaces: they need a
  typographic system (measure, headings, code), not cards.
