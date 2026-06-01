"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, campaigns, companies } from "@/lib/schema";
import { eq, isNull } from "drizzle-orm";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getSessionFromCookies } from "@/lib/auth/session";

export async function loginAction(callsign: string, passphrase: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.callsign, callsign),
  });

  if (!user || !(await verifyPassword(passphrase, user.passHash))) {
    return { error: "Invalid callsign or passphrase" };
  }

  const session = await getSessionFromCookies();
  session.userId = user.id;
  session.callsign = user.callsign;
  session.role = user.role;
  await session.save();

  redirect("/");
}

export async function logoutAction() {
  const session = await getSessionFromCookies();
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

  await db.batch([
    db.insert(users).values({ id: userId, callsign, passHash, role: "PLAYER" }),
    db.insert(companies).values({
      id: companyId,
      campaignId: campaign.id,
      userId,
      name: companyName,
      updatedAt: new Date(),
    }),
  ]);

  const session = await getSessionFromCookies();
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

  const passHash = await hashPassword(passphrase);
  const userId = crypto.randomUUID();

  await db.insert(users).values({ id: userId, callsign, passHash, role: "CAMPAIGN_MANAGER" });

  await db
    .update(campaigns)
    .set({ managedById: userId, updatedAt: new Date() })
    .where(isNull(campaigns.managedById));
  await db
    .update(companies)
    .set({ userId, updatedAt: new Date() })
    .where(isNull(companies.userId));

  return { success: true, callsign };
}

export async function getAllCampaignInviteKeys() {
  return db
    .select({ id: campaigns.id, name: campaigns.name, inviteKey: campaigns.inviteKey })
    .from(campaigns);
}
