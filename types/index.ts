import type {
  Campaign,
  Unit,
  Pilot,
  Contract,
  Track,
  TrackUnit,
  TrackPilot,
  SalvageItem,
  Transaction,
} from "@prisma/client";

// ─── Re-exports ───────────────────────────────────────────────────────────────
export type {
  Campaign,
  Unit,
  Pilot,
  Contract,
  Track,
  TrackUnit,
  TrackPilot,
  SalvageItem,
  Transaction,
};

// ─── Rich types with relations ────────────────────────────────────────────────

export type CampaignWithRelations = Campaign & {
  units: Unit[];
  pilots: Pilot[];
  contracts: ContractWithTracks[];
  transactions: Transaction[];
};

export type ContractWithTracks = Contract & {
  tracks: TrackWithDetails[];
};

export type TrackWithDetails = Track & {
  trackUnits: (TrackUnit & { unit: Unit })[];
  trackPilots: (TrackPilot & { pilot: Pilot })[];
  salvageItems: SalvageItem[];
};

export type UnitWithPilot = Unit & {
  pilots: Pilot[];
};

export type PilotWithUnit = Pilot & {
  unit: Unit | null;
};

// ─── Form types ───────────────────────────────────────────────────────────────

export interface CreateCampaignInput {
  name: string;
  gameRules: "BATTLETECH" | "ALPHA_STRIKE";
  commandType: "MERCENARY" | "REGULAR_MILITARY";
  background?: string;
  parentCommand?: string;
  warchest?: number;
  trackingJumps?: boolean;
}

export interface CreateUnitInput {
  campaignId: string;
  name: string;
  chassis: string;
  model: string;
  unitType: "BATTLEMECH" | "COMBAT_VEHICLE" | "BATTLE_ARMOR" | "INFANTRY";
  tonnage: number;
  battleValue: number;
  pointValue?: number;
  techBase: "IS" | "CLAN" | "MIXED";
  isOmni?: boolean;
}

export interface CreatePilotInput {
  campaignId: string;
  name: string;
  callsign?: string;
  isNamed?: boolean;
  unitId?: string;
}

export interface CreateContractInput {
  campaignId: string;
  hotSpot: string;
  contractName: string;
  contractType: string;
  scale: number;
  durationMonths: number;
  basePayPct: number;
  supportType: string;
  supportPct: number;
  salvageRightsPct: number;
  commandRights: string;
  transportPct: number;
}

export interface RecordTrackInput {
  contractId: string;
  trackNumber: number;
  month: number;
  trackType: string;
  scale: number;
  result: "ALL_OBJECTIVES" | "SUCCESS" | "UNSUCCESSFUL" | "INCOMPLETE";
  playerVP: number;
  opponentVP: number;
  notes?: string;
  unitResults: { unitId: string; damageResult: string; retreated: boolean }[];
  pilotResults: {
    pilotId: string;
    wasMVP: boolean;
    spEarned: number;
    spToGunnery: number;
    spToPiloting: number;
    spToEdgeTokens: number;
    spToEdgeAbilities: number;
  }[];
  salvageItems: {
    unitName: string;
    chassis?: string;
    battleValue: number;
    salvageValue: number;
    playerShare: number;
  }[];
}
