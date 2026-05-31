"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { CreateContractInput } from "@/types";
import { updateWarchest } from "./campaign";
import { getScale } from "@/lib/constants/scales";

export async function createContract(input: CreateContractInput) {
  const contract = await prisma.contract.create({
    data: {
      campaignId: input.campaignId,
      hotSpot: input.hotSpot,
      contractName: input.contractName,
      contractType: input.contractType as never,
      scale: input.scale,
      durationMonths: input.durationMonths,
      basePayPct: input.basePayPct,
      supportType: input.supportType as never,
      supportPct: input.supportPct,
      salvageRightsPct: input.salvageRightsPct,
      commandRights: input.commandRights as never,
      transportPct: input.transportPct,
    },
  });
  revalidatePath("/contracts");
  return contract;
}

export async function activateContract(
  contractId: string,
  startMonth: number
) {
  const contract = await prisma.contract.findUniqueOrThrow({
    where: { id: contractId },
    select: {
      campaignId: true,
      scale: true,
      transportPct: true,
      id: true,
    },
  });

  const scaleData = getScale(contract.scale);
  const transportCost = Math.floor(
    scaleData.transportCost * (contract.transportPct / 100)
  );

  await prisma.contract.update({
    where: { id: contractId },
    data: {
      status: "ACTIVE",
      startMonth,
      endMonth: startMonth + (await prisma.contract.findUniqueOrThrow({ where: { id: contractId }, select: { durationMonths: true } })).durationMonths - 1,
    },
  });

  // Charge transport costs
  if (transportCost > 0) {
    await updateWarchest(
      contract.campaignId,
      -transportCost,
      "TRANSPORT",
      `Transport to contract`,
      startMonth,
      { contractId }
    );
  }

  revalidatePath("/contracts");
}

export async function collectMonthlyBasePay(
  contractId: string,
  month: number
) {
  const contract = await prisma.contract.findUniqueOrThrow({
    where: { id: contractId },
    select: { campaignId: true, scale: true, basePayPct: true, id: true },
  });

  const scaleData = getScale(contract.scale);
  const maintenanceCost = scaleData.maintenanceCost;
  const basePay = Math.floor(maintenanceCost * (contract.basePayPct / 100));
  const shortfall = maintenanceCost - basePay;

  // Record base pay received
  if (basePay > 0) {
    await updateWarchest(
      contract.campaignId,
      basePay,
      "COMBAT_PAY",
      `Base Pay (${contract.basePayPct}%)`,
      month,
      { contractId }
    );
  }

  // Charge maintenance
  await updateWarchest(
    contract.campaignId,
    -maintenanceCost,
    "MAINTENANCE",
    `Monthly Maintenance (Scale ${contract.scale})`,
    month,
    { contractId }
  );

  return { maintenanceCost, basePay, shortfall };
}

export async function completeContract(contractId: string, success: boolean) {
  await prisma.contract.update({
    where: { id: contractId },
    data: { status: "COMPLETED" },
  });

  if (success) {
    const contract = await prisma.contract.findUniqueOrThrow({
      where: { id: contractId },
      select: { campaignId: true },
    });
    await prisma.campaign.update({
      where: { id: contract.campaignId },
      data: { reputation: { increment: 1 } },
    });
  }

  revalidatePath("/contracts");
}

export async function breakContract(contractId: string, escapeClause: boolean) {
  const contract = await prisma.contract.findUniqueOrThrow({
    where: { id: contractId },
    select: { campaignId: true },
  });

  await prisma.contract.update({
    where: { id: contractId },
    data: { status: "BROKEN" },
  });

  const repLoss = escapeClause ? -1 : -3;
  await prisma.campaign.update({
    where: { id: contract.campaignId },
    data: { reputation: { increment: repLoss } },
  });

  revalidatePath("/contracts");
}
