"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { CreateContractInput } from "@/types";
import { updateWarchest } from "./company";
import { getScale } from "@/lib/constants/scales";

async function getCompanyPath(companyId: string) {
  const c = await prisma.company.findUniqueOrThrow({
    where: { id: companyId },
    select: { campaignId: true },
  });
  return `/${c.campaignId}/${companyId}`;
}

export async function createContract(input: CreateContractInput) {
  const contract = await prisma.contract.create({
    data: {
      companyId: input.companyId,
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
  const path = await getCompanyPath(input.companyId);
  revalidatePath(`${path}/contracts`);
  return contract;
}

export async function activateContract(contractId: string, startMonth: number) {
  const contract = await prisma.contract.findUniqueOrThrow({
    where: { id: contractId },
    select: { companyId: true, scale: true, transportPct: true, durationMonths: true, id: true },
  });

  const scaleData = getScale(contract.scale);
  const transportCost = Math.floor(scaleData.transportCost * (contract.transportPct / 100));

  await prisma.contract.update({
    where: { id: contractId },
    data: {
      status: "ACTIVE",
      startMonth,
      endMonth: startMonth + contract.durationMonths - 1,
    },
  });

  if (transportCost > 0) {
    await updateWarchest(
      contract.companyId,
      -transportCost,
      "TRANSPORT",
      `Transport to contract`,
      startMonth,
      { contractId }
    );
  }

  const path = await getCompanyPath(contract.companyId);
  revalidatePath(`${path}/contracts`);
}

export async function collectMonthlyBasePay(contractId: string, month: number) {
  const contract = await prisma.contract.findUniqueOrThrow({
    where: { id: contractId },
    select: { companyId: true, scale: true, basePayPct: true, id: true },
  });

  const scaleData = getScale(contract.scale);
  const maintenanceCost = scaleData.maintenanceCost;
  const basePay = Math.floor(maintenanceCost * (contract.basePayPct / 100));
  const shortfall = maintenanceCost - basePay;

  if (basePay > 0) {
    await updateWarchest(
      contract.companyId,
      basePay,
      "COMBAT_PAY",
      `Base Pay (${contract.basePayPct}%)`,
      month,
      { contractId }
    );
  }

  await updateWarchest(
    contract.companyId,
    -maintenanceCost,
    "MAINTENANCE",
    `Monthly Maintenance (Scale ${contract.scale})`,
    month,
    { contractId }
  );

  return { maintenanceCost, basePay, shortfall };
}

export async function completeContract(contractId: string, success: boolean) {
  const contract = await prisma.contract.findUniqueOrThrow({
    where: { id: contractId },
    select: { companyId: true },
  });

  await prisma.contract.update({
    where: { id: contractId },
    data: { status: "COMPLETED" },
  });

  if (success) {
    await prisma.company.update({
      where: { id: contract.companyId },
      data: { reputation: { increment: 1 } },
    });
  }

  const path = await getCompanyPath(contract.companyId);
  revalidatePath(`${path}/contracts`);
}

export async function breakContract(contractId: string, escapeClause: boolean) {
  const contract = await prisma.contract.findUniqueOrThrow({
    where: { id: contractId },
    select: { companyId: true },
  });

  await prisma.contract.update({
    where: { id: contractId },
    data: { status: "BROKEN" },
  });

  const repLoss = escapeClause ? -1 : -3;
  await prisma.company.update({
    where: { id: contract.companyId },
    data: { reputation: { increment: repLoss } },
  });

  const path = await getCompanyPath(contract.companyId);
  revalidatePath(`${path}/contracts`);
}
