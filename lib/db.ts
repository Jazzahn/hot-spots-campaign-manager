import { PrismaNeonHttp } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client/edge";

export const prisma = new PrismaClient({
  adapter: new PrismaNeonHttp(process.env.DATABASE_URL!),
  log: ["error"],
});
