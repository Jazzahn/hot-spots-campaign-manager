"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { units, pilots } from "@/lib/schema";
import { eq } from "drizzle-orm";
import type { CreateUnitInput, UnitStatus } from "@/types";

export async function createUnit(input: CreateUnitInput) {
  const [unit] = await db
    .insert(units)
    .values({
      id: crypto.randomUUID(),
      companyId: input.companyId,
      name: input.name,
      chassis: input.chassis,
      model: input.model,
      unitType: input.unitType,
      tonnage: input.tonnage,
      battleValue: input.battleValue,
      pointValue: input.pointValue,
      techBase: input.techBase,
      isOmni: input.isOmni ?? false,
      updatedAt: new Date(),
    })
    .returning();
  revalidatePath("/");
  return unit;
}

export async function updateUnitStatus(unitId: string, status: UnitStatus) {
  const [unit] = await db
    .update(units)
    .set({
      status,
      availableNextTrack: status !== "CRIPPLED" && status !== "DESTROYED",
      updatedAt: new Date(),
    })
    .where(eq(units.id, unitId))
    .returning();
  revalidatePath("/");
  return unit;
}

export async function markUnitRepaired(unitId: string) {
  const [unit] = await db
    .update(units)
    .set({ status: "OPERATIONAL", availableNextTrack: true, updatedAt: new Date() })
    .where(eq(units.id, unitId))
    .returning();
  revalidatePath("/");
  return unit;
}

export async function deleteUnit(unitId: string) {
  await db.delete(units).where(eq(units.id, unitId));
  revalidatePath("/");
}

export async function assignPilotToUnit(pilotId: string, unitId: string | null) {
  const [pilot] = await db
    .update(pilots)
    .set({ unitId, updatedAt: new Date() })
    .where(eq(pilots.id, pilotId))
    .returning();
  revalidatePath("/");
  return pilot;
}
