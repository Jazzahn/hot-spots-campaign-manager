# Check Game Rules

Use this command to verify that a piece of game logic correctly implements the BattleTech Hot Spots rules before shipping it.

## What to check

### Force limits
- BV limit per scale is defined in `lib/constants/scales.ts`. Never hardcode BV limits inline.
- Scale 1: 6,500 BV · Scale 2: 10,000 BV · Scale 3: 14,000 BV · Scale 4: 20,000 BV (verify in `scales.ts` — these may have been updated).

### Pilot skill points (SP)
- Named pilots earn SP from tracks (`TrackPilot.spEarned`).
- SP costs for advancement: gunnery improvement costs more than piloting. Check `lib/calculations/` for the formula before implementing new SP logic.
- Max 4 named pilots per campaign at any time.
- `edgeTokens` are refreshed per track; `edgeAbilities` are permanent unlocks.

### Warchest / ledger
- Every C-Bill change — pay, salvage, maintenance, repairs — must create a `Transaction` row via `updateWarchest()` in `lib/actions/campaign.ts`.
- Monthly maintenance is deducted at the end of each month regardless of contract status.
- Debt accrues interest; check `scales.ts` for the debt interest rate.

### Contracts and tracks
- A campaign may only have one `ACTIVE` contract at a time. Enforce this in the action before setting `status: "ACTIVE"`.
- Contract `endMonth = startMonth + durationMonths - 1`.
- Combat pay per track is calculated from `Track.combatPay`, which comes from the contract's `basePayPct` applied to the scale's base payment.

### Salvage
- Salvage split: `playerShare = Math.floor(battleValue * (salvageRightsPct / 100))`.
- Salvage items must be claimed (`wasClaimed`) or rejected (`wasRejected`) before a track is considered fully resolved.

### Unit status
Progression: `OPERATIONAL → ARMOR_DAMAGE → STRUCTURE_CRIT → CRIPPLED → DESTROYED → TRULY_DESTROYED`.
- `TRULY_DESTROYED` units are removed from the available force.
- `DESTROYED` units may be salvaged/recovered (check campaign rules).

## Process

1. Read the relevant section of the Prisma schema and the related server action.
2. Cross-check against the rules above.
3. Check `lib/calculations/` for any existing helper that already implements the math.
4. If the implementation is wrong, fix the server action or calculation — not the UI. Game rules live in `lib/`, not in components.
5. After fixing, test via the UI: create a track, record the result, and verify the ledger and pilot SP reflect the expected values.
