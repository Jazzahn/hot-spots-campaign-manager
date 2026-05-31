# Hot Spots Campaign Manager — Agent Foundation

## Project Overview

A BattleTech **Hot Spots** mercenary campaign tracker built with Next.js 15 and deployed to Cloudflare Pages. Players manage a mercenary command across multiple campaigns, tracking mechs (units), pilots, contracts, tracks (missions), and a running financial ledger (warchest).

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router), React 19 |
| Database | PostgreSQL via Neon (serverless HTTP) |
| ORM | Prisma 7 with `@prisma/adapter-neon` |
| UI | Radix UI primitives + Tailwind CSS (shadcn-style components in `components/ui/`) |
| Deployment | Cloudflare Pages via `@cloudflare/next-on-pages` |
| Language | TypeScript (strict) |

## Data Model Hierarchy

```
Campaign  (overarching — shared by all players)
  ├── gameRules, currentMonth, background
  └── Company[]  (one per player — their mercenary command)
        ├── warchest, reputation, scale, commandType
        ├── Unit[]
        ├── Pilot[]
        ├── Contract[] → Track[]
        └── Transaction[]
```

## Project Structure

```
app/
  page.tsx                              # Campaigns list
  [campaignId]/
    layout.tsx                          # Campaign breadcrumb header
    page.tsx                            # Campaign overview (list of companies)
    [companyId]/
      layout.tsx                        # Company nav shell (force/pilots/contracts/ledger)
      page.tsx                          # Company dashboard
      force/page.tsx
      pilots/page.tsx
      contracts/page.tsx
      contracts/[contractId]/page.tsx
      ledger/page.tsx
components/
  ui/                       # Shared primitives (Button, Card, Badge, etc.)
  NewCampaignForm.tsx       # Creates overarching Campaign
  NewCompanyForm.tsx        # Creates Company within a Campaign
  DeleteCampaignButton.tsx
  DeleteCompanyButton.tsx
  force/                    # Unit-domain components
  pilots/                   # Pilot-domain components
  contracts/                # Contract-domain components
  tracks/                   # Track-domain components
lib/
  actions/                  # Server Actions ("use server")
    campaign.ts             # Campaign-level CRUD (createCampaign, getAllCampaigns, advanceMonth)
    company.ts              # Company-level CRUD + updateWarchest
    contracts.ts
    pilots.ts
    tracks.ts
    units.ts
  calculations/             # Pure game-rule math
  constants/
    scales.ts               # Force scale limits & costs
  db.ts                     # Prisma singleton (Neon adapter)
  utils.ts                  # formatSP, formatBV, cn()
prisma/
  schema.prisma             # Single source of truth for all models
  migrations/               # Migration history
types/
  index.ts                  # Shared TypeScript types (inputs, etc.)
```

## Architecture Rules

**Server Actions, not API routes.** All data mutations go through `lib/actions/` files marked `"use server"`. Never create `app/api/` routes for data operations.

**Pages fetch their own data.** App Router pages are async Server Components that call actions directly — no `useEffect`, no client-side fetching.

**Client components are narrow.** Mark `"use client"` only when you need interactivity (forms, dialogs, transitions). Use `useTransition` + server actions for pending states.

**Prisma transactions for atomicity.** Any operation that modifies both a model and creates a `Transaction` record (warchest changes) must use `prisma.$transaction([...])`. Always call `revalidatePath()` after mutations.

**`@` alias for all imports.** Use `@/lib/...`, `@/components/...`, `@/types`, etc. Never use relative paths that traverse upward.

## Game Domain Knowledge

- **Campaign** — the overarching game. Owns `gameRules`, `currentMonth`, and `background` (world lore). All companies in a campaign share these.
- **Company** — one player's mercenary command. Has its own `warchest`, `reputation`, `scale`, and roster.
- **SP (Support Points)** — in-game currency stored as integers (C-Bills at scale). Negative SP = debt.
- **BV (Battle Value)** — numerical power rating of a unit. Total force BV must stay under the scale limit.
- **Scale (1–4)** — determines BV limit, maintenance cost, and contract availability. Defined in `lib/constants/scales.ts`.
- **Named Pilots (max 4)** — earn Skill Points (spEarned) from tracks; invested into gunnery, piloting, edge tokens, or edge abilities.
- **Tracks** — individual missions within a contract. Each track records unit damage, pilot performance, salvage, and combat pay.
- **Warchest** — running balance per Company. Every change creates a `Transaction` row. The ledger is append-only; never delete transactions.
- **Enums** — all game-state enums live in `prisma/schema.prisma` and are imported from `@prisma/client`. Never redefine them in TypeScript.

## Common Workflows

### Adding a new feature

1. Update `prisma/schema.prisma` if data model changes are needed.
2. Run `npm run db:migrate:dev -- --name <description>` to generate a migration.
3. Add/update a server action in `lib/actions/`.
4. Build UI components in the appropriate `components/<domain>/` folder.
5. Wire up the page in `app/[campaignId]/<section>/`.

### Running the dev server

```bash
npm run dev      # local Next.js dev server (uses DATABASE_URL from .env.local)
```

### Database migrations

```bash
npm run db:migrate:dev -- --name <description>   # create + apply migration
npm run db:migrate:deploy                         # apply in production
npm run db:generate                               # regenerate Prisma client after schema edit
npm run db:studio                                 # Prisma Studio GUI
```

### Deploying

```bash
npm run deploy   # builds for Cloudflare Pages + deploys via wrangler
```

## Environment Variables

Copy `.env.example` to `.env.local`. Required:

- `DATABASE_URL` — Neon connection string (pooled, HTTP mode)

## Conventions

- No comments unless the WHY is non-obvious (a subtle invariant, a game-rule quirk).
- Amounts are always integers. `formatSP()` and `formatBV()` in `lib/utils.ts` handle display formatting.
- Tailwind only — no CSS modules, no inline styles.
- Component files: PascalCase. Utility files: camelCase. Action files: camelCase.
- Keep domain logic (game math) in `lib/calculations/`, not inside components or actions.
