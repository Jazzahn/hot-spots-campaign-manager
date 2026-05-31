"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { CreateCampaignInput } from "@/types";

export async function createCampaign(input: CreateCampaignInput) {
  const campaign = await prisma.campaign.create({
    data: {
      name: input.name,
      gameRules: input.gameRules,
      background: input.background,
    },
  });
  revalidatePath("/");
  return campaign;
}

export async function getAllCampaigns() {
  return prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { companies: true } },
    },
  });
}

export async function getCampaign(id: string) {
  return prisma.campaign.findUnique({
    where: { id },
    include: {
      companies: {
        orderBy: { createdAt: "asc" },
        include: {
          _count: { select: { units: true, pilots: true, contracts: true } },
        },
      },
    },
  });
}

export async function deleteCampaign(campaignId: string) {
  await prisma.campaign.delete({ where: { id: campaignId } });
  revalidatePath("/");
}

export async function advanceMonth(campaignId: string) {
  await prisma.campaign.update({
    where: { id: campaignId },
    data: { currentMonth: { increment: 1 } },
  });
  revalidatePath(`/${campaignId}`);
}
