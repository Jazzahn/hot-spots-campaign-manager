export function salvageValue(battleValue: number): number {
  return Math.floor(battleValue / 2);
}

export function salvageValuePV(pointValue: number): number {
  return pointValue * 20;
}

export function playerSalvageShare(
  bv: number,
  salvageRightsPct: number,
  isExchange: boolean
): number {
  const value = salvageValue(bv);
  if (isExchange) {
    return Math.floor(value / 4);
  }
  return Math.floor(value * (salvageRightsPct / 100));
}

export function costToClaimSalvage(battleValue: number): number {
  // Player pays sell value to claim the unit
  return salvageValue(battleValue);
}
