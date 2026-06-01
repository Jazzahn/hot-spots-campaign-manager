"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { db } from "@/lib/db";
import { users, campaigns, companies } from "@/lib/schema";
import { eq, isNull, count } from "drizzle-orm";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { sessionOptions } from "@/lib/auth/session-options";
import type { SessionData } from "@/lib/auth/session-options";

export async function loginAction(callsign: string, passphrase: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.callsign, callsign),
  });

  if (!user || !(await verifyPassword(passphrase, user.passHash))) {
    return { error: "Invalid callsign or passphrase" };
  }

  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  session.userId = user.id;
  session.callsign = user.callsign;
  session.role = user.role;
  await session.save();

  redirect("/");
}

export async function logoutAction() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  session.destroy();
  redirect("/login");
}

export async function joinCampaignAction(
  inviteKey: string,
  callsign: string,
  passphrase: string,
  companyName: string
) {
  const campaign = await db.query.campaigns.findFirst({
    where: eq(campaigns.inviteKey, inviteKey),
  });
  if (!campaign) return { error: "Invalid invite key" };

  const existing = await db.query.users.findFirst({
    where: eq(users.callsign, callsign),
  });
  if (existing) return { error: "Callsign already taken" };

  const passHash = await hashPassword(passphrase);
  const userId = crypto.randomUUID();
  const companyId = crypto.randomUUID();

  await db.transaction(async (tx) => {
    await tx.insert(users).values({ id: userId, callsign, passHash, role: "PLAYER" });
    await tx.insert(companies).values({
      id: companyId,
      campaignId: campaign.id,
      userId,
      name: companyName,
      updatedAt: new Date(),
    });
  });

  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  session.userId = userId;
  session.callsign = callsign;
  session.role = "PLAYER";
  await session.save();

  redirect(`/${campaign.id}/${companyId}`);
}

export async function createManagerAction(
  callsign: string,
  passphrase: string,
  adminSecret: string
) {
  if (!process.env.ADMIN_SECRET || adminSecret !== process.env.ADMIN_SECRET) {
    return { error: "Invalid admin secret" };
  }

  const existing = await db.query.users.findFirst({
    where: eq(users.callsign, callsign),
  });
  if (existing) return { error: "Callsign already taken" };

  const [{ managerCount }] = await db
    .select({ managerCount: count() })
    .from(users)
    .where(eq(users.role, "CAMPAIGN_MANAGER"));

  const passHash = await hashPassword(passphrase);
  const userId = crypto.randomUUID();

  await db.insert(users).values({ id: userId, callsign, passHash, role: "CAMPAIGN_MANAGER" });

  if (Number(managerCount) === 0) {
    await db
      .update(campaigns)
      .set({ managedById: userId, updatedAt: new Date() })
      .where(isNull(campaigns.managedById));
    await db
      .update(companies)
      .set({ userId, updatedAt: new Date() })
      .where(isNull(companies.userId));
  }

  return { success: true, callsign };
}

export async function getAllCampaignInviteKeys() {
  return db
    .select({ id: campaigns.id, name: campaigns.name, inviteKey: campaigns.inviteKey })
    .from(campaigns);
}
