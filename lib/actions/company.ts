"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { companies, transactions, units, pilots, contracts, campaigns } from "@/lib/schema";
import { eq, asc, desc, and, sum } from "drizzle-orm";
import type { CreateCompanyInput, TransactionCategory } from "@/types";
import { getSessionFromCookies } from "@/lib/auth/session";

export async function createCompany(input: CreateCompanyInput) {
  const session = await getSessionFromCookies();
  const companyId = crypto.randomUUID();
  const warchest = input.warchest ?? 3000;

  await db.batch([
    db.insert(companies).values({
      id: companyId,
      campaignId: input.campaignId,
      userId: session.userId ?? null,
      name: input.name,
      commandType: input.commandType,
      background: input.background,
      parentCommand: input.parentCommand,
      warchest,
      trackingJumps: input.trackingJumps ?? false,
      updatedAt: new Date(),
    }),
    db.insert(transactions).values({
      id: crypto.randomUUID(),
      companyId,
      month: 1,
      category: "OTHER",
      amount: warchest,
      description: "Starting Warchest",
      runningBalance: warchest,
    }),
  ]);

  revalidatePath(`/${input.campaignId}`);
  return { id: companyId, campaignId: input.campaignId, name: input.name };
}

export async function getCompany(id: string) {
  return db.query.companies.findFirst({
    where: eq(companies.id, id),
    with: {
      campaign: true,
      units: { orderBy: [asc(units.createdAt)] },
      pilots: {
        with: { unit: true },
        orderBy: [asc(pilots.createdAt)],
      },
      contracts: {
        with: {
          tracks: {
            with: {
              trackUnits: { with: { unit: true } },
              trackPilots: { with: { pilot: true } },
              salvageItems: true,
            },
            orderBy: (t, { asc }) => [asc(t.trackNumber)],
          },
        },
        orderBy: [desc(contracts.createdAt)],
      },
      transactions: { orderBy: [asc(transactions.createdAt)] },
    },
  });
}

export async function getCompanyForLayout(id: string) {
  return db.query.companies.findFirst({
    where: eq(companies.id, id),
    columns: { id: true, name: true, warchest: true, reputation: true, scale: true, campaignId: true, userId: true },
  });
}

export async function getCompanyForForce(id: string) {
  return db.query.companies.findFirst({
    where: eq(companies.id, id),
    columns: { id: true, campaignId: true, userId: true, warchest: true, reputation: true, scale: true },
    with: {
      units: { orderBy: [asc(units.createdAt)] },
      pilots: true,
    },
  });
}

export async function getCompanyForPilots(id: string) {
  return db.query.companies.findFirst({
    where: eq(companies.id, id),
    columns: { id: true, campaignId: true, userId: true },
    with: {
      campaign: { columns: { gameRules: true } },
      pilots: {
        with: { unit: true },
        orderBy: [asc(pilots.createdAt)],
      },
      units: true,
    },
  });
}

export async function getCompanyForContracts(id: string) {
  return db.query.companies.findFirst({
    where: eq(companies.id, id),
    columns: { id: true, campaignId: true, userId: true, reputation: true, scale: true },
    with: {
      contracts: {
        with: { tracks: { columns: { id: true } } },
        orderBy: [desc(contracts.createdAt)],
      },
    },
  });
}

export async function getCompanyForLedger(id: string) {
  return db.query.companies.findFirst({
    where: eq(companies.id, id),
    columns: { id: true, campaignId: true, warchest: true },
    with: {
      transactions: { orderBy: [asc(transactions.createdAt)] },
    },
  });
}

export async function deleteCompany(companyId: string) {
  const company = await db.query.companies.findFirst({
    where: eq(companies.id, companyId),
    columns: { campaignId: true },
  });
  if (!company) throw new Error("Company not found");
  await db.delete(companies).where(eq(companies.id, companyId));
  revalidatePath(`/${company.campaignId}`);
}

export async function updateReputation(companyId: string, delta: number) {
  const company = await db.query.companies.findFirst({
    where: eq(companies.id, companyId),
    columns: { reputation: true, campaignId: true },
  });
  if (!company) throw new Error("Company not found");

  const [updated] = await db
    .update(companies)
    .set({ reputation: company.reputation + delta, updatedAt: new Date() })
    .where(eq(companies.id, companyId))
    .returning();

  revalidatePath(`/${company.campaignId}/${companyId}`);
  return updated;
}

export async function updateWarchest(
  companyId: string,
  amount: number,
  category: TransactionCategory,
  description: string,
  month: number,
  extra?: { contractId?: string; trackId?: string; isPending?: boolean }
) {
  const company = await db.query.companies.findFirst({
    where: eq(companies.id, companyId),
    columns: { warchest: true, campaignId: true },
  });
  if (!company) throw new Error("Company not found");

  if (extra?.isPending) {
    // Compute projected balance: committed warchest + sum of existing pending + this amount
    const [pendingSum] = await db
      .select({ total: sum(transactions.amount) })
      .from(transactions)
      .where(and(eq(transactions.companyId, companyId), eq(transactions.isPending, true)));
    const existingPending = Number(pendingSum?.total ?? 0);
    const projectedBalance = company.warchest + existingPending + amount;

    await db.insert(transactions).values({
      id: crypto.randomUUID(),
      companyId,
      month,
      category,
      amount,
      description,
      runningBalance: projectedBalance,
      isPending: true,
      contractId: extra?.contractId,
      trackId: extra?.trackId,
    });
  } else {
    const newBalance = company.warchest + amount;
    await db.batch([
      db.update(companies)
        .set({ warchest: newBalance, updatedAt: new Date() })
        .where(eq(companies.id, companyId)),
      db.insert(transactions).values({
        id: crypto.randomUUID(),
        companyId,
        month,
        category,
        amount,
        description,
        runningBalance: newBalance,
        isPending: false,
        contractId: extra?.contractId,
        trackId: extra?.trackId,
      }),
    ]);
    revalidatePath(`/${company.campaignId}/${companyId}`);
    revalidatePath(`/${company.campaignId}/${companyId}/ledger`);
  }
}
