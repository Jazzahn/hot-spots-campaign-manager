// Contract Steps Table — Hot Spots: Draconis Reach, p.28 (encoded verbatim).
// Each array is the shared 17-row ladder for that term; array index = step − 1.
// `null` = em-dash (—): that step exists on the master table but is NOT a selectable
// value for this term. Negotiation step-distance still counts em-dash rows in between
// (e.g. Command Rights House[7] → Independent[11] = 4 steps).

export const BASE_PAY_STEPS: number[] = [
  50, 55, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200,
];

export type CommandRightsValue = "INTEGRATED" | "HOUSE" | "LIAISON" | "INDEPENDENT";
export const COMMAND_RIGHTS_STEPS: (CommandRightsValue | null)[] = [
  null, null, "INTEGRATED", null, null, null, "HOUSE", "LIAISON", null, null, "INDEPENDENT", null, null, null, null, null, null,
];

// Salvage Rights: step 1 = None (0%), step 3 = "Exchange" (special), steps 4–13 = percentages.
export type SalvageValue = number | "EXCHANGE"; // numeric percent; 0 = None
export const SALVAGE_STEPS: (SalvageValue | null)[] = [
  0, null, "EXCHANGE", 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, null, null, null, null,
];

// Support Rights: step 1 = None, steps 2–8 = Straight 20–100%, steps 9–15 = Battle 10–100%.
export type SupportValue = { type: "NONE" | "STRAIGHT" | "BATTLE"; pct: number };
export const SUPPORT_STEPS: (SupportValue | null)[] = [
  { type: "NONE", pct: 0 },       // 1
  { type: "STRAIGHT", pct: 20 },  // 2
  { type: "STRAIGHT", pct: 40 },  // 3
  { type: "STRAIGHT", pct: 60 },  // 4
  { type: "STRAIGHT", pct: 70 },  // 5
  { type: "STRAIGHT", pct: 80 },  // 6
  { type: "STRAIGHT", pct: 90 },  // 7
  { type: "STRAIGHT", pct: 100 }, // 8
  { type: "BATTLE", pct: 10 },    // 9
  { type: "BATTLE", pct: 20 },    // 10
  { type: "BATTLE", pct: 30 },    // 11
  { type: "BATTLE", pct: 40 },    // 12
  { type: "BATTLE", pct: 50 },    // 13
  { type: "BATTLE", pct: 75 },    // 14
  { type: "BATTLE", pct: 100 },   // 15
  null,                           // 16
  null,                           // 17
];

// Transportation Terms: step 5 = 0%, steps 6–9 = 25/50/75/100%.
export const TRANSPORT_STEPS: (number | null)[] = [
  null, null, null, null, 0, 25, 50, 75, 100, null, null, null, null, null, null, null, null,
];

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
