"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { contracts, companies } from "@/lib/schema";
import { eq } from "drizzle-orm";
import type { CreateContractInput } from "@/types";
import { updateWarchest } from "./company";
import { getScale } from "@/lib/constants/scales";

async function getCompanyPath(companyId: string) {
  const c = await db.query.companies.findFirst({
    where: eq(companies.id, companyId),
    columns: { campaignId: true },
  });
  if (!c) throw new Error("Company not found");
  return `/${c.campaignId}/${companyId}`;
}

export async function createContract(input: CreateContractInput) {
  const [contract] = await db
    .insert(contracts)
    .values({
      id: crypto.randomUUID(),
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
      updatedAt: new Date(),
    })
    .returning();

  const path = await getCompanyPath(input.companyId);
  revalidatePath(`${path}/contracts`);
  return contract;
}

export async function activateContract(contractId: string, startMonth: number) {
  const contract = await db.query.contracts.findFirst({
    where: eq(contracts.id, contractId),
    columns: { companyId: true, scale: true, transportPct: true, durationMonths: true },
  });
  if (!contract) throw new Error("Contract not found");

  const scaleData = getScale(contract.scale);
  const transportCost = Math.floor(scaleData.transportCost * (contract.transportPct / 100));

  await db
    .update(contracts)
    .set({
      status: "ACTIVE",
      startMonth,
      endMonth: startMonth + contract.durationMonths - 1,
      updatedAt: new Date(),
    })
    .where(eq(contracts.id, contractId));

  if (transportCost > 0) {
    await updateWarchest(contract.companyId, -transportCost, "TRANSPORT", "Transport to contract", startMonth, { contractId });
  }

  const path = await getCompanyPath(contract.companyId);
  revalidatePath(`${path}/contracts`);
}

export async function collectMonthlyBasePay(contractId: string, month: number) {
  const contract = await db.query.contracts.findFirst({
    where: eq(contracts.id, contractId),
    columns: { companyId: true, scale: true, basePayPct: true },
  });
  if (!contract) throw new Error("Contract not found");

  const scaleData = getScale(contract.scale);
  const maintenanceCost = scaleData.maintenanceCost;
  const basePay = Math.floor(maintenanceCost * (contract.basePayPct / 100));
  const net = basePay - maintenanceCost;

  if (basePay > 0) {
    await updateWarchest(contract.companyId, basePay, "COMBAT_PAY", `Base Pay (${contract.basePayPct}%)`, month, { contractId });
  }
  await updateWarchest(contract.companyId, -maintenanceCost, "MAINTENANCE", `Monthly Maintenance (Scale ${contract.scale})`, month, { contractId });

  return { maintenanceCost, basePay, net };
}

export async function completeContract(contractId: string, success: boolean) {
  const contract = await db.query.contracts.findFirst({
    where: eq(contracts.id, contractId),
    columns: { companyId: true },
  });
  if (!contract) throw new Error("Contract not found");

  await db.update(contracts).set({ status: "COMPLETED", updatedAt: new Date() }).where(eq(contracts.id, contractId));

  if (success) {
    const company = await db.query.companies.findFirst({
      where: eq(companies.id, contract.companyId),
      columns: { reputation: true },
    });
    if (company) {
      await db.update(companies)
        .set({ reputation: company.reputation + 1, updatedAt: new Date() })
        .where(eq(companies.id, contract.companyId));
    }
  }

  const path = await getCompanyPath(contract.companyId);
  revalidatePath(`${path}/contracts`);
}

export async function breakContract(contractId: string, escapeClause: boolean) {
  const contract = await db.query.contracts.findFirst({
    where: eq(contracts.id, contractId),
    columns: { companyId: true },
  });
  if (!contract) throw new Error("Contract not found");

  const company = await db.query.companies.findFirst({
    where: eq(companies.id, contract.companyId),
    columns: { reputation: true },
  });

  await db.update(contracts).set({ status: "BROKEN", updatedAt: new Date() }).where(eq(contracts.id, contractId));

  if (company) {
    const repLoss = escapeClause ? -1 : -3;
    await db.update(companies)
      .set({ reputation: company.reputation + repLoss, updatedAt: new Date() })
      .where(eq(companies.id, contract.companyId));
  }

  const path = await getCompanyPath(contract.companyId);
  revalidatePath(`${path}/contracts`);
}

export async function leaveConflict(contractId: string) {
  const contract = await db.query.contracts.findFirst({
    where: eq(contracts.id, contractId),
    columns: { id: true, status: true, companyId: true },
    with: { tracks: { columns: { id: true } } },
  });
  if (!contract) throw new Error("Contract not found");
  if (contract.status !== "PENDING") throw new Error("Can only leave a pending contract");
  if (contract.tracks.length > 0) throw new Error("Cannot leave a contract with tracks");

  await db.delete(contracts).where(eq(contracts.id, contractId));
  const path = await getCompanyPath(contract.companyId);
  revalidatePath(path);
  revalidatePath(`${path}/contracts`);
}

export async function getContractDetail(contractId: string) {
  return db.query.contracts.findFirst({
    where: eq(contracts.id, contractId),
    with: {
      company: {
        with: {
          units: true,
          pilots: { with: { unit: true } },
        },
      },
      tracks: {
        with: {
          trackUnits: { with: { unit: true } },
          trackPilots: { with: { pilot: true } },
          salvageItems: true,
        },
        orderBy: (t, { asc }) => [asc(t.trackNumber)],
      },
    },
  });
}
