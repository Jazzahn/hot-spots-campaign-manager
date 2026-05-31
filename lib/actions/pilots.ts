"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { pilots } from "@/lib/schema";
import { eq } from "drizzle-orm";
import type { CreatePilotInput } from "@/types";
import { computePilotStats } from "@/lib/calculations/pilot-handicap";

export async function createPilot(input: CreatePilotInput) {
  const [pilot] = await db
    .insert(pilots)
    .values({
      id: crypto.randomUUID(),
      companyId: input.companyId,
      name: input.name,
      callsign: input.callsign,
      isNamed: input.isNamed ?? true,
      unitId: input.unitId,
      updatedAt: new Date(),
    })
    .returning();
  revalidatePath("/");
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
  const pilot = await db.query.pilots.findFirst({ where: eq(pilots.id, pilotId) });
  if (!pilot) throw new Error("Pilot not found");

  const newSpGunnery = pilot.spGunnery + spGunnery;
  const newSpPiloting = pilot.spPiloting + spPiloting;
  const newSpEdgeTokens = pilot.spEdgeTokens + spEdgeTokens;
  const newSpEdgeAbilities = pilot.spEdgeAbilities + spEdgeAbilities;
  const newTotalSP = pilot.totalSPEarned + spGunnery + spPiloting + spEdgeTokens + spEdgeAbilities;

  const stats = computePilotStats(newSpGunnery, newSpPiloting, newSpEdgeTokens, newSpEdgeAbilities, isAlphaStrike);

  const [updated] = await db
    .update(pilots)
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
      updatedAt: new Date(),
    })
    .where(eq(pilots.id, pilotId))
    .returning();

  revalidatePath("/");
  return updated;
}

export async function healPilot(pilotId: string, woundsHealed: number) {
  const pilot = await db.query.pilots.findFirst({ where: eq(pilots.id, pilotId), columns: { wounds: true } });
  if (!pilot) throw new Error("Pilot not found");
  const [updated] = await db
    .update(pilots)
    .set({ wounds: Math.max(0, pilot.wounds - woundsHealed), updatedAt: new Date() })
    .where(eq(pilots.id, pilotId))
    .returning();
  revalidatePath("/");
  return updated;
}

export async function woundPilot(pilotId: string, wounds: number) {
  const pilot = await db.query.pilots.findFirst({ where: eq(pilots.id, pilotId), columns: { wounds: true } });
  if (!pilot) throw new Error("Pilot not found");
  const [updated] = await db
    .update(pilots)
    .set({ wounds: pilot.wounds + wounds, updatedAt: new Date() })
    .where(eq(pilots.id, pilotId))
    .returning();
  revalidatePath("/");
  return updated;
}

export async function killPilot(pilotId: string) {
  const [updated] = await db
    .update(pilots)
    .set({ isKilled: true, unitId: null, updatedAt: new Date() })
    .where(eq(pilots.id, pilotId))
    .returning();
  revalidatePath("/");
  return updated;
}

export async function addEdgeAbility(pilotId: string, ability: string) {
  const pilot = await db.query.pilots.findFirst({ where: eq(pilots.id, pilotId), columns: { edgeAbilities: true } });
  if (!pilot) throw new Error("Pilot not found");
  const [updated] = await db
    .update(pilots)
    .set({ edgeAbilities: [...pilot.edgeAbilities, ability], updatedAt: new Date() })
    .where(eq(pilots.id, pilotId))
    .returning();
  revalidatePath("/");
  return updated;
}

export async function deletePilot(pilotId: string) {
  await db.delete(pilots).where(eq(pilots.id, pilotId));
  revalidatePath("/");
}
