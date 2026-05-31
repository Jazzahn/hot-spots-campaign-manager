"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { CreateCampaignInput } from "@/types";

export async function createCampaign(input: CreateCampaignInput) {
  const campaign = await prisma.campaign.create({
    data: {
      name: input.name,
      gameRules: input.gameRules,
      commandType: input.commandType,
      background: input.background,
      parentCommand: input.parentCommand,
      warchest: input.warchest ?? 3000,
      trackingJumps: input.trackingJumps ?? false,
    },
  });

  // Log initial warchest
  await prisma.transaction.create({
    data: {
      campaignId: campaign.id,
      month: 1,
      category: "OTHER",
      amount: campaign.warchest,
      description: "Starting Warchest",
      runningBalance: campaign.warchest,
    },
  });

  revalidatePath("/");
  return campaign;
}

export async function getCampaign(id: string) {
  return prisma.campaign.findUnique({
    where: { id },
    include: {
      units: { orderBy: { createdAt: "asc" } },
      pilots: { include: { unit: true }, orderBy: { createdAt: "asc" } },
      contracts: {
        include: {
          tracks: {
            include: {
              trackUnits: { include: { unit: true } },
              trackPilots: { include: { pilot: true } },
              salvageItems: true,
            },
            orderBy: { trackNumber: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      transactions: { orderBy: { createdAt: "asc" } },
    },
  });
}

export async function getAllCampaigns() {
  return prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { units: true, pilots: true, contracts: true },
      },
    },
  });
}

export async function deleteCampaign(campaignId: string) {
  await prisma.campaign.delete({ where: { id: campaignId } });
  revalidatePath("/");
}

export async function updateReputation(campaignId: string, delta: number) {
  const campaign = await prisma.campaign.update({
    where: { id: campaignId },
    data: { reputation: { increment: delta } },
  });
  revalidatePath("/");
  return campaign;
}

export async function updateWarchest(
  campaignId: string,
  amount: number,
  category: Parameters<typeof prisma.transaction.create>[0]["data"]["category"],
  description: string,
  month: number,
  extra?: { contractId?: string; trackId?: string }
) {
  const campaign = await prisma.campaign.findUniqueOrThrow({
    where: { id: campaignId },
    select: { warchest: true },
  });

  const newBalance = campaign.warchest + amount;

  const [updated] = await prisma.$transaction([
    prisma.campaign.update({
      where: { id: campaignId },
      data: { warchest: newBalance },
    }),
    prisma.transaction.create({
      data: {
        campaignId,
        month,
        category,
        amount,
        description,
        runningBalance: newBalance,
        contractId: extra?.contractId,
        trackId: extra?.trackId,
      },
    }),
  ]);

  revalidatePath("/");
  revalidatePath("/ledger");
  return updated;
}
