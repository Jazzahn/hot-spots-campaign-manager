"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { contracts, companies, transactions, campaigns } from "@/lib/schema";
import { eq, and, inArray, sum, sql } from "drizzle-orm";
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

export async function advanceCompanyMonth(contractId: string, campaignCurrentMonth: number) {
  const contract = await db.query.contracts.findFirst({
    where: eq(contracts.id, contractId),
    with: { company: { columns: { campaignId: true } } },
  });
  if (!contract) throw new Error("Contract not found");
  if (contract.status !== "ACTIVE") throw new Error("Contract is not active");
  if (contract.companyMonthReady) throw new Error("Already advanced this month");
  if (contract.conflictMonth >= contract.durationMonths) throw new Error("Contract has reached its final month");

  const campaignId = contract.company!.campaignId;

  await db.update(contracts)
    .set({ companyMonthReady: true, updatedAt: new Date() })
    .where(eq(contracts.id, contractId));

  // Find all active contracts at this hotspot in this campaign
  const allActive = await db.query.contracts.findMany({
    where: and(eq(contracts.status, "ACTIVE"), eq(contracts.hotSpot, contract.hotSpot)),
    with: { company: { columns: { campaignId: true } } },
  });
  const forThisConflict = allActive.filter((c) => c.company?.campaignId === campaignId);

  // Check if all companies in this conflict are now ready (including the one we just updated)
  const allReady = forThisConflict.every((c) =>
    c.id === contractId ? true : c.companyMonthReady
  );

  if (allReady) {
    // Advance the conflict: create pending transactions, increment conflictMonth, set advanced flag
    for (const c of forThisConflict) {
      const scaleData = getScale(c.scale);
      const maintenanceCost = scaleData.maintenanceCost;
      const basePay = Math.floor(maintenanceCost * (c.basePayPct / 100));

      if (basePay > 0) {
        await updateWarchest(c.companyId, basePay, "COMBAT_PAY",
          `Base Pay — Month ${c.conflictMonth} (${c.basePayPct}%)`,
          campaignCurrentMonth, { contractId: c.id, isPending: true });
      }
      await updateWarchest(c.companyId, -maintenanceCost, "MAINTENANCE",
        `Maintenance — Month ${c.conflictMonth} (Scale ${c.scale})`,
        campaignCurrentMonth, { contractId: c.id, isPending: true });

      await db.update(contracts).set({
        conflictMonth: c.conflictMonth + 1,
        companyMonthReady: false,
        conflictAdvancedThisMonth: true,
        updatedAt: new Date(),
      }).where(eq(contracts.id, c.id));
    }

    // Check if ALL active conflicts in the campaign have now advanced
    const allCampaignActive = await db.query.contracts.findMany({
      where: eq(contracts.status, "ACTIVE"),
      with: { company: { columns: { campaignId: true } } },
    });
    const forCampaign = allCampaignActive.filter((c) => c.company?.campaignId === campaignId);

    const justAdvancedIds = new Set(forThisConflict.map((c) => c.id));
    const allConflictsAdvanced = forCampaign.every((c) =>
      justAdvancedIds.has(c.id) ? true : c.conflictAdvancedThisMonth
    );

    if (allConflictsAdvanced && forCampaign.length > 0) {
      // Commit all pending transactions and advance campaign month
      const companyIds = [...new Set(forCampaign.map((c) => c.companyId))];
      for (const cId of companyIds) {
        const [pendingSum] = await db
          .select({ total: sum(transactions.amount) })
          .from(transactions)
          .where(and(eq(transactions.companyId, cId), eq(transactions.isPending, true)));
        const net = Number(pendingSum?.total ?? 0);
        if (net !== 0) {
          await db.update(companies)
            .set({ warchest: sql`${companies.warchest} + ${net}`, updatedAt: new Date() })
            .where(eq(companies.id, cId));
        }
        await db.update(transactions)
          .set({ isPending: false })
          .where(and(eq(transactions.companyId, cId), eq(transactions.isPending, true)));
      }

      await db.update(campaigns)
        .set({ currentMonth: sql`${campaigns.currentMonth} + 1`, updatedAt: new Date() })
        .where(eq(campaigns.id, campaignId));

      await db.update(contracts)
        .set({ conflictAdvancedThisMonth: false, updatedAt: new Date() })
        .where(and(
          eq(contracts.status, "ACTIVE"),
          inArray(contracts.id, forCampaign.map((c) => c.id))
        ));
    }
  }

  // Revalidate all affected paths
  const allCompanyIds = [...new Set(forThisConflict.map((c) => c.companyId)), contract.companyId];
  revalidatePath(`/${campaignId}`);
  for (const cId of allCompanyIds) {
    revalidatePath(`/${campaignId}/${cId}`);
    revalidatePath(`/${campaignId}/${cId}/contracts`);
    revalidatePath(`/${campaignId}/${cId}/contracts/${contractId}`);
    revalidatePath(`/${campaignId}/${cId}/ledger`);
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
