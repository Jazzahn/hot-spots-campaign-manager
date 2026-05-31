import { TrackResult } from "@prisma/client";

const BASE_PAY_PER_SCALE = 500;

export function calculateCombatPay(result: TrackResult, scale: number): number {
  switch (result) {
    case "ALL_OBJECTIVES":
      return Math.ceil(BASE_PAY_PER_SCALE * 1.5) * scale; // 750 × scale
    case "SUCCESS":
      return BASE_PAY_PER_SCALE * scale; // 500 × scale
    case "UNSUCCESSFUL":
      return Math.ceil(BASE_PAY_PER_SCALE * 0.5) * scale; // 250 × scale
    case "INCOMPLETE":
    default:
      return 0;
  }
}

export function getCombatPayLabel(result: TrackResult): string {
  switch (result) {
    case "ALL_OBJECTIVES":
      return "All Objectives Completed";
    case "SUCCESS":
      return "Successful";
    case "UNSUCCESSFUL":
      return "Unsuccessful";
    case "INCOMPLETE":
      return "Incomplete / Contract Broken";
  }
}

export function maxSPToNamedPilots(scale: number): number {
  return 200 * scale;
}

export function maxSPPerPilotPerTrack(): number {
  return 100;
}
