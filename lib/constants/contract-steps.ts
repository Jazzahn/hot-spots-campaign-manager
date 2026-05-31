// Contract Steps Table from Hot Spots: Draconis Reach (rules.txt line 4047)
// Each array is the ladder of steps for that term; index = step number (1-based)
// null means the step exists on the ladder but has no selectable value (em dash)

export const BASE_PAY_STEPS = [
  50, 55, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200,
] as const;

export type CommandRightsValue = "INTEGRATED" | "HOUSE" | "LIAISON" | "INDEPENDENT";
export const COMMAND_RIGHTS_STEPS: (CommandRightsValue | null)[] = [
  null, null, "INTEGRATED", null, null, null, "HOUSE", "LIAISON", null, null, null, null, null, "INDEPENDENT", null, null, null,
];

export const SALVAGE_STEPS = [
  null, null, null, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, null, null, null, null,
] as const;

export type SupportValue = { type: "NONE" | "STRAIGHT" | "BATTLE"; pct: number };
export const SUPPORT_STEPS: (SupportValue | null)[] = [
  null,
  { type: "STRAIGHT", pct: 20 },
  { type: "STRAIGHT", pct: 40 },
  { type: "STRAIGHT", pct: 60 },
  { type: "STRAIGHT", pct: 70 },
  { type: "STRAIGHT", pct: 80 },
  { type: "STRAIGHT", pct: 90 },
  { type: "STRAIGHT", pct: 100 },
  null,
  { type: "BATTLE", pct: 10 },
  { type: "BATTLE", pct: 20 },
  { type: "BATTLE", pct: 30 },
  { type: "BATTLE", pct: 40 },
  { type: "BATTLE", pct: 50 },
  { type: "BATTLE", pct: 75 },
  { type: "BATTLE", pct: 100 },
  null,
];

export const TRANSPORT_STEPS = [
  null, null, null, null, null, 25, 50, 75, 100, null, null, null, null, null, null, null, null,
] as const;

export const HOT_SPOTS = [
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
  "Hiring Hall – Tybalt",
  "Hiring Hall – Proserpina",
] as const;

export type HotSpot = (typeof HOT_SPOTS)[number];

export const CONTRACT_TYPES = [
  "RAID",
  "EXPEDITION",
  "PIRATE_HUNT",
  "GARRISON",
  "INVASION",
  "RETAINER",
  "ACTS_OF_PIRACY",
] as const;
