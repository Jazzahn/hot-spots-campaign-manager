// Contract negotiation math — Hot Spots: Draconis Reach, p.28.
//
// Negotiation rules:
//  • Reputation: each point raises one term one step. Reputation usable per contract
//    is capped at 2 × Scale.
//  • Sacrifice: drop 2 steps in one term to raise another 1 step; max 2 such swaps.
//  • Max term increase: no single term may be raised more than Scale steps.
//  • Step-distance is measured in raw table rows, so em-dash rungs in between count
//    (e.g. Command Rights House[7] → Independent[11] = 4 steps).
//
// Steps are 1-based throughout this module (matching the book and template *Step
// fields); the ladder arrays in contract-steps.ts are 0-indexed (index = step − 1).

import {
  BASE_PAY_STEPS,
  COMMAND_RIGHTS_STEPS,
  SALVAGE_STEPS,
  SUPPORT_STEPS,
  TRANSPORT_STEPS,
  type CommandRightsValue,
  type SupportValue,
} from "@/lib/constants/contract-steps";

export type TermKey = "basePay" | "command" | "salvage" | "support" | "transport";

export const TERM_KEYS: TermKey[] = ["basePay", "command", "salvage", "support", "transport"];

export const TERM_LABELS: Record<TermKey, string> = {
  basePay: "Base Pay",
  command: "Command Rights",
  salvage: "Salvage Rights",
  support: "Support",
  transport: "Transport",
};

type Ladder = readonly (unknown | null)[];

const LADDERS: Record<TermKey, Ladder> = {
  basePay: BASE_PAY_STEPS,
  command: COMMAND_RIGHTS_STEPS,
  salvage: SALVAGE_STEPS,
  support: SUPPORT_STEPS,
  transport: TRANSPORT_STEPS,
};

// ─── Ladder access (step ↔ value) ──────────────────────────────────────────────

/** Raw value at a 1-based step, or null for an em-dash row / out of range. */
export function valueAtStep(term: TermKey, step: number): unknown | null {
  const ladder = LADDERS[term];
  if (step < 1 || step > ladder.length) return null;
  return ladder[step - 1] ?? null;
}

export function isLandable(term: TermKey, step: number): boolean {
  return valueAtStep(term, step) !== null;
}

export function stepCount(term: TermKey): number {
  return LADDERS[term].length;
}

/**
 * Walk from a step in the given direction (+1 up / −1 down) to the next landable
 * step, skipping em-dash rows. Returns null if none exists in range.
 */
export function nextLandableStep(term: TermKey, fromStep: number, dir: 1 | -1): number | null {
  const max = stepCount(term);
  for (let s = fromStep + dir; s >= 1 && s <= max; s += dir) {
    if (isLandable(term, s)) return s;
  }
  return null;
}

/** Highest / lowest landable step for a term. */
export function landableBounds(term: TermKey): { min: number; max: number } {
  const max = stepCount(term);
  let lo = 1;
  let hi = max;
  while (lo <= max && !isLandable(term, lo)) lo++;
  while (hi >= 1 && !isLandable(term, hi)) hi--;
  return { min: lo, max: hi };
}

/**
 * Clamp a (possibly out-of-range or em-dash) step to the nearest landable rung,
 * staying within the term's landable bounds. Used by the random-contract generator
 * after applying step modifiers.
 */
export function clampToLandable(term: TermKey, step: number): number {
  const { min, max } = landableBounds(term);
  let s = Math.max(min, Math.min(max, step));
  if (isLandable(term, s)) return s;
  // Snap to the nearest landable step (prefer downward on a tie).
  for (let d = 1; d <= stepCount(term); d++) {
    if (s - d >= min && isLandable(term, s - d)) return s - d;
    if (s + d <= max && isLandable(term, s + d)) return s + d;
  }
  return min;
}

// ─── value → step ───────────────────────────────────────────────────────────────

/** Find the step for a Base Pay percentage (nearest if not an exact rung). */
export function basePayToStep(pct: number): number {
  return nearestNumericStep("basePay", pct, BASE_PAY_STEPS);
}

export function commandToStep(rights: CommandRightsValue): number {
  const idx = COMMAND_RIGHTS_STEPS.findIndex((v) => v === rights);
  return idx >= 0 ? idx + 1 : commandRightsDefaultStep;
}

/** Salvage percent → step. 0 = None (step 1). Snaps to the nearest book value. */
export function salvageToStep(pct: number): number {
  if (pct <= 0) return 1;
  let best = 4; // 10%
  let bestDiff = Infinity;
  SALVAGE_STEPS.forEach((v, i) => {
    if (typeof v === "number" && v > 0) {
      const diff = Math.abs(v - pct);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = i + 1;
      }
    }
  });
  return best;
}

export function supportToStep(type: SupportValue["type"], pct: number): number {
  if (type === "NONE") return 1;
  let best = 1;
  let bestDiff = Infinity;
  SUPPORT_STEPS.forEach((v, i) => {
    if (v && v.type === type) {
      const diff = Math.abs(v.pct - pct);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = i + 1;
      }
    }
  });
  return best;
}

export function transportToStep(pct: number): number {
  return nearestNumericStep("transport", pct, TRANSPORT_STEPS);
}

const commandRightsDefaultStep = 11; // Independent

function nearestNumericStep(term: TermKey, pct: number, ladder: (number | null)[]): number {
  let best = landableBounds(term).min;
  let bestDiff = Infinity;
  ladder.forEach((v, i) => {
    if (typeof v === "number") {
      const diff = Math.abs(v - pct);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = i + 1;
      }
    }
  });
  return best;
}

// ─── Display ────────────────────────────────────────────────────────────────────

export function describeStep(term: TermKey, step: number): string {
  const v = valueAtStep(term, step);
  if (v === null) return "—";
  switch (term) {
    case "basePay":
      return `${v as number}%`;
    case "command":
      return titleCase(v as string);
    case "salvage":
      if (v === "EXCHANGE") return "Exchange";
      return (v as number) === 0 ? "None" : `${v as number}%`;
    case "support": {
      const sv = v as SupportValue;
      return sv.type === "NONE" ? "None" : `${titleCase(sv.type)} ${sv.pct}%`;
    }
    case "transport":
      return `${v as number}%`;
  }
}

function titleCase(s: string): string {
  return s.charAt(0) + s.slice(1).toLowerCase();
}

// ─── Final term values (for persistence) ────────────────────────────────────────

export interface TermValues {
  basePayPct: number;
  commandRights: CommandRightsValue;
  salvageRightsPct: number;
  supportType: SupportValue["type"];
  supportPct: number;
  transportPct: number;
}

/** Resolve a full set of term values from a map of steps. */
export function stepsToValues(steps: Record<TermKey, number>): TermValues {
  const command = (valueAtStep("command", steps.command) as CommandRightsValue) ?? "INDEPENDENT";
  const salvageRaw = valueAtStep("salvage", steps.salvage);
  const support = (valueAtStep("support", steps.support) as SupportValue) ?? { type: "NONE", pct: 0 };
  return {
    basePayPct: (valueAtStep("basePay", steps.basePay) as number) ?? 100,
    commandRights: command,
    // "Exchange" is a special non-percentage salvage rung; store 0% as its numeric stand-in.
    salvageRightsPct: typeof salvageRaw === "number" ? salvageRaw : 0,
    supportType: support.type,
    supportPct: support.pct,
    transportPct: (valueAtStep("transport", steps.transport) as number) ?? 0,
  };
}

/** Derive presented steps from a set of term values (used for Hot Spot templates). */
export function valuesToSteps(v: {
  basePayPct: number;
  commandRights: CommandRightsValue;
  salvageRightsPct: number;
  supportType: SupportValue["type"];
  supportPct: number;
  transportPct: number;
}): Record<TermKey, number> {
  return {
    basePay: basePayToStep(v.basePayPct),
    command: commandToStep(v.commandRights),
    salvage: salvageToStep(v.salvageRightsPct),
    support: supportToStep(v.supportType, v.supportPct),
    transport: transportToStep(v.transportPct),
  };
}

// ─── Budget & validation ────────────────────────────────────────────────────────

export const MAX_SWAPS = 2;

export interface NegotiationBudget {
  repAvailable: number;
  maxSwaps: number;
  perTermIncreaseCap: number;
}

export function negotiationBudget(scale: number, reputation: number): NegotiationBudget {
  return {
    repAvailable: Math.max(0, Math.min(reputation, 2 * scale)),
    maxSwaps: MAX_SWAPS,
    perTermIncreaseCap: scale,
  };
}

export interface NegotiationState {
  legal: boolean;
  /** budget rules (cap/reputation/sacrifice) satisfied, ignoring em-dash landing — gates steppers */
  fundingLegal: boolean;
  repUsed: number;
  repAvailable: number;
  swapsUsed: number;
  swapsAvailable: number;
  /** signed step delta per term (current − presented) */
  perTermDeltas: Record<TermKey, number>;
  totalIncrease: number;
  totalDecrease: number;
  /** the largest totalIncrease the current sacrifices + reputation can fund */
  maxFundableIncrease: number;
  errors: string[];
}

export function validateNegotiation(args: {
  defaults: Record<TermKey, number>;
  current: Record<TermKey, number>;
  scale: number;
  reputation: number;
}): NegotiationState {
  const { defaults, current, scale, reputation } = args;
  const budget = negotiationBudget(scale, reputation);

  const perTermDeltas = {} as Record<TermKey, number>;
  let totalIncrease = 0;
  let totalDecrease = 0;
  const errors: string[] = [];

  for (const term of TERM_KEYS) {
    const delta = (current[term] ?? defaults[term]) - defaults[term];
    perTermDeltas[term] = delta;
    if (delta > 0) {
      totalIncrease += delta;
      if (delta > budget.perTermIncreaseCap) {
        errors.push(
          `${TERM_LABELS[term]} raised ${delta} steps — max ${budget.perTermIncreaseCap} at Scale ${scale}.`
        );
      }
    } else if (delta < 0) {
      totalDecrease += -delta;
    }
  }

  // Reputation funds increases 1:1; sacrifices fund at 2 dropped → 1 raised, max 2 swaps.
  const repUsed = Math.min(totalIncrease, budget.repAvailable);
  const increasesFromSacrifice = Math.max(0, totalIncrease - repUsed);
  const sacrificeCapacity = Math.min(budget.maxSwaps, Math.floor(totalDecrease / 2));
  const maxFundableIncrease = budget.repAvailable + sacrificeCapacity;

  if (increasesFromSacrifice > budget.maxSwaps) {
    errors.push(`Negotiation needs ${increasesFromSacrifice} sacrifices — max ${budget.maxSwaps}.`);
  }
  if (2 * increasesFromSacrifice > totalDecrease) {
    errors.push("Not enough sacrificed steps to fund the increases (2 dropped = 1 raised).");
  }

  // `fundingLegal` covers the budget rules (cap, reputation, sacrifices) and is used to gate
  // the stepper buttons. A term may sit on an em-dash rung mid-negotiation; that is allowed
  // while adjusting but the contract cannot be accepted until every term rests on a real value.
  const fundingLegal = errors.length === 0;
  for (const term of TERM_KEYS) {
    if (!isLandable(term, current[term] ?? defaults[term])) {
      errors.push(`${TERM_LABELS[term]} is between steps (—) — set it to a selectable value to accept.`);
    }
  }

  return {
    legal: errors.length === 0,
    fundingLegal,
    repUsed,
    repAvailable: budget.repAvailable,
    swapsUsed: increasesFromSacrifice,
    swapsAvailable: budget.maxSwaps,
    perTermDeltas,
    totalIncrease,
    totalDecrease,
    maxFundableIncrease,
    errors,
  };
}

/**
 * Can this term be raised one single step (NOT skipping em-dash rungs) while keeping the
 * budget rules satisfied? The target step may itself be an em-dash — that is allowed during
 * adjustment; acceptance is gated separately on every term resting on a real value.
 */
export function canStepUp(args: {
  term: TermKey;
  defaults: Record<TermKey, number>;
  current: Record<TermKey, number>;
  scale: number;
  reputation: number;
}): boolean {
  const { term, defaults, current, scale, reputation } = args;
  const next = current[term] + 1;
  if (next > landableBounds(term).max) return false;
  const tentative = { ...current, [term]: next };
  return validateNegotiation({ defaults, current: tentative, scale, reputation }).fundingLegal;
}

/** Can this term be lowered one single step, staying within the landable range? */
export function canStepDown(term: TermKey, current: Record<TermKey, number>): boolean {
  return current[term] - 1 >= landableBounds(term).min;
}
