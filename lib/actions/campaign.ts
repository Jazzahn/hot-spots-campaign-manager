"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { campaigns, companies } from "@/lib/schema";
import { eq, count, desc, sql } from "drizzle-orm";
import type { CreateCampaignInput } from "@/types";
import { getSessionFromCookies } from "@/lib/auth/session";

export async function createCampaign(input: CreateCampaignInput) {
  const session = await getSessionFromCookies();
  const managedById = session.role === "CAMPAIGN_MANAGER" ? session.userId : null;

  const [campaign] = await db
    .insert(campaigns)
    .values({
      id: crypto.randomUUID(),
      name: input.name,
      gameRules: input.gameRules,
      background: input.background,
      managedById,
      inviteKey: crypto.randomUUID(),
      updatedAt: new Date(),
    })
    .returning();
  revalidatePath("/");
  return campaign;
}

export async function getAllCampaigns() {
  const rows = await db
    .select({
      id: campaigns.id,
      name: campaigns.name,
      gameRules: campaigns.gameRules,
      currentMonth: campaigns.currentMonth,
      background: campaigns.background,
      createdAt: campaigns.createdAt,
      updatedAt: campaigns.updatedAt,
      companyCount: count(companies.id),
    })
    .from(campaigns)
    .leftJoin(companies, eq(companies.campaignId, campaigns.id))
    .groupBy(campaigns.id)
    .orderBy(desc(campaigns.createdAt));

  return rows.map((r) => ({
    ...r,
    _count: { companies: Number(r.companyCount) },
  }));
}

export async function getCampaign(id: string) {
  const campaign = await db.query.campaigns.findFirst({
    where: eq(campaigns.id, id),
    with: {
      companies: {
        orderBy: (c, { asc }) => [asc(c.createdAt)],
        with: {
          units: { columns: { id: true } },
          pilots: { columns: { id: true } },
          contracts: { columns: { id: true } },
          user: { columns: { callsign: true } },
        },
      },
    },
  });

  if (!campaign) return null;

  return {
    ...campaign,
    companies: campaign.companies.map((c) => ({
      ...c,
      _count: {
        units: c.units.length,
        pilots: c.pilots.length,
        contracts: c.contracts.length,
      },
    })),
  };
}

export async function deleteCampaign(campaignId: string) {
  await db.delete(campaigns).where(eq(campaigns.id, campaignId));
  revalidatePath("/");
}

export async function advanceMonth(campaignId: string) {
  await db
    .update(campaigns)
    .set({ currentMonth: sql`${campaigns.currentMonth} + 1`, updatedAt: new Date() })
    .where(eq(campaigns.id, campaignId));
  revalidatePath(`/${campaignId}`);
}
