// Dobless Information Services — Random Contract tables (Hot Spots: Draconis Reach).
// All "Step N" references map onto the shared Contract Steps Table in contract-steps.ts.

import type { TermKey } from "@/lib/calculations/contract-negotiation";

export type HiringHall = "TYBALT" | "PROSERPINA";
export type PrimaryType = "EXPEDITION" | "GARRISON" | "RAID" | "INVASION";

export type Employer =
  | "CIVILIAN"
  | "PLANETARY_GOV"
  | "MERC_SUBCONTRACT"
  | "CORPORATION"
  | "HOUSE_GOV"
  | "NOBLE";

export const HIRING_HALL_LABELS: Record<HiringHall, string> = {
  TYBALT: "Tybalt Hiring Hall",
  PROSERPINA: "Proserpina Hiring Hall",
};

export const EMPLOYER_LABELS: Record<Employer, string> = {
  CIVILIAN: "Civilian organization",
  PLANETARY_GOV: "Planetary Government",
  MERC_SUBCONTRACT: "Mercenary subcontract",
  CORPORATION: "Corporation",
  HOUSE_GOV: "House Government",
  NOBLE: "Noble (local)",
};

// Hiring-hall modifier applied to the Contract Type 2D6 roll.
export const HALL_CONTRACT_TYPE_MOD: Record<HiringHall, number> = {
  PROSERPINA: +1,
  TYBALT: -1,
};

// ─── Contract Type ──────────────────────────────────────────────────────────────
// Primary type from modified 2D6 (can range 1–13 with the hall modifier).
export function primaryTypeFromRoll(roll: number): PrimaryType {
  if (roll <= 4) return "EXPEDITION";
  if (roll <= 6) return "GARRISON";
  if (roll <= 9) return "RAID";
  return "INVASION";
}

export interface VariantResult {
  label: string;
  contractType: string; // ContractType enum value
}

// Variant sub-roll (plain 2D6) per primary type.
export function variantFromRoll(primary: PrimaryType, roll: number): VariantResult {
  switch (primary) {
    case "EXPEDITION":
      if (roll <= 8) return { label: "Expedition", contractType: "EXPEDITION" };
      if (roll <= 11) return { label: "Pirate Hunt", contractType: "PIRATE_HUNT" };
      return { label: "Guerilla Operation", contractType: "EXPEDITION" };
    case "GARRISON":
      return roll <= 5
        ? { label: "Cadre Duty", contractType: "GARRISON" }
        : { label: "Garrison", contractType: "GARRISON" };
    case "RAID":
      return { label: "Raid", contractType: "RAID" };
    case "INVASION":
      return { label: "Invasion", contractType: "INVASION" };
  }
}

// Opposing contract primary type (plain 2D6) keyed by the player's primary type.
export function opposingTypeFromRoll(primary: PrimaryType, roll: number): PrimaryType {
  switch (primary) {
    case "EXPEDITION":
      return roll <= 8 ? "GARRISON" : "RAID";
    case "GARRISON":
      if (roll <= 4) return "EXPEDITION";
      if (roll <= 8) return "RAID";
      return "INVASION";
    case "RAID":
      if (roll <= 7) return "EXPEDITION";
      if (roll <= 10) return "GARRISON";
      if (roll === 11) return "RAID";
      return "INVASION";
    case "INVASION":
      if (roll <= 4) return "EXPEDITION";
      if (roll <= 8) return "GARRISON";
      if (roll === 9) return "RAID";
      return "INVASION";
  }
}

export const LENGTH_BY_TYPE: Record<PrimaryType, number> = {
  RAID: 3,
  EXPEDITION: 3,
  GARRISON: 6,
  INVASION: 6,
};

// ─── Employer (2D6) ───────────────────────────────────────────────────────────────
export const EMPLOYER_TABLE: Record<number, Employer> = {
  2: "CIVILIAN",
  3: "PLANETARY_GOV",
  4: "MERC_SUBCONTRACT",
  5: "CORPORATION",
  6: "HOUSE_GOV",
  7: "HOUSE_GOV",
  8: "NOBLE",
  9: "CORPORATION",
  10: "PLANETARY_GOV",
  11: "HOUSE_GOV",
  12: "MERC_SUBCONTRACT",
};

// ─── Base term tables (2D6 sum → step on the Contract Steps Table) ──────────────────
export const PAY_BASE_STEP: Record<number, number> = {
  2: 3, 3: 3, 4: 4, 5: 4, 6: 5, 7: 5, 8: 6, 9: 6, 10: 7, 11: 7, 12: 8,
};
export const SUPPORT_BASE_STEP: Record<number, number> = {
  2: 3, 3: 3, 4: 3, 5: 3, 6: 4, 7: 4, 8: 5, 9: 5, 10: 6, 11: 6, 12: 7,
};
export const TRANSPORT_BASE_STEP: Record<number, number> = {
  2: 5, 3: 5, 4: 5, 5: 5, 6: 6, 7: 6, 8: 7, 9: 7, 10: 8, 11: 8, 12: 9,
};
export const SALVAGE_BASE_STEP: Record<number, number> = {
  2: 3, 3: 3, 4: 3, 5: 3, 6: 4, 7: 4, 8: 5, 9: 5, 10: 6, 11: 6, 12: 7,
};
export const COMMAND_BASE_STEP: Record<number, number> = {
  2: 3, 3: 3, 4: 3, 5: 3, 6: 7, 7: 7, 8: 8, 9: 8, 10: 11, 11: 11, 12: 11,
};

export const BASE_STEP_TABLE: Record<TermKey, Record<number, number>> = {
  basePay: PAY_BASE_STEP,
  support: SUPPORT_BASE_STEP,
  transport: TRANSPORT_BASE_STEP,
  salvage: SALVAGE_BASE_STEP,
  command: COMMAND_BASE_STEP,
};

// ─── Step modifiers ─────────────────────────────────────────────────────────────
type StepMods = Partial<Record<TermKey, number>>;

export const EMPLOYER_MODS: Record<Employer, StepMods> = {
  CIVILIAN: { basePay: -2, support: -2, transport: -1, salvage: +4, command: +4 },
  PLANETARY_GOV: { support: +1, salvage: +1 },
  MERC_SUBCONTRACT: { basePay: -1, command: +3 },
  CORPORATION: { basePay: +2, support: -2, transport: +1, salvage: +2 },
  HOUSE_GOV: { basePay: +1, support: +2, transport: +1, salvage: -2, command: -3 },
  NOBLE: {},
};

export const TYPE_MODS: Record<PrimaryType, StepMods> = {
  EXPEDITION: { support: +1, command: +2 },
  GARRISON: { basePay: +1, transport: +1, salvage: -2 },
  RAID: { salvage: -1 },
  INVASION: { basePay: -1, support: +2, transport: -1, salvage: +1, command: -2 },
};

// ─── System tables ────────────────────────────────────────────────────────────────
export interface SystemRow {
  jumps: number;
  systems: [string, string, string, string, string, string]; // indexed by inner 1D6
}

// Outer 1D6 (index 0 = roll 1 … index 5 = roll 6) → row.
export const TYBALT_SYSTEM_TABLE: SystemRow[] = [
  { jumps: 1, systems: ["Tikonov", "Rio", "Basalt", "Caselton", "Deneb Kaitos", "Addicks"] },
  { jumps: 2, systems: ["Helen", "Small World", "Markab", "Galatia", "Cylene", "Edwards"] },
  { jumps: 2, systems: ["Mara", "Elbar", "Cartago", "Chesterton", "New Hessen", "Ruchbah"] },
  { jumps: 3, systems: ["Skat", "Halstead Station", "Fellanin II", "Marlette", "Johnsondale", "Olancha"] },
  { jumps: 3, systems: ["Al Na'ir", "Raman", "David", "Lapida II", "Ancha", "Kentares IV"] },
  { jumps: 4, systems: ["Klathandu IV", "Proserpina", "Clovis", "Sadalbari", "Exeter", "Shinonoi"] },
];

const PROS_ROW_A: SystemRow = { jumps: 1, systems: ["Sadalbari", "Raman", "Raman", "David", "Fellanin II", "Klathandu IV"] };
const PROS_ROW_B: SystemRow = { jumps: 2, systems: ["Lapida II", "Mara", "Cartago", "Kentares IV", "Olancha", "Exeter"] };
const PROS_ROW_C: SystemRow = { jumps: 2, systems: ["Johnsondale", "Cylene", "Elbar", "Clovis", "Skat", "Galatia"] };
const PROS_ROW_D: SystemRow = { jumps: 3, systems: ["Marlette", "Marlette", "Edwards", "Caselton", "Addicks", "Addicks"] };
const PROS_ROW_E: SystemRow = { jumps: 4, systems: ["Shinonoi", "Ancha", "Halstead Station", "Al Na'ir", "Helen", "Deneb Kaitos"] };

// Outer 1D6 → row (rolls 1 and 2 both map to row A).
export const PROSERPINA_SYSTEM_TABLE: SystemRow[] = [
  PROS_ROW_A, PROS_ROW_A, PROS_ROW_B, PROS_ROW_C, PROS_ROW_D, PROS_ROW_E,
];

export function systemTable(hall: HiringHall): SystemRow[] {
  return hall === "TYBALT" ? TYBALT_SYSTEM_TABLE : PROSERPINA_SYSTEM_TABLE;
}

// ─── System terrain + opposing faction (1D6) ───────────────────────────────────────
export type Faction = "Liao" | "Davion" | "Kurita" | "Mercenary";

export interface SystemInfo {
  terrain: string;
  // 1D6 → opposing faction (index 0 = roll 1 … index 5 = roll 6)
  factions: [Faction, Faction, Faction, Faction, Faction, Faction];
}

const L: Faction = "Liao";
const D: Faction = "Davion";
const K: Faction = "Kurita";
const M: Faction = "Mercenary";

export const SYSTEM_INFO: Record<string, SystemInfo> = {
  Tikonov: { terrain: "Urban", factions: [L, L, L, L, M, M] },
  Rio: { terrain: "Badland", factions: [L, L, L, M, M, M] },
  Caselton: { terrain: "Mountain", factions: [D, D, D, D, M, K] },
  "Deneb Kaitos": { terrain: "Tundra (or Savannah)", factions: [K, K, K, K, M, M] },
  Addicks: { terrain: "Wetland", factions: [K, K, K, M, M, D] },
  Helen: { terrain: "Wetland", factions: [K, K, K, K, M, M] },
  "Small World": { terrain: "Savannah (Cold)", factions: [L, L, L, M, M, M] },
  Markab: { terrain: "Desert (Tainted)", factions: [K, K, K, M, M, D] },
  Galatia: { terrain: "Wooded", factions: [K, K, K, D, D, M] },
  Cylene: { terrain: "Desert (High Gravity)", factions: [K, K, M, M, M, D] },
  Edwards: { terrain: "Alien (Lunar, Vacuum, Low Gravity)", factions: [D, D, D, D, M, M] },
  Mara: { terrain: "Grassland", factions: [K, K, K, M, M, D] },
  Elbar: { terrain: "Savannah", factions: [M, M, M, M, M, M] },
  Cartago: { terrain: "Wetlands (Hot)", factions: [D, D, D, K, M, M] },
  Chesterton: { terrain: "Savannah", factions: [L, L, L, M, M, M] },
  "New Hessen": { terrain: "Hills", factions: [L, L, L, M, M, M] },
  Ruchbah: { terrain: "Grasslands", factions: [L, L, M, M, M, D] },
  Skat: { terrain: "Wetlands (Tainted)", factions: [K, K, K, K, K, M] },
  "Halstead Station": { terrain: "Desert (Toxic)", factions: [D, D, K, K, K, M] },
  "Fellanin II": { terrain: "Mountains", factions: [K, K, D, M, M, M] },
  Marlette: { terrain: "Wetlands", factions: [K, K, K, D, D, D] },
  Johnsondale: { terrain: "Grassland", factions: [D, D, D, D, D, M] },
  Olancha: { terrain: "Alien (Crystalline Canyon)", factions: [D, D, D, M, M, K] },
  "Al Na'ir": { terrain: "Desert (Low Gravity, Tainted)", factions: [K, K, K, K, M, M] },
  Raman: { terrain: "Savannah", factions: [D, D, D, K, K, M] },
  David: { terrain: "Grassland (Tainted)", factions: [K, K, K, K, M, M] },
  "Lapida II": { terrain: "Desert (Cold, Tainted)", factions: [K, K, K, K, M, M] },
  Ancha: { terrain: "Wetlands (Tainted)", factions: [K, K, K, K, M, M] },
  "Kentares IV": { terrain: "Urban (Ruins)", factions: [D, D, D, M, M, K] },
  "Klathandu IV": { terrain: "Alien (Caustic Valley)", factions: [K, K, K, M, M, D] },
  Proserpina: { terrain: "Wetlands (Tainted)", factions: [K, K, K, K, M, M] },
  Clovis: { terrain: "Hills", factions: [D, D, D, D, K, M] },
  Sadalbari: { terrain: "Wooded", factions: [K, K, K, M, M, D] },
  Exeter: { terrain: "Wetlands (High Pressure)", factions: [D, D, D, M, M, K] },
  Shinonoi: { terrain: "Grasslands", factions: [K, K, K, K, K, M] },
};
