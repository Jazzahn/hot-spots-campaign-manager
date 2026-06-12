// All systems a company can be located in, as the union of:
//  • the two Hiring Halls,
//  • the book Hot Spot worlds, and
//  • the Dobless "reach" systems (derived from SYSTEM_INFO so they can't drift).

import { SYSTEM_INFO } from "@/lib/constants/random-contract";

export const HIRING_HALL_SYSTEMS = ["Tybalt", "Proserpina"];

export const HOT_SPOT_SYSTEMS = [
  "Achernar",
  "Alta Vista",
  "Dahar",
  "Le Blanc",
  "Lucerne",
  "Mallory's World",
  "Melcher",
  "New Ivaarsen",
  "Pascagoula",
  "Protection",
  "Sun Prairie",
  "Tigress",
  "Xhosa VII",
];

// "Basalt" appears in the Tybalt jump table but has no SYSTEM_INFO entry, so add it explicitly.
const REACH_EXTRA = ["Basalt"];

export const REACH_SYSTEMS = Array.from(new Set([...Object.keys(SYSTEM_INFO), ...REACH_EXTRA]))
  .filter((s) => !HIRING_HALL_SYSTEMS.includes(s))
  .sort((a, b) => a.localeCompare(b));

export const SYSTEM_GROUPS: { label: string; systems: string[] }[] = [
  { label: "Hiring Halls", systems: HIRING_HALL_SYSTEMS },
  { label: "Hot Spots", systems: HOT_SPOT_SYSTEMS },
  { label: "Reach Systems", systems: REACH_SYSTEMS },
];

export const ALL_SYSTEMS = SYSTEM_GROUPS.flatMap((g) => g.systems);

export function isHiringHallSystem(system: string): boolean {
  return HIRING_HALL_SYSTEMS.includes(system);
}

// A new mercenary company starts free at a Hiring Hall, or pays this fee to start anywhere else.
export const OFF_HIRING_HALL_START_FEE = 300;
