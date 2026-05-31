# Add Feature

Follow this sequence when adding any new feature to the campaign manager. Skip steps that don't apply to the change.

## Steps

### 1. Understand the game rule
Before touching code, confirm the game mechanic being implemented. Check `prisma/schema.prisma` for existing enums and models that cover the domain. Check `lib/constants/scales.ts` and `lib/calculations/` for existing game-rule math.

### 2. Schema changes (if needed)
Edit `prisma/schema.prisma`. Then:
```bash
npm run db:migrate:dev -- --name <short-description>
```
The migration generates and applies automatically. If you only add nullable fields or new models (no breaking changes), existing data is safe.

### 3. Server action
Add or update the relevant file in `lib/actions/`. Rules:
- Top of file must be `"use server"`.
- Warchest mutations: always use `prisma.$transaction([...])` and create a `Transaction` row.
- Call `revalidatePath(...)` on any path that displays the changed data.
- Never add API routes — server actions are the only mutation layer.

### 4. Types (if needed)
Add input types to `types/index.ts`. Do not redefine Prisma enums — import them from `@prisma/client`.

### 5. Components
Create components in `components/<domain>/`. Mark `"use client"` only when interactivity is required. Use `useTransition` for form submissions that call server actions:
```tsx
const [isPending, startTransition] = useTransition();
startTransition(async () => { await myAction(data); });
```

### 6. Page
Wire up in `app/[campaignId]/<section>/page.tsx`. The page should be an async Server Component that fetches data at the top, then passes it to components. Never fetch inside a `useEffect`.

### 7. Verify
- Run `npm run dev` and test the happy path.
- Check that amounts format correctly with `formatSP()` / `formatBV()`.
- Check the ledger tab if any warchest changes were made — every SP in/out must appear as a transaction.
