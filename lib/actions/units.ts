"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { CreateUnitInput } from "@/types";
import type { UnitStatus } from "@prisma/client";

export async function createUnit(input: CreateUnitInput) {
  const unit = await prisma.unit.create({ data: input });
  revalidatePath("/force");
  return unit;
}

export async function updateUnitStatus(unitId: string, status: UnitStatus) {
  const unit = await prisma.unit.update({
    where: { id: unitId },
    data: {
      status,
      availableNextTrack: status !== "CRIPPLED" && status !== "DESTROYED",
    },
  });
  revalidatePath("/force");
  return unit;
}

export async function markUnitRepaired(unitId: string) {
  const unit = await prisma.unit.update({
    where: { id: unitId },
    data: { status: "OPERATIONAL", availableNextTrack: true },
  });
  revalidatePath("/force");
  return unit;
}

export async function deleteUnit(unitId: string) {
  await prisma.unit.delete({ where: { id: unitId } });
  revalidatePath("/force");
}

export async function assignPilotToUnit(pilotId: string, unitId: string | null) {
  const pilot = await prisma.pilot.update({
    where: { id: pilotId },
    data: { unitId },
  });
  revalidatePath("/force");
  revalidatePath("/pilots");
  return pilot;
}
