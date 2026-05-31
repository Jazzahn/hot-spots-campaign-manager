"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { tracks, trackUnits, trackPilots, salvageItems, units, pilots, companies } from "@/lib/schema";
import { eq } from "drizzle-orm";
import type { RecordTrackInput, UnitStatus } from "@/types";
import { calculateCombatPay } from "@/lib/calculations/combat-pay";
import { computePilotStats } from "@/lib/calculations/pilot-handicap";
import { updateWarchest } from "./company";

async function getCompanyPath(companyId: string) {
  const c = await db.query.companies.findFirst({
    where: eq(companies.id, companyId),
    columns: { campaignId: true },
  });
  if (!c) throw new Error("Company not found");
  return `/${c.campaignId}/${companyId}`;
}

export async function recordTrack(input: RecordTrackInput, companyId: string, isAlphaStrike = false) {
  const combatPay = calculateCombatPay(input.result as never, input.scale);
  const trackId = crypto.randomUUID();

  await db.insert(tracks).values({
    id: trackId,
    contractId: input.contractId,
    trackNumber: input.trackNumber,
    month: input.month,
    trackType: input.trackType,
    scale: input.scale,
    result: input.result as never,
    playerVP: input.playerVP,
    opponentVP: input.opponentVP,
    combatPay,
    spToNamedPilots: input.pilotResults.reduce((sum, p) => sum + p.spEarned, 0),
    notes: input.notes,
    updatedAt: new Date(),
  });

  if (input.unitResults.length) {
    await db.insert(trackUnits).values(
      input.unitResults.map((u) => ({
        id: crypto.randomUUID(),
        trackId,
        unitId: u.unitId,
        damageResult: u.damageResult as UnitStatus,
        retreated: u.retreated,
      }))
    );
  }

  if (input.pilotResults.length) {
    await db.insert(trackPilots).values(
      input.pilotResults.map((p) => ({
        id: crypto.randomUUID(),
        trackId,
        pilotId: p.pilotId,
        wasMVP: p.wasMVP,
        spEarned: p.spEarned,
        spToGunnery: p.spToGunnery,
        spToPiloting: p.spToPiloting,
        spToEdgeTokens: p.spToEdgeTokens,
        spToEdgeAbilities: p.spToEdgeAbilities,
      }))
    );
  }

  if (input.salvageItems.length) {
    await db.insert(salvageItems).values(
      input.salvageItems.map((s) => ({
        id: crypto.randomUUID(),
        trackId,
        unitName: s.unitName,
        chassis: s.chassis,
        battleValue: s.battleValue,
        salvageValue: s.salvageValue,
        playerShare: s.playerShare,
      }))
    );
  }

  if (combatPay > 0) {
    await updateWarchest(companyId, combatPay, "COMBAT_PAY", `Combat Pay — Track ${input.trackNumber} (${input.result})`, input.month, { contractId: input.contractId, trackId });
  }

  const totalSalvageSP = input.salvageItems.reduce((sum, s) => sum + s.playerShare, 0);
  if (totalSalvageSP > 0) {
    await updateWarchest(companyId, totalSalvageSP, "SALVAGE", `Salvage — Track ${input.trackNumber}`, input.month, { contractId: input.contractId, trackId });
  }

  for (const ur of input.unitResults) {
    await db.update(units)
      .set({
        status: ur.damageResult as UnitStatus,
        availableNextTrack: ur.damageResult !== "CRIPPLED" && ur.damageResult !== "DESTROYED",
        updatedAt: new Date(),
      })
      .where(eq(units.id, ur.unitId));
  }

  for (const pr of input.pilotResults) {
    const pilot = await db.query.pilots.findFirst({ where: eq(pilots.id, pr.pilotId) });
    if (!pilot) continue;

    const newSpGunnery = pilot.spGunnery + pr.spToGunnery;
    const newSpPiloting = pilot.spPiloting + pr.spToPiloting;
    const newSpEdgeTokens = pilot.spEdgeTokens + pr.spToEdgeTokens;
    const newSpEdgeAbilities = pilot.spEdgeAbilities + pr.spToEdgeAbilities;
    const newTotalSP = pilot.totalSPEarned + pr.spEarned;

    const stats = computePilotStats(newSpGunnery, newSpPiloting, newSpEdgeTokens, newSpEdgeAbilities, isAlphaStrike);

    await db.update(pilots)
      .set({
        spGunnery: newSpGunnery,
        spPiloting: newSpPiloting,
        spEdgeTokens: newSpEdgeTokens,
        spEdgeAbilities: newSpEdgeAbilities,
        totalSPEarned: newTotalSP,
        gunnery: stats.gunnery,
        piloting: stats.piloting,
        edgeTokens: stats.edgeTokens,
        handicap: stats.handicap,
        mvpCount: pr.wasMVP ? pilot.mvpCount + 1 : pilot.mvpCount,
        updatedAt: new Date(),
      })
      .where(eq(pilots.id, pr.pilotId));
  }

  const path = await getCompanyPath(companyId);
  revalidatePath(`${path}/contracts`);
  revalidatePath(`${path}/contracts/${input.contractId}`);
  return { id: trackId };
}

export async function recordRepairs(
  companyId: string,
  contractId: string,
  month: number,
  repairs: { unitId: string; cost: number; description: string }[]
) {
  for (const repair of repairs) {
    await db.update(units)
      .set({ status: "OPERATIONAL", availableNextTrack: true, updatedAt: new Date() })
      .where(eq(units.id, repair.unitId));
    await updateWarchest(companyId, -repair.cost, "REPAIR", repair.description, month, { contractId });
  }
  const path = await getCompanyPath(companyId);
  revalidatePath(`${path}/force`);
}
