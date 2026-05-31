"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { CreateCompanyInput } from "@/types";

export async function createCompany(input: CreateCompanyInput) {
  const company = await prisma.company.create({
    data: {
      campaignId: input.campaignId,
      name: input.name,
      commandType: input.commandType,
      background: input.background,
      parentCommand: input.parentCommand,
      warchest: input.warchest ?? 3000,
      trackingJumps: input.trackingJumps ?? false,
    },
  });

  await prisma.transaction.create({
    data: {
      companyId: company.id,
      month: 1,
      category: "OTHER",
      amount: company.warchest,
      description: "Starting Warchest",
      runningBalance: company.warchest,
    },
  });

  revalidatePath(`/${input.campaignId}`);
  return company;
}

export async function getCompany(id: string) {
  return prisma.company.findUnique({
    where: { id },
    include: {
      campaign: true,
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

export async function deleteCompany(companyId: string) {
  const company = await prisma.company.findUniqueOrThrow({
    where: { id: companyId },
    select: { campaignId: true },
  });
  await prisma.company.delete({ where: { id: companyId } });
  revalidatePath(`/${company.campaignId}`);
}

export async function updateReputation(companyId: string, delta: number) {
  const company = await prisma.company.update({
    where: { id: companyId },
    data: { reputation: { increment: delta } },
    include: { campaign: { select: { id: true } } },
  });
  revalidatePath(`/${company.campaign.id}/${companyId}`);
  return company;
}

export async function updateWarchest(
  companyId: string,
  amount: number,
  category: Parameters<typeof prisma.transaction.create>[0]["data"]["category"],
  description: string,
  month: number,
  extra?: { contractId?: string; trackId?: string }
) {
  const company = await prisma.company.findUniqueOrThrow({
    where: { id: companyId },
    select: { warchest: true, campaignId: true },
  });

  const newBalance = company.warchest + amount;

  const [updated] = await prisma.$transaction([
    prisma.company.update({
      where: { id: companyId },
      data: { warchest: newBalance },
    }),
    prisma.transaction.create({
      data: {
        companyId,
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

  revalidatePath(`/${company.campaignId}/${companyId}`);
  revalidatePath(`/${company.campaignId}/${companyId}/ledger`);
  return updated;
}
