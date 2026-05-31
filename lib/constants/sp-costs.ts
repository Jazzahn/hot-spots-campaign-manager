// SP Activity Cost Table from Hot Spots: Draconis Reach (rules.txt line 4698)

export const REPAIR_COSTS = {
  ARMOR_DAMAGE: (tonnage: number) => Math.ceil(tonnage / 2),
  STRUCTURE_CRIT: (tonnage: number) => tonnage * 2,
  CRIPPLED: (tonnage: number) => tonnage * 3,
  DESTROYED: (tonnage: number) => tonnage * 5,
} as const;

export const RECONFIGURE_OMNI_COST = (tonnage: number) => Math.ceil(tonnage / 2);

export const PURCHASE_UNIT_COST = {
  BV: (bv: number) => bv * 40,
  PV: (pv: number) => pv * 40,
} as const;

export const SELL_UNIT_VALUE = {
  BV: (bv: number) => Math.floor(bv / 2),
  PV: (pv: number) => pv * 20,
} as const;

export const SALVAGE_VALUE = {
  BV: (bv: number) => Math.floor(bv / 2),
  PV: (pv: number) => pv * 20,
} as const;

export const REARM_COST_PER_TON = 10;
export const REARM_ADVANCED_COST_PER_TON = 100;
export const REARM_ALPHA_STRIKE_COST = 20;

export const HIRE_NON_NAMED_CREW = 100;
export const HIRE_NAMED_PILOT = 150;
export const HIRE_BA_TROOPER = 20;

export const HEAL_MECHWARRIOR_PER_WOUND = 30;
export const HEAL_BA_TROOPER = 10;
export const MAX_HEALS_PER_MONTH = 2;

export const TRAIN_FORMATION_COMMANDER = 500;
export const CHANGE_FORMATION_TRAINING = 250;
export const LEARN_FIRST_COMMAND_ABILITY = 250;
export const LEARN_SECOND_COMMAND_ABILITY = 500;
export const LEARN_THIRD_COMMAND_ABILITY = 750;
export const REPLACE_COMMAND_ABILITY = 250;

// Clan/Mixed tech repair multiplier
export const CLAN_REPAIR_MULTIPLIER = 1.5;
// Vehicle and battle armor halve repair costs
export const VEHICLE_BA_REPAIR_DIVISOR = 2;
