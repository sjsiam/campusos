# DESIGN

Index of CampusOS design work. Owner: Designer. The content lives in `docs/design/`; this file
only points to it.

## Purpose
How CampusOS looks and behaves: a mobile-first PWA for Computer Engineering students at
Universitas Syiah Kuala (timetable and reminders, assignments, verified cancellations and room
changes), English and Indonesian, with a two-pane layout on tablet and desktop and a public landing page.

## Status (2026-11-26)
**Board v3 approved by Siam 2026-11-26.** The Developer builds from it (CO-35).
- Board v1 (blue): not approved. Directions A/B/C: C · Beranda picked.
- Beranda board: rejected ("too AI slop"); see the critique.
- Board v3: approved by Siam 2026-11-26; current.
- Cut by Siam 2026-11-26: desktop week timetable (desktop = tablet two-pane layout), `/changelog`,
  offline app shell (offline message only), CO-32 polish. Wide-screen spec: system.md §5.

## Where things are
| What | File |
|---|---|
| Tokens, type, components, layouts by width (v3) | [docs/design/system.md](docs/design/system.md) |
| Screen specs, states, EN/ID copy keys (v3 section first) | [docs/design/screens.md](docs/design/screens.md) |
| Board v3 source | [docs/design/board-v3/index.html](docs/design/board-v3/index.html) |
| Step 9 density check vs real apps | [docs/design/density-check.md](docs/design/density-check.md) |
| Critique of Beranda + the approved fix plan | [docs/design/critique-beranda.md](docs/design/critique-beranda.md) |
| Visual research and reference crops | [docs/design/research.md](docs/design/research.md), [docs/design/research/](docs/design/research/) |
| Product truth used for design | [docs/design/PRODUCT.md](docs/design/PRODUCT.md) |
| Older boards (superseded) | [board/](docs/design/board/index.html), [directions/](docs/design/directions/index.html), [board-beranda/](docs/design/board-beranda/index.html) |

Published boards are private Artifacts; ask the Lead for the links.

## Rules
Team process and file ownership: [docs/team/TEAM.md](docs/team/TEAM.md). Tickets:
[docs/team/BOARD.md](docs/team/BOARD.md).
