"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { contracts, companies } from "@/lib/schema";
import { eq, and, inArray } from "drizzle-orm";
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

export async function readyUpContract(contractId: string, campaignCurrentMonth: number) {
  const contract = await db.query.contracts.findFirst({
    where: eq(contracts.id, contractId),
    columns: { id: true, companyId: true, hotSpot: true, status: true, scale: true, transportPct: true, durationMonths: true },
    with: { company: { columns: { campaignId: true } } },
  });
  if (!contract) throw new Error("Contract not found");
  if (contract.status !== "PENDING") throw new Error("Contract is not pending");

  await db.update(contracts).set({ isReady: true, updatedAt: new Date() }).where(eq(contracts.id, contractId));

  // Check if ALL pending contracts at this hot spot in this campaign are now ready
  const allAtHotSpot = await db.query.contracts.findMany({
    where: and(
      eq(contracts.hotSpot, contract.hotSpot),
      inArray(contracts.status, ["PENDING"]),
    ),
    with: { company: { columns: { campaignId: true } } },
  });

  const forThisCampaign = allAtHotSpot.filter(
    (c) => c.company?.campaignId === contract.company?.campaignId
  );

  // Re-read to get updated isReady states (including the one we just set)
  const updated = await db.query.contracts.findMany({
    where: and(
      eq(contracts.hotSpot, contract.hotSpot),
      inArray(contracts.status, ["PENDING"]),
    ),
    with: { company: { columns: { campaignId: true } } },
  });
  const forThisCampaignUpdated = updated.filter(
    (c) => c.company?.campaignId === contract.company?.campaignId
  );

  const allReady = forThisCampaignUpdated.length > 0 && forThisCampaignUpdated.every((c) => c.isReady);

  if (allReady) {
    // Activate all contracts at this hot spot simultaneously
    for (const c of forThisCampaignUpdated) {
      const scaleData = getScale(c.scale);
      const transportCost = Math.floor(scaleData.transportCost * (c.transportPct / 100));
      await db.update(contracts).set({
        status: "ACTIVE",
        startMonth: campaignCurrentMonth,
        endMonth: campaignCurrentMonth + c.durationMonths - 1,
        conflictMonth: 1,
        updatedAt: new Date(),
      }).where(eq(contracts.id, c.id));
      if (transportCost > 0) {
        await updateWarchest(c.companyId, -transportCost, "TRANSPORT", "Transport to contract", campaignCurrentMonth, { contractId: c.id });
      }
    }
  }

  const path = await getCompanyPath(contract.companyId);
  revalidatePath(path);
  revalidatePath(`${path}/contracts`);
  revalidatePath(`/${contract.company?.campaignId}`);
}

export async function advanceConflictMonth(hotSpot: string, campaignId: string, campaignCurrentMonth: number) {
  // Find all active contracts at this hot spot in this campaign
  const allActive = await db.query.contracts.findMany({
    where: eq(contracts.status, "ACTIVE"),
    with: { company: { columns: { campaignId: true, id: true } } },
  });
  const forThisConflict = allActive.filter(
    (c) => c.hotSpot === hotSpot && c.company?.campaignId === campaignId
  );
  if (forThisConflict.length === 0) throw new Error("No active contracts found for this conflict");

  // Collect monthly pay for all companies and advance conflict month
  for (const c of forThisConflict) {
    const scaleData = getScale(c.scale);
    const maintenanceCost = scaleData.maintenanceCost;
    const basePay = Math.floor(maintenanceCost * (c.basePayPct / 100));

    if (basePay > 0) {
      await updateWarchest(c.companyId, basePay, "COMBAT_PAY", `Base Pay — Month ${c.conflictMonth} (${c.basePayPct}%)`, campaignCurrentMonth, { contractId: c.id });
    }
    await updateWarchest(c.companyId, -maintenanceCost, "MAINTENANCE", `Maintenance — Month ${c.conflictMonth} (Scale ${c.scale})`, campaignCurrentMonth, { contractId: c.id });
    await db.update(contracts)
      .set({ conflictMonth: c.conflictMonth + 1, updatedAt: new Date() })
      .where(eq(contracts.id, c.id));
  }

  revalidatePath(`/${campaignId}`);
  for (const c of forThisConflict) {
    revalidatePath(`/${campaignId}/${c.companyId}/contracts`);
    revalidatePath(`/${campaignId}/${c.companyId}`);
  }
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

export async function cancelContractAsManager(contractId: string) {
  const contract = await db.query.contracts.findFirst({
    where: eq(contracts.id, contractId),
    columns: { id: true, status: true, companyId: true, hotSpot: true },
    with: {
      tracks: { columns: { id: true } },
      company: { columns: { campaignId: true } },
    },
  });
  if (!contract) throw new Error("Contract not found");

  if (contract.status === "PENDING") {
    await db.delete(contracts).where(eq(contracts.id, contractId));
  } else if (contract.status === "ACTIVE") {
    await db.update(contracts).set({ status: "BROKEN", updatedAt: new Date() }).where(eq(contracts.id, contractId));
  } else {
    throw new Error("Contract is already completed or broken");
  }

  const path = await getCompanyPath(contract.companyId);
  revalidatePath(path);
  revalidatePath(`${path}/contracts`);
  if (contract.company?.campaignId) revalidatePath(`/${contract.company.campaignId}`);
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
