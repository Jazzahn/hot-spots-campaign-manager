"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { RecordTrackInput } from "@/types";
import { calculateCombatPay } from "@/lib/calculations/combat-pay";
import { computePilotStats } from "@/lib/calculations/pilot-handicap";
import { updateWarchest } from "./campaign";

export async function recordTrack(input: RecordTrackInput, campaignId: string, isAlphaStrike = false) {
  const combatPay = calculateCombatPay(input.result as never, input.scale);

  // Create the track record
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

  // Log combat pay
  if (combatPay > 0) {
    await updateWarchest(
      campaignId,
      combatPay,
      "COMBAT_PAY",
      `Combat Pay — Track ${input.trackNumber} (${input.result})`,
      input.month,
      { contractId: input.contractId, trackId: track.id }
    );
  }

  // Log salvage received
  const totalSalvageSP = input.salvageItems.reduce((sum, s) => sum + s.playerShare, 0);
  if (totalSalvageSP > 0) {
    await updateWarchest(
      campaignId,
      totalSalvageSP,
      "SALVAGE",
      `Salvage — Track ${input.trackNumber}`,
      input.month,
      { contractId: input.contractId, trackId: track.id }
    );
  }

  // Update unit statuses
  for (const ur of input.unitResults) {
    await prisma.unit.update({
      where: { id: ur.unitId },
      data: {
        status: ur.damageResult as never,
        availableNextTrack:
          ur.damageResult !== "CRIPPLED" && ur.damageResult !== "DESTROYED",
      },
    });
  }

  // Allocate SP to named pilots and recompute handicap
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

    if (pr.wasMVP) {
      updateData.mvpCount = { increment: 1 };
    }

    await prisma.pilot.update({ where: { id: pr.pilotId }, data: updateData as never });
  }

  revalidatePath("/contracts");
  revalidatePath(`/contracts/${input.contractId}`);
  return track;
}

export async function recordRepairs(
  campaignId: string,
  contractId: string,
  month: number,
  repairs: { unitId: string; cost: number; description: string }[]
) {
  for (const repair of repairs) {
    await prisma.unit.update({
      where: { id: repair.unitId },
      data: { status: "OPERATIONAL", availableNextTrack: true },
    });
    await updateWarchest(
      campaignId,
      -repair.cost,
      "REPAIR",
      repair.description,
      month,
      { contractId }
    );
  }
  revalidatePath("/force");
}
