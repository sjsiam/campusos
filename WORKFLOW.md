# CampusOS — How we work

For Siam, Alfiz, Jaja and Ariq. Short form of [docs/team/TEAM.md](docs/team/TEAM.md), which wins
if the two disagree.

## Who decides
- **Siam** has final say: approves designs, finished tickets, commits, pushes and deploys.
- **Alfiz** fills the real timetable with Siam and reviews designs with Siam.
- **Lead** (Claude session) turns decisions into orders for the AI roles:
  Planning, Designer, Developer, QA. They follow the Lead only and edit only the files they own
  ([TEAM.md › File ownership](docs/team/TEAM.md)).

## How a ticket moves
1. **Planning** writes it on [the board](docs/team/BOARD.md): ID, owner, due day, acceptance criteria. Status `Todo`.
2. **Designer** specs the screen in [docs/design/](docs/design/) and shows it on the design board.
3. **Siam approves the design.** No screen is built before that.
4. **Developer** builds it (`In progress`), runs `npm run lint` and `npm run build`.
5. **QA** checks it against the criteria and the spec (`In QA`), reports PASS or FAIL with steps.
   FAIL goes back to Developer.
6. **Siam approves** the result → Planning marks it `Done` and adds it to [CHANGELOG.md](CHANGELOG.md).

Non-UI work (logic, data, scripts, tests) skips steps 2–3.

## Git, commits, deploys
- AI sessions never commit, push, switch branches or deploy.
- Humans commit only after Siam agrees. Proposed (not yet confirmed by Siam): commit to `main`,
  one commit per finished ticket, message starting with the ticket ID (`CO-16: assignments list`).
- Secrets only in `.env.local` (gitignored); see `.env.example`.
- Neon database and Vercel deploys need Siam's explicit go-ahead (planned Day 5).

## Run and test
Setup, emulators, seed data and test commands: [ARCHITECTURE.md §7](ARCHITECTURE.md).
In short: `npm run emulators`, `npm run seed`, `npm run dev`, `npm test`.
What QA checks and how: [docs/qa/test-plan.md](docs/qa/test-plan.md).

## Daily rhythm (until demo 2026-11-30)
Morning: Lead posts orders from the board. During the day: build → QA → report.
Evening: Lead reports to Siam; Siam approves or sends back; board and changelog updated.
