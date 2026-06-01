"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { campaigns, companies, contracts } from "@/lib/schema";
import { eq, count, desc, sql, and, inArray } from "drizzle-orm";
import { HOT_SPOTS_DATA } from "@/lib/constants/hot-spots-data";
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

export async function getCampaignConflicts(campaignId: string) {
  const rows = await db
    .select({
      contractId: contracts.id,
      hotSpot: contracts.hotSpot,
      contractName: contracts.contractName,
      contractType: contracts.contractType,
      status: contracts.status,
      isReady: contracts.isReady,
      conflictMonth: contracts.conflictMonth,
      durationMonths: contracts.durationMonths,
      companyId: companies.id,
      companyName: companies.name,
      companyUserId: companies.userId,
    })
    .from(contracts)
    .innerJoin(companies, eq(contracts.companyId, companies.id))
    .where(
      and(
        eq(companies.campaignId, campaignId),
        inArray(contracts.status, ["ACTIVE", "PENDING"])
      )
    );

  const byHotSpot = new Map<string, typeof rows>();
  for (const row of rows) {
    const list = byHotSpot.get(row.hotSpot) ?? [];
    list.push(row);
    byHotSpot.set(row.hotSpot, list);
  }

  return Array.from(byHotSpot.entries()).map(([hotSpot, entries]) => {
    const hsData = HOT_SPOTS_DATA.find((h) => h.planet === hotSpot || h.name === hotSpot) ?? null;
    const templateA = hsData?.contracts.find((c) => c.side === "A") ?? null;
    const templateB = hsData?.contracts.find((c) => c.side === "B") ?? null;
    const withSides = entries.map((e) => ({
      ...e,
      side: (e.contractName === templateA?.name ? "A" : e.contractName === templateB?.name ? "B" : null) as "A" | "B" | null,
    }));
    const sideA = withSides.filter((e) => e.side === "A");
    const sideB = withSides.filter((e) => e.side === "B");
    const allEntries = [...sideA, ...sideB];
    const isLocked = allEntries.some((e) => e.status === "ACTIVE");
    const currentConflictMonth = isLocked
      ? Math.max(...allEntries.filter((e) => e.status === "ACTIVE").map((e) => e.conflictMonth))
      : 1;
    const maxDurationMonths = isLocked
      ? Math.max(...allEntries.filter((e) => e.status === "ACTIVE").map((e) => e.durationMonths))
      : 0;
    const readyCount = allEntries.filter((e) => e.isReady).length;
    const currentMonthSchedule = hsData?.monthlySchedule?.find((m) => m.month === currentConflictMonth) ?? null;
    return {
      hotSpot,
      hsData,
      sideA,
      sideB,
      templateA,
      templateB,
      opposingSideOptional: templateB?.optional ?? false,
      isLocked,
      currentConflictMonth,
      maxDurationMonths,
      readyCount,
      totalCount: allEntries.length,
      currentMonthSchedule,
    };
  });
}
