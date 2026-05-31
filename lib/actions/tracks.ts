"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { RecordTrackInput } from "@/types";
import { calculateCombatPay } from "@/lib/calculations/combat-pay";
import { computePilotStats } from "@/lib/calculations/pilot-handicap";
import { updateWarchest } from "./company";

async function getCompanyPath(companyId: string) {
  const c = await prisma.company.findUniqueOrThrow({
    where: { id: companyId },
    select: { campaignId: true },
  });
  return `/${c.campaignId}/${companyId}`;
}

export async function recordTrack(input: RecordTrackInput, companyId: string, isAlphaStrike = false) {
  const combatPay = calculateCombatPay(input.result as never, input.scale);

  const track = await prisma.track.create({
    data: {
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
      trackUnits: {
        create: input.unitResults.map((u) => ({
          unitId: u.unitId,
          damageResult: u.damageResult as never,
          retreated: u.retreated,
        })),
      },
      trackPilots: {
        create: input.pilotResults.map((p) => ({
          pilotId: p.pilotId,
          wasMVP: p.wasMVP,
          spEarned: p.spEarned,
          spToGunnery: p.spToGunnery,
          spToPiloting: p.spToPiloting,
          spToEdgeTokens: p.spToEdgeTokens,
          spToEdgeAbilities: p.spToEdgeAbilities,
        })),
      },
      salvageItems: {
        create: input.salvageItems.map((s) => ({
          unitName: s.unitName,
          chassis: s.chassis,
          battleValue: s.battleValue,
          salvageValue: s.salvageValue,
          playerShare: s.playerShare,
        })),
      },
    },
  });

  if (combatPay > 0) {
    await updateWarchest(
      companyId,
      combatPay,
      "COMBAT_PAY",
      `Combat Pay — Track ${input.trackNumber} (${input.result})`,
      input.month,
      { contractId: input.contractId, trackId: track.id }
    );
  }

  const totalSalvageSP = input.salvageItems.reduce((sum, s) => sum + s.playerShare, 0);
  if (totalSalvageSP > 0) {
    await updateWarchest(
      companyId,
      totalSalvageSP,
      "SALVAGE",
      `Salvage — Track ${input.trackNumber}`,
      input.month,
      { contractId: input.contractId, trackId: track.id }
    );
  }

  for (const ur of input.unitResults) {
    await prisma.unit.update({
      where: { id: ur.unitId },
      data: {
        status: ur.damageResult as never,
        availableNextTrack: ur.damageResult !== "CRIPPLED" && ur.damageResult !== "DESTROYED",
      },
    });
  }

  for (const pr of input.pilotResults) {
    const pilot = await prisma.pilot.findUniqueOrThrow({ where: { id: pr.pilotId } });

    const newSpGunnery = pilot.spGunnery + pr.spToGunnery;
    const newSpPiloting = pilot.spPiloting + pr.spToPiloting;
    const newSpEdgeTokens = pilot.spEdgeTokens + pr.spToEdgeTokens;
    const newSpEdgeAbilities = pilot.spEdgeAbilities + pr.spToEdgeAbilities;
    const newTotalSP = pilot.totalSPEarned + pr.spEarned;

    const stats = computePilotStats(
      newSpGunnery,
      newSpPiloting,
      newSpEdgeTokens,
      newSpEdgeAbilities,
      isAlphaStrike
    );

    const updateData: Record<string, unknown> = {
      spGunnery: newSpGunnery,
      spPiloting: newSpPiloting,
      spEdgeTokens: newSpEdgeTokens,
      spEdgeAbilities: newSpEdgeAbilities,
      totalSPEarned: newTotalSP,
      gunnery: stats.gunnery,
      piloting: stats.piloting,
      edgeTokens: stats.edgeTokens,
      handicap: stats.handicap,
    };

    if (pr.wasMVP) updateData.mvpCount = { increment: 1 };

    await prisma.pilot.update({ where: { id: pr.pilotId }, data: updateData as never });
  }

  const path = await getCompanyPath(companyId);
  revalidatePath(`${path}/contracts`);
  revalidatePath(`${path}/contracts/${input.contractId}`);
  return track;
}

export async function recordRepairs(
  companyId: string,
  contractId: string,
  month: number,
  repairs: { unitId: string; cost: number; description: string }[]
) {
  for (const repair of repairs) {
    await prisma.unit.update({
      where: { id: repair.unitId },
      data: { status: "OPERATIONAL", availableNextTrack: true },
    });
    await updateWarchest(companyId, -repair.cost, "REPAIR", repair.description, month, { contractId });
  }
  const path = await getCompanyPath(companyId);
  revalidatePath(`${path}/force`);
}
