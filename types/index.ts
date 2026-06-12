import type { InferSelectModel } from "drizzle-orm";
import type {
  users,
  campaigns,
  companies,
  units,
  pilots,
  contracts,
  tracks,
  trackUnits,
  trackPilots,
  salvageItems,
  transactions,
} from "@/lib/schema";

// ─── Base types ───────────────────────────────────────────────────────────────

export type User = InferSelectModel<typeof users>;
export type Campaign = InferSelectModel<typeof campaigns>;
export type Company = InferSelectModel<typeof companies>;
export type Unit = InferSelectModel<typeof units>;
export type Pilot = InferSelectModel<typeof pilots>;
export type Contract = InferSelectModel<typeof contracts>;
export type Track = InferSelectModel<typeof tracks>;
export type TrackUnit = InferSelectModel<typeof trackUnits>;
export type TrackPilot = InferSelectModel<typeof trackPilots>;
export type SalvageItem = InferSelectModel<typeof salvageItems>;
export type Transaction = InferSelectModel<typeof transactions>;

// Re-export enum types used across the app
export type { UserRole, UnitStatus, TransactionCategory, GameRules } from "@/lib/schema";

// ─── Rich types with relations ────────────────────────────────────────────────

export type CompanyWithRelations = Company & {
  campaign: Campaign;
  units: Unit[];
  pilots: PilotWithUnit[];
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
  pilot: Pilot | null;
};

export type PilotWithUnit = Pilot & {
  unit: Unit | null;
};

// ─── Form types ───────────────────────────────────────────────────────────────

export interface CreateCampaignInput {
  name: string;
  gameRules: "BATTLETECH" | "ALPHA_STRIKE";
  background?: string;
}

export interface CreateCompanyInput {
  campaignId: string;
  name: string;
  commandType: "MERCENARY" | "REGULAR_MILITARY";
  background?: string;
  parentCommand?: string;
  warchest?: number;
  trackingJumps?: boolean;
  startingLocation: string;
}

export interface CreateUnitInput {
  companyId: string;
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
  companyId: string;
  name: string;
  callsign?: string;
  isNamed?: boolean;
  unitId?: string;
}

export interface CreateContractInput {
  companyId: string;
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
  // Presented (default) terms + negotiation context — recorded for the audit trail
  defaultBasePayPct?: number;
  defaultSupportType?: string;
  defaultSupportPct?: number;
  defaultSalvageRightsPct?: number;
  defaultCommandRights?: string;
  defaultTransportPct?: number;
  reputation?: number;
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
