import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type Db = ReturnType<typeof drizzle<typeof schema>>;

// Lazy initialization — neon() throws if DATABASE_URL is absent, which happens
// during Next.js build-time route collection. Defer creation until first use.
let _db: Db | undefined;

function instance(): Db {
  return (_db ??= drizzle(neon(process.env.DATABASE_URL!), { schema }));
}

export const db = new Proxy({} as Db, {
  get(_, prop: string | symbol) {
    return (instance() as never as Record<string | symbol, unknown>)[prop];
  },
});
