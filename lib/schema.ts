import {
  pgTable,
  pgEnum,
  text,
  integer,
  boolean,
  jsonb,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("UserRole", ["CAMPAIGN_MANAGER", "PLAYER"]);
export const gameRulesEnum = pgEnum("GameRules", ["BATTLETECH", "ALPHA_STRIKE"]);
export const commandTypeEnum = pgEnum("CommandType", ["MERCENARY", "REGULAR_MILITARY"]);
export const unitTypeEnum = pgEnum("UnitType", ["BATTLEMECH", "COMBAT_VEHICLE", "BATTLE_ARMOR", "INFANTRY"]);
export const techBaseEnum = pgEnum("TechBase", ["IS", "CLAN", "MIXED"]);
export const unitStatusEnum = pgEnum("UnitStatus", ["OPERATIONAL", "ARMOR_DAMAGE", "STRUCTURE_CRIT", "CRIPPLED", "DESTROYED", "TRULY_DESTROYED"]);
export const contractTypeEnum = pgEnum("ContractType", ["RAID", "EXPEDITION", "PIRATE_HUNT", "GARRISON", "INVASION", "RETAINER", "ACTS_OF_PIRACY"]);
export const contractStatusEnum = pgEnum("ContractStatus", ["PENDING", "ACTIVE", "COMPLETED", "BROKEN"]);
export const supportTypeEnum = pgEnum("SupportType", ["NONE", "STRAIGHT", "BATTLE"]);
export const commandRightsEnum = pgEnum("CommandRights", ["INTEGRATED", "HOUSE", "LIAISON", "INDEPENDENT"]);
export const trackResultEnum = pgEnum("TrackResult", ["ALL_OBJECTIVES", "SUCCESS", "UNSUCCESSFUL", "INCOMPLETE"]);
export const transactionCategoryEnum = pgEnum("TransactionCategory", [
  "MAINTENANCE", "COMBAT_PAY", "TRANSPORT", "REPAIR", "REARM", "PURCHASE",
  "SELL", "SALVAGE", "UNIT_TRAINING", "PILOT_HIRE", "UNIT_PURCHASE",
  "COMMAND_TRAINING", "BATTLEFIELD_LOSS_COMPENSATION", "DEBT_INTEREST", "OTHER",
]);

// ─── Derived enum types ───────────────────────────────────────────────────────

export type UserRole = typeof userRoleEnum.enumValues[number];
export type UnitStatus = typeof unitStatusEnum.enumValues[number];
export type TransactionCategory = typeof transactionCategoryEnum.enumValues[number];
export type GameRules = typeof gameRulesEnum.enumValues[number];

// ─── Tables ───────────────────────────────────────────────────────────────────

export const users = pgTable("User", {
  id: text("id").primaryKey(),
  callsign: text("callsign").notNull().unique(),
  passHash: text("passHash").notNull(),
  role: userRoleEnum("role").notNull().default("PLAYER"),
  createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
});

export const campaigns = pgTable("Campaign", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  gameRules: gameRulesEnum("gameRules").notNull().default("BATTLETECH"),
  currentMonth: integer("currentMonth").notNull().default(1),
  inGameStartYear: integer("inGameStartYear").notNull().default(3151),
  inGameStartMonth: integer("inGameStartMonth").notNull().default(1),
  background: text("background"),
  managedById: text("managedById").references(() => users.id),
  inviteKey: text("inviteKey").unique(),
  createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { precision: 3 }).notNull().defaultNow(),
});

export const companies = pgTable("Company", {
  id: text("id").primaryKey(),
  campaignId: text("campaignId").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  userId: text("userId").references(() => users.id),
  name: text("name").notNull(),
  commandType: commandTypeEnum("commandType").notNull().default("MERCENARY"),
  background: text("background"),
  parentCommand: text("parentCommand"),
  rankLevel: integer("rankLevel"),
  warchest: integer("warchest").notNull().default(3000),
  reputation: integer("reputation").notNull().default(1),
  scale: integer("scale").notNull().default(1),
  trackingJumps: boolean("trackingJumps").notNull().default(false),
  currentLocation: text("currentLocation"),
  companyOptions: jsonb("companyOptions"),
  createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { precision: 3 }).notNull().defaultNow(),
});

export const units = pgTable("Unit", {
  id: text("id").primaryKey(),
  companyId: text("companyId").notNull().references(() => companies.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  chassis: text("chassis").notNull(),
  model: text("model").notNull(),
  unitType: unitTypeEnum("unitType").notNull().default("BATTLEMECH"),
  tonnage: integer("tonnage").notNull(),
  battleValue: integer("battleValue").notNull(),
  pointValue: integer("pointValue"),
  techBase: techBaseEnum("techBase").notNull().default("IS"),
  status: unitStatusEnum("status").notNull().default("OPERATIONAL"),
  isOmni: boolean("isOmni").notNull().default(false),
  currentConfig: text("currentConfig"),
  availableNextTrack: boolean("availableNextTrack").notNull().default(true),
  isTemporaryHire: boolean("isTemporaryHire").notNull().default(false),
  isSalvaged: boolean("isSalvaged").notNull().default(false),
  originalOwner: text("originalOwner"),
  notes: text("notes"),
  createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { precision: 3 }).notNull().defaultNow(),
});

export const pilots = pgTable("Pilot", {
  id: text("id").primaryKey(),
  companyId: text("companyId").notNull().references(() => companies.id, { onDelete: "cascade" }),
  unitId: text("unitId").references(() => units.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  callsign: text("callsign"),
  isNamed: boolean("isNamed").notNull().default(true),
  gunnery: integer("gunnery").notNull().default(4),
  piloting: integer("piloting").notNull().default(5),
  edgeTokens: integer("edgeTokens").notNull().default(1),
  edgeAbilities: text("edgeAbilities").array().notNull().default([]),
  spGunnery: integer("spGunnery").notNull().default(0),
  spPiloting: integer("spPiloting").notNull().default(0),
  spEdgeTokens: integer("spEdgeTokens").notNull().default(0),
  spEdgeAbilities: integer("spEdgeAbilities").notNull().default(0),
  totalSPEarned: integer("totalSPEarned").notNull().default(0),
  handicap: integer("handicap").notNull().default(0),
  wounds: integer("wounds").notNull().default(0),
  isKilled: boolean("isKilled").notNull().default(false),
  mvpCount: integer("mvpCount").notNull().default(0),
  isTemporaryHire: boolean("isTemporaryHire").notNull().default(false),
  createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { precision: 3 }).notNull().defaultNow(),
});

export const contracts = pgTable("Contract", {
  id: text("id").primaryKey(),
  companyId: text("companyId").notNull().references(() => companies.id, { onDelete: "cascade" }),
  hotSpot: text("hotSpot").notNull(),
  contractName: text("contractName").notNull(),
  contractType: contractTypeEnum("contractType").notNull().default("GARRISON"),
  scale: integer("scale").notNull().default(1),
  durationMonths: integer("durationMonths").notNull().default(3),
  status: contractStatusEnum("status").notNull().default("PENDING"),
  basePayPct: integer("basePayPct").notNull().default(100),
  supportType: supportTypeEnum("supportType").notNull().default("STRAIGHT"),
  supportPct: integer("supportPct").notNull().default(100),
  salvageRightsPct: integer("salvageRightsPct").notNull().default(0),
  commandRights: commandRightsEnum("commandRights").notNull().default("INDEPENDENT"),
  transportPct: integer("transportPct").notNull().default(100),
  startMonth: integer("startMonth"),
  endMonth: integer("endMonth"),
  notes: text("notes"),
  isReady: boolean("isReady").notNull().default(false),
  conflictMonth: integer("conflictMonth").notNull().default(1),
  createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { precision: 3 }).notNull().defaultNow(),
});

export const tracks = pgTable("Track", {
  id: text("id").primaryKey(),
  contractId: text("contractId").notNull().references(() => contracts.id, { onDelete: "cascade" }),
  trackNumber: integer("trackNumber").notNull(),
  month: integer("month").notNull(),
  trackType: text("trackType").notNull(),
  scale: integer("scale").notNull().default(1),
  result: trackResultEnum("result").notNull().default("INCOMPLETE"),
  playerVP: integer("playerVP").notNull().default(0),
  opponentVP: integer("opponentVP").notNull().default(0),
  combatPay: integer("combatPay").notNull().default(0),
  spToNamedPilots: integer("spToNamedPilots").notNull().default(0),
  notes: text("notes"),
  createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { precision: 3 }).notNull().defaultNow(),
});

export const trackUnits = pgTable("TrackUnit", {
  id: text("id").primaryKey(),
  trackId: text("trackId").notNull().references(() => tracks.id, { onDelete: "cascade" }),
  unitId: text("unitId").notNull().references(() => units.id, { onDelete: "cascade" }),
  damageResult: unitStatusEnum("damageResult").notNull().default("OPERATIONAL"),
  retreated: boolean("retreated").notNull().default(false),
}, (t) => [uniqueIndex("TrackUnit_trackId_unitId_key").on(t.trackId, t.unitId)]);

export const trackPilots = pgTable("TrackPilot", {
  id: text("id").primaryKey(),
  trackId: text("trackId").notNull().references(() => tracks.id, { onDelete: "cascade" }),
  pilotId: text("pilotId").notNull().references(() => pilots.id, { onDelete: "cascade" }),
  wasMVP: boolean("wasMVP").notNull().default(false),
  spEarned: integer("spEarned").notNull().default(0),
  spToGunnery: integer("spToGunnery").notNull().default(0),
  spToPiloting: integer("spToPiloting").notNull().default(0),
  spToEdgeTokens: integer("spToEdgeTokens").notNull().default(0),
  spToEdgeAbilities: integer("spToEdgeAbilities").notNull().default(0),
}, (t) => [uniqueIndex("TrackPilot_trackId_pilotId_key").on(t.trackId, t.pilotId)]);

export const salvageItems = pgTable("SalvageItem", {
  id: text("id").primaryKey(),
  trackId: text("trackId").notNull().references(() => tracks.id, { onDelete: "cascade" }),
  unitName: text("unitName").notNull(),
  chassis: text("chassis"),
  battleValue: integer("battleValue").notNull(),
  salvageValue: integer("salvageValue").notNull(),
  playerShare: integer("playerShare").notNull(),
  wasClaimed: boolean("wasClaimed").notNull().default(false),
  wasRejected: boolean("wasRejected").notNull().default(false),
  claimedByPlayer: text("claimedByPlayer"),
  createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
});

export const transactions = pgTable("Transaction", {
  id: text("id").primaryKey(),
  companyId: text("companyId").notNull().references(() => companies.id, { onDelete: "cascade" }),
  month: integer("month").notNull(),
  category: transactionCategoryEnum("category").notNull(),
  amount: integer("amount").notNull(),
  description: text("description").notNull(),
  runningBalance: integer("runningBalance").notNull(),
  contractId: text("contractId"),
  trackId: text("trackId"),
  createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const userRelations = relations(users, ({ many }) => ({
  campaigns: many(campaigns),
  companies: many(companies),
}));

export const campaignRelations = relations(campaigns, ({ one, many }) => ({
  companies: many(companies),
  managedBy: one(users, { fields: [campaigns.managedById], references: [users.id] }),
}));

export const companyRelations = relations(companies, ({ one, many }) => ({
  campaign: one(campaigns, { fields: [companies.campaignId], references: [campaigns.id] }),
  user: one(users, { fields: [companies.userId], references: [users.id] }),
  units: many(units),
  pilots: many(pilots),
  contracts: many(contracts),
  transactions: many(transactions),
}));

export const unitRelations = relations(units, ({ one, many }) => ({
  company: one(companies, { fields: [units.companyId], references: [companies.id] }),
  pilot: one(pilots, { fields: [units.id], references: [pilots.unitId] }),
  trackUnits: many(trackUnits),
}));

export const pilotRelations = relations(pilots, ({ one, many }) => ({
  company: one(companies, { fields: [pilots.companyId], references: [companies.id] }),
  unit: one(units, { fields: [pilots.unitId], references: [units.id] }),
  trackPilots: many(trackPilots),
}));

export const contractRelations = relations(contracts, ({ one, many }) => ({
  company: one(companies, { fields: [contracts.companyId], references: [companies.id] }),
  tracks: many(tracks),
}));

export const trackRelations = relations(tracks, ({ one, many }) => ({
  contract: one(contracts, { fields: [tracks.contractId], references: [contracts.id] }),
  trackUnits: many(trackUnits),
  trackPilots: many(trackPilots),
  salvageItems: many(salvageItems),
}));

export const trackUnitRelations = relations(trackUnits, ({ one }) => ({
  track: one(tracks, { fields: [trackUnits.trackId], references: [tracks.id] }),
  unit: one(units, { fields: [trackUnits.unitId], references: [units.id] }),
}));

export const trackPilotRelations = relations(trackPilots, ({ one }) => ({
  track: one(tracks, { fields: [trackPilots.trackId], references: [tracks.id] }),
  pilot: one(pilots, { fields: [trackPilots.pilotId], references: [pilots.id] }),
}));

export const salvageItemRelations = relations(salvageItems, ({ one }) => ({
  track: one(tracks, { fields: [salvageItems.trackId], references: [tracks.id] }),
}));

export const transactionRelations = relations(transactions, ({ one }) => ({
  company: one(companies, { fields: [transactions.companyId], references: [companies.id] }),
}));
