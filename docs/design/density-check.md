# Step 9: Today at real density vs the reference apps (2026-11-25)

The first render of board v3 Today (phone, 390px, published page with web fonts) was put next
to two real apps before anything else was designed.

Screenshots: `research/v3-today-top.png`, `research/v3-today-bottom.png`.
References: `research/04-sbb-connections.jpg`, `research/07-google-calendar.jpg`.

| Check | SBB | Google Calendar | CampusOS v3 (first render) | Action |
|---|---|---|---|---|
| Items in one phone height | 4 connections + search | 6 events across 2 days | 5 classes + 1 free gap + 2 deadlines + now band | OK: same league |
| Where hierarchy comes from | Bold tabular times, small coded chips | Colour blocks, day number | Bold condensed times, the big room, weight steps | OK: no boxes needed |
| Duration visible | Journey line between departure and arrival | Block height | Only the end time under the start | Added: duration in minutes in the time gutter |
| Now | Not applicable | Thin now line with a dot | Current row tinted + the big now band | Kept; no extra line (a band is clearer outdoors) |
| Colour restraint | Red only in header and buy button | Colour = calendar | Teal shell, yellow only on the changed room, red only on cancelled | OK |
| Chrome | Header + list | App bar + list | App bar squeezed: the date wrapped onto 2 lines next to 3 actions | Fixed: two-row app bar, actions on row 2 |

Verdict: the density and type hierarchy now match the real apps. Two layout fixes went in
before the rest of the board was built.
