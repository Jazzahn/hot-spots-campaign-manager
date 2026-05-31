# Hot Spots Campaign Manager

A web-based campaign tracker for the **BattleTech Hot Spots** Chaos Campaign: Mercenaries system. Designed for multi-player campaigns where each player runs their own mercenary company within a shared campaign world.

## What it does

The app tracks everything the rules require across a full campaign:

- **Campaigns** — the shared world (game rules, current month, setting notes). One campaign can hold multiple players.
- **Companies** — each player's mercenary command: warchest, reputation, force scale, and roster.
- **Force** — BattleMechs and other combat units with damage tracking and BV calculations.
- **Pilots** — named pilots (up to 4) with full SP advancement, edge tokens, and edge abilities. Non-named crew tracked separately.
- **Contracts** — negotiate and activate contracts with terms (base pay %, salvage rights, command rights, support, transport). Tracks monthly pay and maintenance automatically.
- **Tracks** — record mission results, unit damage, pilot performance, and salvage. Advances pilot SP and updates the warchest in one step.
- **Ledger** — append-only financial history. Every SP in or out is recorded with category, description, and running balance.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router), React 19 |
| Database | PostgreSQL via [Neon](https://neon.tech) (serverless HTTP) |
| ORM | Prisma 7 |
| UI | Radix UI + Tailwind CSS |
| Deployment | Cloudflare Pages |

## Getting started

### Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech) database (free tier works)

### Setup

```bash
# Install dependencies
npm install

# Copy and fill in environment variables
cp .env.example .env.local
# Edit .env.local and set DATABASE_URL to your Neon connection string

# Apply database migrations
npm run db:migrate:deploy

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |

## Project structure

```
app/
  page.tsx                              # Campaigns list (home)
  [campaignId]/
    layout.tsx                          # Campaign breadcrumb header
    page.tsx                            # Campaign overview — lists companies
    [companyId]/
      layout.tsx                        # Company nav shell
      page.tsx                          # Company dashboard
      force/page.tsx                    # Unit roster
      pilots/page.tsx                   # Pilot roster
      contracts/page.tsx                # Contract list
      contracts/[contractId]/page.tsx   # Contract detail + tracks
      ledger/page.tsx                   # Financial ledger
components/
lib/
  actions/                              # Server Actions (all data mutations)
    campaign.ts                         # Campaign-level CRUD
    company.ts                          # Company CRUD + warchest
    contracts.ts / tracks.ts / ...
  calculations/                         # Game-rule math (SP, combat pay, repairs)
  constants/                            # Scales, SP costs, hot spots data
prisma/
  schema.prisma
  migrations/
```

## Game mechanics reference

### Force scales

| Scale | BV Limit | Unit Limit | Monthly Maintenance |
|---|---|---|---|
| 1 | 3,000 | 3 units | 500 SP |
| 2 | 6,000 | 6 units | 1,000 SP |
| 3 | 9,000 | 9 units | 1,500 SP |
| 4 | 12,000 | 12 units | 2,000 SP |

### Named pilots

- Maximum 4 named pilots per company.
- Earn SP from tracks (MVP bonus: +20 SP).
- SP is invested into gunnery, piloting, edge tokens, or edge abilities.
- Non-named crew are tracked but do not advance.

### Contracts

Contracts have negotiable terms. Key fields:

- **Base Pay %** — percentage of scale maintenance paid monthly by employer.
- **Salvage Rights %** — share of enemy BV the company can claim.
- **Command Rights** — Independent → Liaison → House → Integrated.
- **Support %** — employer's contribution to repair/rearm costs.
- **Transport %** — employer covers this share of deployment costs.

### Warchest

Every C-Bill change (pay, maintenance, repairs, salvage, transport) creates a `Transaction` row. The ledger is append-only. Going into debt is allowed; debt accrues interest.

## Database commands

```bash
npm run db:migrate:dev -- --name <description>   # create + apply a migration (dev)
npm run db:migrate:deploy                         # apply migrations (production)
npm run db:generate                               # regenerate Prisma client after schema edit
npm run db:studio                                 # open Prisma Studio GUI
```

## Deployment

The app deploys to Cloudflare Pages via `@cloudflare/next-on-pages`.

```bash
npm run deploy        # build for Cloudflare + deploy via wrangler
npm run preview       # local Cloudflare Pages preview
```

Set `DATABASE_URL` as an environment variable in the Cloudflare Pages dashboard. Run `npm run db:migrate:deploy` separately before deploying if the migration changes the schema.

## Contributing / co-working

This project uses Claude Code for AI-assisted development. Agent foundation files are included:

- **`CLAUDE.md`** — project context loaded automatically at the start of every session.
- **`.claude/commands/`** — custom slash commands:
  - `/add-feature` — step-by-step guide for adding a new feature.
  - `/db-migrate` — safe migration workflow.
  - `/check-game-rules` — verify an implementation against BattleTech Hot Spots rules.
