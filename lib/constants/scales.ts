export const SCALES = [
  { scale: 1, bvLimit: 3000, pvLimit: 100, unitLimit: 3, basePay: 500, maintenanceCost: 500, transportCost: 300 },
  { scale: 2, bvLimit: 6000, pvLimit: 200, unitLimit: 6, basePay: 1000, maintenanceCost: 1000, transportCost: 600 },
  { scale: 3, bvLimit: 9000, pvLimit: 300, unitLimit: 9, basePay: 1500, maintenanceCost: 1500, transportCost: 900 },
  { scale: 4, bvLimit: 12000, pvLimit: 400, unitLimit: 12, basePay: 2000, maintenanceCost: 2000, transportCost: 1200 },
] as const;

export function getScale(scale: number) {
  return SCALES.find((s) => s.scale === scale) ?? SCALES[0];
}

export const STARTING_WARCHEST = 3000;
export const STARTING_BV = 3000;
export const STARTING_PV = 100;
export const STARTING_REPUTATION = 1;
export const STARTING_SCALE = 1;
export const MAX_NAMED_PILOTS = 4;
export const MAX_SP_PER_PILOT_PER_TRACK = 100;
export const MAX_SP_TO_PILOTS_PER_SCALE = 200;
export const MVP_BONUS_SP = 20;
export const BSP_BV_RATIO = 20;
export const BASE_BSP_PER_SCALE = 32;
