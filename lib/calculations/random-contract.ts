// Dobless Information Services — random contract generator.
// Rolls the tables in lib/constants/random-contract.ts into a concrete contract
// offer, expressed in steps on the shared Contract Steps Table.

import {
  type HiringHall,
  type PrimaryType,
  type Employer,
  type Faction,
  HALL_CONTRACT_TYPE_MOD,
  EMPLOYER_TABLE,
  EMPLOYER_MODS,
  EMPLOYER_LABELS,
  TYPE_MODS,
  BASE_STEP_TABLE,
  LENGTH_BY_TYPE,
  HIRING_HALL_LABELS,
  primaryTypeFromRoll,
  variantFromRoll,
  opposingTypeFromRoll,
  systemTable,
  SYSTEM_INFO,
} from "@/lib/constants/random-contract";
import {
  clampToLandable,
  stepsToValues,
  describeStep,
  TERM_KEYS,
  TERM_LABELS,
  type TermKey,
  type TermValues,
} from "@/lib/calculations/contract-negotiation";

export function roll1d6(): number {
  return Math.floor(Math.random() * 6) + 1;
}
export function roll2d6(): number {
  return roll1d6() + roll1d6();
}

export interface BreakdownLine {
  label: string;
  detail: string;
}

export interface RandomContractRoll {
  hiringHall: HiringHall;
  primaryType: PrimaryType;
  variantLabel: string;
  contractType: string; // ContractType enum for the player's contract
  opposingType: PrimaryType;
  opposingContractType: string;
  employer: Employer;
  opposingEmployer: Employer;
  lengthMonths: number;
  system: string;
  jumps: number;
  terrain: string;
  opposingFaction: Faction;
  playerSteps: Record<TermKey, number>;
  opposingSteps: Record<TermKey, number>;
  playerValues: TermValues;
  opposingValues: TermValues;
  breakdown: BreakdownLine[];
}

/** Roll all five term steps for one side given its primary type + employer. */
function rollTermSteps(
  primary: PrimaryType,
  employer: Employer,
  breakdown: BreakdownLine[] | null
): Record<TermKey, number> {
  const empMods = EMPLOYER_MODS[employer];
  const typeMods = TYPE_MODS[primary];
  const steps = {} as Record<TermKey, number>;

  for (const term of TERM_KEYS) {
    if (term === "basePay" || term === "support" || term === "salvage" || term === "transport" || term === "command") {
      const sum = roll2d6();
      const base = BASE_STEP_TABLE[term][sum];
      const em = empMods[term] ?? 0;
      const tm = typeMods[term] ?? 0;
      const finalStep = clampToLandable(term, base + em + tm);
      steps[term] = finalStep;
      if (breakdown) {
        const mods = [em ? `emp ${em > 0 ? "+" : ""}${em}` : null, tm ? `type ${tm > 0 ? "+" : ""}${tm}` : null]
          .filter(Boolean)
          .join(", ");
        breakdown.push({
          label: TERM_LABELS[term],
          detail: `2D6=${sum} → step ${base}${mods ? ` (${mods})` : ""} → ${describeStep(term, finalStep)}`,
        });
      }
    }
  }
  return steps;
}

export function rollRandomContract(hiringHall: HiringHall): RandomContractRoll {
  const breakdown: BreakdownLine[] = [];

  // 1. Contract type (with hiring-hall modifier)
  const ctRaw = roll2d6();
  const ctMod = HALL_CONTRACT_TYPE_MOD[hiringHall];
  const ctRoll = ctRaw + ctMod;
  const primaryType = primaryTypeFromRoll(ctRoll);
  breakdown.push({
    label: "Contract Type",
    detail: `2D6=${ctRaw} ${ctMod >= 0 ? "+" : ""}${ctMod} (${HIRING_HALL_LABELS[hiringHall]}) = ${ctRoll} → ${primaryType}`,
  });

  // 2. Variant
  const variantRoll = roll2d6();
  const variant = variantFromRoll(primaryType, variantRoll);
  breakdown.push({ label: "Variant", detail: `2D6=${variantRoll} → ${variant.label}` });

  // 3. Opposing contract type
  const oppRoll = roll2d6();
  const opposingType = opposingTypeFromRoll(primaryType, oppRoll);
  breakdown.push({ label: "Opposing Contract", detail: `2D6=${oppRoll} → ${opposingType}` });

  // 4. Employers (player + opposing each roll their own)
  const employer = EMPLOYER_TABLE[roll2d6()];
  const opposingEmployer = EMPLOYER_TABLE[roll2d6()];
  breakdown.push({ label: "Employer", detail: EMPLOYER_LABELS[employer] });

  // 5. Length (from the primary contract; shared by both sides)
  const lengthMonths = LENGTH_BY_TYPE[primaryType];

  // 6. Player term steps
  const playerSteps = rollTermSteps(primaryType, employer, breakdown);
  // Opposing term steps (own rolls; not shown in the player breakdown)
  const opposingSteps = rollTermSteps(opposingType, opposingEmployer, null);

  // 7. System / terrain / opposing faction
  const table = systemTable(hiringHall);
  const outer = roll1d6();
  const row = table[outer - 1];
  const inner = roll1d6();
  const system = row.systems[inner - 1];
  const jumps = row.jumps;
  const info = SYSTEM_INFO[system];
  const terrain = info?.terrain ?? "Unknown";
  const factionRoll = roll1d6();
  const opposingFaction: Faction = info?.factions[factionRoll - 1] ?? "Mercenary";
  breakdown.push({
    label: "System",
    detail: `${system} (${jumps} jump${jumps === 1 ? "" : "s"}, ${terrain}) · opposing faction 1D6=${factionRoll} → ${opposingFaction}`,
  });

  return {
    hiringHall,
    primaryType,
    variantLabel: variant.label,
    contractType: variant.contractType,
    opposingType,
    opposingContractType: opposingType, // opposing side uses its primary type directly
    employer,
    opposingEmployer,
    lengthMonths,
    system,
    jumps,
    terrain,
    opposingFaction,
    playerSteps,
    opposingSteps,
    playerValues: stepsToValues(playerSteps),
    opposingValues: stepsToValues(opposingSteps),
    breakdown,
  };
}

/** Human-readable notes blob recorded on the player's contract. */
export function describeRollNotes(r: RandomContractRoll): string {
  const lines = [
    `Dobless Information Services — Random Contract (${HIRING_HALL_LABELS[r.hiringHall]})`,
    `Employer: ${EMPLOYER_LABELS[r.employer]}`,
    `System: ${r.system} — ${r.terrain} (${r.jumps} jump${r.jumps === 1 ? "" : "s"})`,
    `Opposing force: ${r.opposingFaction} — ${r.opposingType}`,
    `Length: ${r.lengthMonths} months`,
    "",
    "Rolls:",
    ...r.breakdown.map((b) => `  • ${b.label}: ${b.detail}`),
  ];
  return lines.join("\n");
}
