"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { companies, contracts, randomContractOffers } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { getOrCreateHoldingCompany } from "./company";
import { rollRandomContract, describeRollNotes, type RandomContractRoll } from "@/lib/calculations/random-contract";
import {
  valuesToSteps,
  validateNegotiation,
  type TermKey,
} from "@/lib/calculations/contract-negotiation";
import type { HiringHall } from "@/lib/constants/random-contract";
import type { CommandRightsValue, SupportValue } from "@/lib/constants/contract-steps";

async function getCompanyContext(companyId: string) {
  const company = await db.query.companies.findFirst({
    where: eq(companies.id, companyId),
    columns: { id: true, campaignId: true },
    with: { campaign: { columns: { currentMonth: true } } },
  });
  if (!company) throw new Error("Company not found");
  return { campaignId: company.campaignId, currentMonth: company.campaign.currentMonth };
}

export interface RandomOfferView {
  id: string;
  status: string;
  hiringHall: HiringHall;
  campaignMonth: number;
  roll: RandomContractRoll;
}

function toView(row: typeof randomContractOffers.$inferSelect): RandomOfferView {
  return {
    id: row.id,
    status: row.status,
    hiringHall: row.hiringHall as HiringHall,
    campaignMonth: row.campaignMonth,
    roll: row.payload as RandomContractRoll,
  };
}

/** Current campaign-month offer for this company, if one has been rolled. */
export async function getRandomContractOffer(companyId: string): Promise<RandomOfferView | null> {
  const { currentMonth } = await getCompanyContext(companyId);
  const row = await db.query.randomContractOffers.findFirst({
    where: and(
      eq(randomContractOffers.companyId, companyId),
      eq(randomContractOffers.campaignMonth, currentMonth)
    ),
  });
  return row ? toView(row) : null;
}

/**
 * Roll a random contract for this company this month. One roll per company per month:
 * if an offer already exists it is returned unchanged (no re-roll); a consumed offer
 * blocks a fresh roll until the campaign month advances.
 */
export async function rollRandomContractOffer(
  companyId: string,
  hiringHall: HiringHall
): Promise<RandomOfferView> {
  const { campaignId, currentMonth } = await getCompanyContext(companyId);

  const existing = await db.query.randomContractOffers.findFirst({
    where: and(
      eq(randomContractOffers.companyId, companyId),
      eq(randomContractOffers.campaignMonth, currentMonth)
    ),
  });
  if (existing) {
    if (existing.status === "CONSUMED") {
      throw new Error("This company has already taken a random contract this month.");
    }
    return toView(existing);
  }

  const roll = rollRandomContract(hiringHall);
  const id = crypto.randomUUID();
  await db.insert(randomContractOffers).values({
    id,
    companyId,
    campaignMonth: currentMonth,
    hiringHall,
    payload: roll,
    status: "OPEN",
  });

  revalidatePath(`/${campaignId}/${companyId}/contracts`);
  return {
    id,
    status: "OPEN",
    hiringHall,
    campaignMonth: currentMonth,
    roll,
  };
}

export interface AcceptRandomOfferInput {
  offerId: string;
  contractName: string;
  scale: number;
  reputation: number;
  // Negotiated final terms (from the negotiation panel)
  basePayPct: number;
  supportType: string;
  supportPct: number;
  salvageRightsPct: number;
  commandRights: string;
  transportPct: number;
}

/**
 * Accept a rolled offer: validate the negotiation against the persisted presented
 * terms, create the player's contract + the OPFOR contract (owned by the campaign's
 * holding company), and mark the offer consumed.
 */
export async function acceptRandomContractOffer(input: AcceptRandomOfferInput) {
  const offer = await db.query.randomContractOffers.findFirst({
    where: eq(randomContractOffers.id, input.offerId),
    with: { company: { columns: { id: true, campaignId: true } } },
  });
  if (!offer) throw new Error("Offer not found");
  if (offer.status === "CONSUMED") throw new Error("This offer has already been accepted.");

  const roll = offer.payload as RandomContractRoll;
  const companyId = offer.companyId;
  const campaignId = offer.company.campaignId;

  // Defense-in-depth: re-validate the negotiation against the persisted presented terms.
  const defaults = valuesToSteps({
    basePayPct: roll.playerValues.basePayPct,
    commandRights: roll.playerValues.commandRights,
    salvageRightsPct: roll.playerValues.salvageRightsPct,
    supportType: roll.playerValues.supportType,
    supportPct: roll.playerValues.supportPct,
    transportPct: roll.playerValues.transportPct,
  });
  const current = valuesToSteps({
    basePayPct: input.basePayPct,
    commandRights: input.commandRights as CommandRightsValue,
    salvageRightsPct: input.salvageRightsPct,
    supportType: input.supportType as SupportValue["type"],
    supportPct: input.supportPct,
    transportPct: input.transportPct,
  });
  const result = validateNegotiation({
    defaults: defaults as Record<TermKey, number>,
    current: current as Record<TermKey, number>,
    scale: input.scale,
    reputation: input.reputation,
  });
  if (!result.legal) {
    throw new Error(`Illegal contract negotiation: ${result.errors.join(" ")}`);
  }

  const holdingCompanyId = await getOrCreateHoldingCompany(campaignId);
  const playerContractId = crypto.randomUUID();
  const opforContractId = crypto.randomUUID();
  const pv = roll.playerValues;
  const ov = roll.opposingValues;

  await db.batch([
    // Player's contract — negotiated terms + presented (default*) terms + notes
    db.insert(contracts).values({
      id: playerContractId,
      companyId,
      hotSpot: roll.system,
      contractName: input.contractName,
      contractType: roll.contractType as never,
      scale: input.scale,
      durationMonths: roll.lengthMonths,
      basePayPct: input.basePayPct,
      supportType: input.supportType as never,
      supportPct: input.supportPct,
      salvageRightsPct: input.salvageRightsPct,
      commandRights: input.commandRights as never,
      transportPct: input.transportPct,
      defaultBasePayPct: pv.basePayPct,
      defaultSupportType: pv.supportType as never,
      defaultSupportPct: pv.supportPct,
      defaultSalvageRightsPct: pv.salvageRightsPct,
      defaultCommandRights: pv.commandRights as never,
      defaultTransportPct: pv.transportPct,
      notes: describeRollNotes(roll),
      updatedAt: new Date(),
    }),
    // OPFOR contract — owned by holding company, its own rolled terms, shared system + length
    db.insert(contracts).values({
      id: opforContractId,
      companyId: holdingCompanyId,
      hotSpot: roll.system,
      contractName: `OPFOR — ${roll.opposingFaction} (${roll.system})`,
      contractType: roll.opposingContractType as never,
      scale: input.scale,
      durationMonths: roll.lengthMonths,
      basePayPct: ov.basePayPct,
      supportType: ov.supportType as never,
      supportPct: ov.supportPct,
      salvageRightsPct: ov.salvageRightsPct,
      commandRights: ov.commandRights as never,
      transportPct: ov.transportPct,
      isOpposingForce: true,
      updatedAt: new Date(),
    }),
    db.update(randomContractOffers)
      .set({ status: "CONSUMED" })
      .where(eq(randomContractOffers.id, input.offerId)),
    // Accepting relocates the company to the rolled system.
    db.update(companies)
      .set({ currentLocation: roll.system, updatedAt: new Date() })
      .where(eq(companies.id, companyId)),
  ]);

  revalidatePath(`/${campaignId}/${companyId}/contracts`);
  revalidatePath(`/${campaignId}/${companyId}`);
  revalidatePath(`/${campaignId}`);
  return { contractId: playerContractId };
}
