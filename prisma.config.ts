import { defineConfig } from "prisma/config";
import { config } from "dotenv";

config({ path: ".env.local" }); // load .env.local for CLI commands (prisma migrate, prisma studio, etc.)

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
