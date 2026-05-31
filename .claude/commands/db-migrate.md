# DB Migrate

Use this command when you need to change the Prisma schema and apply a migration safely.

## Before you start

Read `prisma/schema.prisma` in full. Understand which models and enums already exist — avoid duplicating or conflicting with them.

## Safe changes (no data loss risk)
- Adding a new model
- Adding a nullable field (`String?`, `Int?`, `Json?`)
- Adding a new enum value
- Adding a new relation (with `onDelete: Cascade` or `onDelete: SetNull`)

## Risky changes (coordinate with the team)
- Removing a field or model
- Changing a field from nullable to required
- Renaming a field (Prisma treats this as drop + add — data loss)
- Changing a column type

For risky changes: add the new field first (nullable), backfill data with a one-off script, then make it required in a follow-up migration.

## Steps

1. Edit `prisma/schema.prisma`.
2. Run the migration:
   ```bash
   npm run db:migrate:dev -- --name <short-kebab-description>
   ```
3. Prisma regenerates the client automatically (via the `postinstall` script). If it doesn't, run:
   ```bash
   npm run db:generate
   ```
4. Verify TypeScript compiles cleanly — the Prisma client is the source of truth for types.
5. Update any server actions in `lib/actions/` that touch the changed models.

## Production deployment

Migrations are applied in production by running:
```bash
npm run db:migrate:deploy
```
This is separate from `wrangler pages deploy` — run it before deploying the app if the migration is required by the new code.
