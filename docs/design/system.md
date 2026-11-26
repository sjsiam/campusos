# CampusOS design system · v3

Owner: Designer. Builder: Developer. Basis: Siam's approved fix plan in
[critique-beranda.md](critique-beranda.md). Visual reference: Artifact "CampusOS board v3"
(source `docs/design/board-v3/index.html`; every class name and value below appears there).
Status: **approved by Siam 2026-11-26**. Supersedes the Beranda
system.

**The idea.** CampusOS is a timetable people check on the walk between buildings. The design
is built like a real schedule (SBB, Google Calendar):
- times on a left gutter, rows separated by hairlines;
- free time shown as a gap;
- the class happening now as a full-width band.

Colour only marks state: teal is the shell, yellow means *changed*, red means *cancelled or
overdue*. There is no decoration beyond that.

Targets: phone 360–430px (PWA, primary); wide ≥ 768px (side rail + two panes, the same for tablet and desktop; see §5). Tailwind v4, no UI library, inline SVG icons (paths in the board's
`<symbol>` block). WCAG AA; touch targets ≥ 44px; body ≥ 16px.

## 1. Tokens: paste into `app/globals.css`

```css
@import "tailwindcss";

:root {
  --bg: #FFFFFF;           /* page */
  --bg-2: #F4F6F5;         /* free-time gap rows, unread rows */
  --ink: #14201F;
  --muted: #52605E;
  --line: #E1E6E5;         /* hairlines between rows */
  --line-strong: #6B7876;  /* input and segmented-control borders (≥3:1) */
  --head: #0E5A5B;         /* app bar, desktop rail */
  --on-head: #FFFFFF;
  --on-head-muted: #C9DEDD;
  --primary: #0E6D6E;      /* buttons, links, "Now"/"Next", active tab */
  --on-primary: #FFFFFF;
  --primary-soft: #E6F1F0; /* now band, current row, lecture blocks in the week grid */
  --mark: #FFD54A;         /* highlighter: a changed value (new room) */
  --on-mark: #14201F;
  --danger: #B3261E;       /* cancelled, overdue, sign out */
  --danger-soft: #FCEBEA;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0F1716; --bg-2: #141E1D; --ink: #E6EEEC; --muted: #9EAEAB;
    --line: #24302E; --line-strong: #64736F;
    --head: #0B2E2E; --on-head: #E6EEEC; --on-head-muted: #A8C3C1;
    --primary: #6CC8C2; --on-primary: #062020; --primary-soft: #15302E;
    --mark: #F2C94C; --on-mark: #14201F;
    --danger: #FF8A80; --danger-soft: #3A1614;
  }
}
@theme inline {
  --color-bg: var(--bg); --color-bg-2: var(--bg-2); --color-ink: var(--ink); --color-muted: var(--muted);
  --color-line: var(--line); --color-line-strong: var(--line-strong);
  --color-head: var(--head); --color-on-head: var(--on-head); --color-on-head-muted: var(--on-head-muted);
  --color-primary: var(--primary); --color-on-primary: var(--on-primary); --color-primary-soft: var(--primary-soft);
  --color-mark: var(--mark); --color-on-mark: var(--on-mark);
  --color-danger: var(--danger); --color-danger-soft: var(--danger-soft);
  --font-sans: var(--font-text);
  --font-fig: var(--font-fig);
}
html { color-scheme: light dark; }
body { background: var(--bg); color: var(--ink); font-family: var(--font-sans), system-ui, sans-serif; -webkit-tap-highlight-color: transparent; }
::selection { background: var(--mark); color: var(--on-mark); }
:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
```

Note for migration: the old names `background`, `foreground`, `surface`, `warn`, `sun`, `ok` are
gone. Use `bg`, `ink`, `bg-2`, `mark`.

Contrast, light / dark:

| Pair | Light | Dark |
|---|---|---|
| ink on bg | 16.7 | 15.4 |
| muted on bg / on bg-2 / on primary-soft | 6.6 / 6.1 / 5.7 | 7.9 / – / 6.1 |
| on-head on head | 8.0 | 12.3 |
| on-head-muted on head | 5.7 | 7.8 |
| primary on bg / on primary-soft | 6.1 / 5.3 | 9.3 / – |
| on-primary on primary | 6.1 | 8.6 |
| on-mark on mark | 11.8 | 10.5 |
| danger on bg / on danger-soft | 6.5 / 5.7 | 8.0 / 7.1 |
| line-strong on bg (borders, 3:1) | 4.6 | 3.7 |

`app/manifest.ts`: `theme_color "#0E5A5B"`, `background_color "#FFFFFF"`. The `viewport`
export sets `themeColor` to `#0E5A5B` in light and `#0B2E2E` in dark.

## 2. Type: two voices

```tsx
// app/layout.tsx
import { Source_Sans_3, Barlow_Semi_Condensed } from "next/font/google";
const text = Source_Sans_3({ variable: "--font-text", subsets: ["latin", "latin-ext"], display: "swap" });
const fig = Barlow_Semi_Condensed({ variable: "--font-fig", subsets: ["latin", "latin-ext"], weight: ["500", "600", "700"], display: "swap" });
// <html className={`${text.variable} ${fig.variable} h-full antialiased`}>
```

- **Source Sans 3** (variable) for all text. A sturdy UI sans that reads well in Indonesian.
- **Barlow Semi Condensed** with `tabular-nums` for anything you scan as a number or code:
  times, durations, room numbers, course codes, countdowns, dates in lists. Its letters come from
  road and rail signage. Utility: `font-fig tabular-nums`.

| Role | Classes |
|---|---|
| Room now | `font-fig text-[44px] leading-none font-bold` |
| App bar title | `text-[22px] font-bold` |
| Sheet / page title | `text-[20px]`–`text-[22px] font-bold` |
| Section label | `text-[15px] font-bold text-muted` (sentence case, no caps) |
| Row title | `text-base font-semibold` |
| Meta | `text-sm text-muted` |
| Start time | `font-fig text-lg font-semibold`; end time `font-fig text-[15px] font-medium text-muted`; duration `font-fig text-[13px] text-muted` ("1h 40m" / "1j 40m") |
| Countdown | `font-fig text-lg font-bold` + unit line `text-sm text-muted` |
| Landing headline | phone `text-[28px] font-bold`, desktop `text-[44px] font-bold`, `text-balance` |

Times are "08:00" in both languages (24 h, colon). No all-caps labels, no exclamation marks.

## 3. Space, radius, lines

- Gutter `px-4`. Rows `py-2.5`. Section labels `pt-4 pb-1.5`. No gaps between rows: hairlines
  (`border-b border-line`) separate them.
- **Radius by role:** 0 on list rows and panes; 6px on week-grid blocks; 8px on inputs; 10px on
  buttons and segmented controls; 14px on the bottom sheet's top corners; full circle only on the
  avatar and radio dots. No pills.
- **No shadows** except the bottom sheet (`0 -8px 24px rgb(0 0 0/.25)`). Cards are not used.

## 4. Components

**App bar** (phone, tablet panes): `bg-head text-on-head px-4 pt-3.5 pb-3`, two rows.
- Row 1: title (date on Today, page name elsewhere), language switch (the other language's
  code "ID"/"EN", underlined, `lang` attribute, tap area `min-h-11 min-w-11`), avatar (`size-11`
  44px circle, 1.5px `on-head-muted` ring, initial) → Account sheet. Every app bar control is
  ≥ 44×44px (decision 2026-11-26, QA L-1).
- Row 2: summary (`text-sm text-on-head-muted`, e.g. "5 kelas · 1 batal · 1 pindah") and the
  page's one action, an outlined button `min-h-11 rounded-lg border border-on-head-muted px-3
  font-semibold`: **Lapor perubahan** for reps on Today and Updates, **Tambah** on
  Assignments.
- The action is always in this spot. Students don't get one.

**Now band**: `bg-primary-soft px-4 pt-3.5 pb-4 border-b border-line`.
- Line 1: "Sekarang" left, "sampai 11:00" right (`font-fig text-primary font-semibold`).
- Then the room (`font-fig 44px bold`), the class name (`17px semibold`), and the meta (code ·
  lecturer).
- If moved: the room is wrapped in a highlighter mark, and a line reads "Pindah dari ~~204~~ oleh
  Siti Rahma, 07:58".
- Shown only while a class is in progress. Otherwise the timetable starts directly.

**Timetable row**: `grid grid-cols-[52px_1fr_auto] gap-x-3 px-4 py-2.5 border-b border-line`.
- Gutter: start time, end time and duration.
- Body: title, then the meta "Ruang 207 · TKE-108 · Kuliah · Kelas B".
- Right column: a status word: "Sekarang" or "Berikutnya" (`text-primary font-semibold`),
  or "Batal" with an ✕ icon (`text-danger`).

| State | Look |
|---|---|
| Past | all text `text-muted`, weight 500 |
| Now | row `bg-primary-soft` (and the band above) |
| Next | status "Berikutnya"; only one row |
| Moved | meta starts with the new room in `mark`, old room struck `text-muted` |
| Cancelled | title `line-through`; line 2 "Dosen berhalangan" (or "Asisten berhalangan" for labs) `text-sm font-semibold text-danger`; line 3 the rep's note in quotes + name + time, `text-sm text-muted` |

**Gap row**: `bg-bg-2 text-sm text-muted pl-20 py-1.5 border-b border-line`, e.g. "Kosong
12:00–13:30 (1j 30m)". Shown for gaps ≥ 30 minutes.

**Deadline row**: same grid as a timetable row. Gutter: countdown ("13 j" / "lagi").
- Overdue: "Lewat" in `text-danger`.
- More than 7 days away: `text-muted`.
- Body: title (wraps; never truncated) and "TKE-205 · Hari ini, 23:59".

**Update item**: `px-4 py-3 border-b border-line`; unread rows get `bg-bg-2` plus "· Baru".
- Line 1: the kind, "✕ Batal" (`text-danger font-bold`) or "Pindah ruang" (`font-bold`), with
  the post time on the right.
- Line 2: class · code.
- Line 3: the session, then `~~204~~ → [Ruang 305]` (new room in mark).
- Line 4: the note in quotes.
- Line 5: poster, role, then a check icon in `text-primary`.
- Only two kinds exist: cancelled and room moved. There is no reschedule.

**Segmented control**: `grid grid-flow-col auto-cols-fr rounded-[10px] border-[1.5px]
border-line-strong`. Segments are `min-h-12 font-semibold`; the selected one is `bg-ink text-bg`.
Used for: report kind, the class choice in the new-assignment form, due quick picks, language
in Account.

**Radio list**: rows `min-h-[52px] border-b border-line`; dot 20px, selected `border-[6px]
border-primary`. Used for picking the session.

**Buttons**:
- Primary: `min-h-[52px] w-full rounded-[10px] bg-primary text-on-primary text-[17px]
  font-bold`.
- Secondary: `min-h-12 rounded-[10px] border-[1.5px] border-line-strong bg-bg font-semibold`.
- Text: `min-h-11 text-primary font-semibold`.
- Danger text (delete): `text-danger`.
- Sign out: Secondary with `border-danger text-danger`.

**Inputs**: `min-h-12 rounded-lg border-[1.5px] border-line-strong bg-bg px-3 text-base`. The
room field adds `font-fig text-2xl font-bold`. Label `text-[15px] font-semibold mb-1.5`. Hint and
read-back `text-sm`.

**Bottom sheet**: `fixed inset-x-0 bottom-0 rounded-t-[14px] bg-bg px-4 pt-2 pb-5` over a
scrim `bg-black/45`.
- Grab bar 36×4. The header holds the title and a ✕ button (44px).
- Closes on scrim tap, ✕, Escape, swipe down. Focus is trapped.
- Used for: Report change, Account, iPhone steps.

**Notice** (reminders off, iPhone hint): `mx-4 mt-3 rounded-[10px] border border-line-strong
p-3`, text plus actions. No icon disc, no shadow.

**Bottom nav** (phone): 3 tabs, `border-t border-line bg-bg`. Item `min-h-14 text-[13px]
text-muted`; active `text-primary font-bold`. No indicator pill. Unread count on Info kelas:
`font-fig` number on a red circle.

**Side rail** (≥ 768px, replaces the bottom nav): `fixed inset-y-0 left-0 bg-head text-on-head`.
- 768–1023px: `w-[72px]`, icons only (each link has `aria-label`), wordmark shortened to "CO".
- ≥ 1024px: `w-[220px]`, icon + label, wordmark "CampusOS" at the top.
- Links: Hari ini / Tugas / Info kelas, `min-h-11 rounded-lg px-2.5`, active `bg-white/12
  text-on-head`, inactive `text-on-head-muted`. Unread count on Info kelas as on the bottom nav.
- Nothing else lives in the rail: language, avatar and the rep action stay in the main pane's
  app bar, exactly as on the phone.

*(Cut 2026-11-26 by Siam: the desktop week grid. Desktop uses the two-pane layout below.)*

## 5. Layouts by width (decided 2026-11-26)

Two layouts only. Breakpoint is Tailwind `md` (768px).

**Phone (< 768px):** one column, `max-w-md` centred, bottom nav. As specified above.

**Wide (≥ 768px, tablet and desktop alike):** side rail + two panes, no bottom nav.
```
┌──────┬──────────────────────────┬──────────────────────────────┐
│ rail │ MAIN pane                │ SIDE pane                    │
│ 72 / │ = the phone screen,      │ plain pane header (title +    │
│ 220  │ unchanged: its app bar   │ "Semua" link) + a list,       │
│      │ (lang, avatar, rep       │ border-l border-line,          │
│      │ action), now band, rows  │ scrolls on its own            │
│      │ w-[400px] shrink-0       │ flex-1, content max-w-[640px] │
└──────┴──────────────────────────┴──────────────────────────────┘
```
- Container: `md:pl-[72px] lg:pl-[220px]` (room for the rail), panes in `md:flex md:h-dvh`,
  each pane `overflow-y-auto`. Above 1280px the two panes stay left-aligned; the side pane's
  content stops at 640px (no stretching rows across a wide screen).
- The main pane is the phone page as built, just placed in a 400px column. Don't build a second
  version of any screen.

| Route | Main pane (400px) | Side pane |
|---|---|---|
| `/today` | Today (app bar, now band, timetable); no due-soon section on wide screens | "Perubahan minggu ini": the Updates feed items (same component), newest 5, header link "Semua" → `/updates`; then "Tenggat dekat": the deadline rows (same component), header link "Semua" → `/assignments` (agreed 2026-11-26) |
| `/updates` | Updates feed (app bar with rep action, full list) | "Hari ini": today's timetable rows (same component, no now band, no app bar) |
| `/assignments` | Assignments list (app bar with "Tambah") | Detail of the selected assignment; default = first item in the list; empty state "Pilih tugas untuk melihat detail" / "Select an assignment to see its details" when the list is empty |
| `/assignments/[id]` | Same list, the row for `[id]` gets `bg-primary-soft` | That assignment's detail (without its own app bar; back button not needed) |
| `/assignments/new` | One centred column `max-w-[560px]` (form as on phone) | none |
| `/login`, `/onboarding`, `/` | No rail, no panes: centred column `max-w-md` (landing desktop: board v3 desktop landing) | none |

- Selecting a row in the list on wide screens navigates to `/assignments/[id]` (URL changes,
  the list keeps its scroll position); on phone the same link opens the detail page.
- Sheets (Report change, Account, iPhone steps) on ≥ 768px: same sheet, `max-w-[480px]
  mx-auto` and bottom-attached, so it reads as a panel, not a full-width bar.
- New copy keys: `side.changes` "Changes this week" / "Perubahan minggu ini" ⟨cek⟩,
  `side.today` "Today" / "Hari ini", `assign.pick` "Select an assignment to see its details" /
  "Pilih tugas untuk melihat detail" ⟨cek⟩.

The landing page has no app chrome: a top bar with the wordmark (`font-fig text-[22px]
font-bold text-primary`), the language switch and the sign-in button.

## 6. Motion
The bottom sheet slides up (200ms ease-out). Nothing else moves. `prefers-reduced-motion`
turns it off.

## 7. Accessibility checklist (QA)
1. Targets ≥ 44px. 2. Contrast per §1. 3. State is always a word as well as a colour (Batal,
Pindah ruang, Lewat). 4. Labels on every input. 5. `html lang` follows the language. 6. Visible
focus ring; sheets trap focus. 7. 360px with Indonesian strings and 200% text zoom without
sideways scroll. 8. Icon-only rail links have an `aria-label` ("Hari ini", "Tugas", "Info kelas").
