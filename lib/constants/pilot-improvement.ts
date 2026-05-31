// Named Pilot Improvement Table — Hot Spots: Draconis Reach (rules.txt lines 4844–5048)
// Each entry: { sp: cumulative SP threshold, skill: resulting skill level, handicap: H value }
// Non-cumulative within each category.

export interface PilotThreshold {
  sp: number;
  level: number;
  handicap: number;
}

// Gunnery: starts at 4 (default). Lower is better.
export const GUNNERY_THRESHOLDS: PilotThreshold[] = [
  { sp: 0,    level: 4, handicap: 0 },
  { sp: 300,  level: 3, handicap: 12 },
  { sp: 700,  level: 2, handicap: 28 },
  { sp: 1200, level: 1, handicap: 48 },
  { sp: 1900, level: 0, handicap: 76 },
  { sp: 2200, level: 0, handicap: 88 }, // max gunnery improvement
  { sp: 3400, level: 0, handicap: 136 },
] as const;

// Piloting: starts at 5 (default). Lower is better.
export const PILOTING_THRESHOLDS: PilotThreshold[] = [
  { sp: 0,   level: 5, handicap: 0 },
  { sp: 100, level: 4, handicap: 4 },
  { sp: 200, level: 3, handicap: 8 },
  { sp: 360, level: 2, handicap: 14 },
  { sp: 600, level: 1, handicap: 24 },
  { sp: 900, level: 0, handicap: 36 },
] as const;

// Alpha Strike Skill: starts at 4 (default). Lower is better.
export const AS_SKILL_THRESHOLDS: PilotThreshold[] = [
  { sp: 0,   level: 4, handicap: 0 },
  { sp: 60,  level: 3, handicap: 2 },
  { sp: 180, level: 2, handicap: 8 },
  { sp: 420, level: 1, handicap: 17 },
  { sp: 560, level: 0, handicap: 22 },
  { sp: 720, level: 0, handicap: 29 },
  { sp: 900, level: 0, handicap: 36 },
  { sp: 1100, level: 0, handicap: 44 },
] as const;

// Edge Tokens: starts at 1.
export const EDGE_TOKEN_THRESHOLDS: PilotThreshold[] = [
  { sp: 0,    level: 1, handicap: 2 },
  { sp: 60,   level: 2, handicap: 2 },
  { sp: 120,  level: 3, handicap: 5 },
  { sp: 400,  level: 4, handicap: 8 },
  { sp: 900,  level: 5, handicap: 16 },
  { sp: 1200, level: 6, handicap: 28 },
  { sp: 1900, level: 7, handicap: 36 },
] as const;

// Edge Abilities: each ability unlocked costs 60 SP cumulative.
export const EDGE_ABILITY_THRESHOLDS: PilotThreshold[] = [
  { sp: 0,    level: 0, handicap: 0 },
  { sp: 60,   level: 1, handicap: 2 },
  { sp: 180,  level: 2, handicap: 5 },
  { sp: 360,  level: 3, handicap: 7 },
  { sp: 600,  level: 4, handicap: 11 },
  { sp: 900,  level: 5, handicap: 16 },
  { sp: 1200, level: 6, handicap: 22 },
  { sp: 1600, level: 7, handicap: 29 },
  { sp: 2000, level: 8, handicap: 36 },
] as const;

export const EDGE_ABILITIES = [
  "Blood and Iron",
  "Cool under Fire",
  "Crossfire Specialist",
  "Diehard",
  "Hard to Kill",
  "Hotshotting",
  "Iron Will",
  "Jump Jet Expertise",
  "Lucky",
  "Marksman",
  "Natural Grace",
  "Sharpshooter",
  "Sniper",
  "Speed Demon",
  "Sure Footing",
] as const;
