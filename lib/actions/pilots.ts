"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { CreatePilotInput } from "@/types";
import { computePilotStats } from "@/lib/calculations/pilot-handicap";

export async function createPilot(input: CreatePilotInput) {
  const pilot = await prisma.pilot.create({
    data: {
      campaignId: input.campaignId,
      name: input.name,
      callsign: input.callsign,
      isNamed: input.isNamed ?? true,
      unitId: input.unitId,
    },
  });
  revalidatePath("/pilots");
  return pilot;
}

export async function allocatePilotSP(
  pilotId: string,
  spGunnery: number,
  spPiloting: number,
  spEdgeTokens: number,
  spEdgeAbilities: number,
  isAlphaStrike = false
) {
  const pilot = await prisma.pilot.findUniqueOrThrow({ where: { id: pilotId } });

  const newSpGunnery = pilot.spGunnery + spGunnery;
  const newSpPiloting = pilot.spPiloting + spPiloting;
  const newSpEdgeTokens = pilot.spEdgeTokens + spEdgeTokens;
  const newSpEdgeAbilities = pilot.spEdgeAbilities + spEdgeAbilities;
  const newTotalSP = pilot.totalSPEarned + spGunnery + spPiloting + spEdgeTokens + spEdgeAbilities;

  const stats = computePilotStats(
    newSpGunnery,
    newSpPiloting,
    newSpEdgeTokens,
    newSpEdgeAbilities,
    isAlphaStrike
  );

  const updated = await prisma.pilot.update({
    where: { id: pilotId },
    data: {
      spGunnery: newSpGunnery,
      spPiloting: newSpPiloting,
      spEdgeTokens: newSpEdgeTokens,
      spEdgeAbilities: newSpEdgeAbilities,
      totalSPEarned: newTotalSP,
      gunnery: stats.gunnery,
      piloting: stats.piloting,
      edgeTokens: stats.edgeTokens,
      handicap: stats.handicap,
    },
  });

  revalidatePath("/pilots");
  return updated;
}

export async function healPilot(pilotId: string, woundsHealed: number) {
  const pilot = await prisma.pilot.update({
    where: { id: pilotId },
    data: { wounds: { decrement: woundsHealed } },
  });
  revalidatePath("/pilots");
  return pilot;
}

export async function woundPilot(pilotId: string, wounds: number) {
  const pilot = await prisma.pilot.update({
    where: { id: pilotId },
    data: { wounds: { increment: wounds } },
  });
  revalidatePath("/pilots");
  return pilot;
}

export async function killPilot(pilotId: string) {
  const pilot = await prisma.pilot.update({
    where: { id: pilotId },
    data: { isKilled: true, unitId: null },
  });
  revalidatePath("/pilots");
  return pilot;
}

export async function addEdgeAbility(pilotId: string, ability: string) {
  const pilot = await prisma.pilot.findUniqueOrThrow({ where: { id: pilotId } });
  const updated = await prisma.pilot.update({
    where: { id: pilotId },
    data: { edgeAbilities: [...pilot.edgeAbilities, ability] },
  });
  revalidatePath("/pilots");
  return updated;
}

export async function deletePilot(pilotId: string) {
  await prisma.pilot.delete({ where: { id: pilotId } });
  revalidatePath("/pilots");
}
