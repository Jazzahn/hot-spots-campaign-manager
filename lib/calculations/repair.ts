import { UnitStatus, UnitType, TechBase } from "@prisma/client";
import {
  REPAIR_COSTS,
  CLAN_REPAIR_MULTIPLIER,
  VEHICLE_BA_REPAIR_DIVISOR,
} from "@/lib/constants/sp-costs";

export function calculateRepairCost(
  status: UnitStatus,
  tonnage: number,
  techBase: TechBase,
  unitType: UnitType
): number {
  if (status === "OPERATIONAL" || status === "TRULY_DESTROYED") return 0;

  let baseCost: number;
  switch (status) {
    case "ARMOR_DAMAGE":
      baseCost = REPAIR_COSTS.ARMOR_DAMAGE(tonnage);
      break;
    case "STRUCTURE_CRIT":
      baseCost = REPAIR_COSTS.STRUCTURE_CRIT(tonnage);
      break;
    case "CRIPPLED":
      baseCost = REPAIR_COSTS.CRIPPLED(tonnage);
      break;
    case "DESTROYED":
      baseCost = REPAIR_COSTS.DESTROYED(tonnage);
      break;
    default:
      return 0;
  }

  // Vehicles and battle armor halve repair costs (round up)
  if (unitType === "COMBAT_VEHICLE" || unitType === "BATTLE_ARMOR") {
    baseCost = Math.ceil(baseCost / VEHICLE_BA_REPAIR_DIVISOR);
  }

  // Clan or Mixed tech multiplies by 1.5 (round up)
  if (techBase === "CLAN" || techBase === "MIXED") {
    baseCost = Math.ceil(baseCost * CLAN_REPAIR_MULTIPLIER);
  }

  return baseCost;
}

export function getRepairLabel(status: UnitStatus): string {
  switch (status) {
    case "ARMOR_DAMAGE":
      return "Armor Only";
    case "STRUCTURE_CRIT":
      return "Structure/Critical";
    case "CRIPPLED":
      return "Crippled";
    case "DESTROYED":
      return "Destroyed";
    case "TRULY_DESTROYED":
      return "Truly Destroyed (cannot repair)";
    default:
      return "Operational";
  }
}
