import type { SessionData } from "@/lib/auth/session-options";

export function canWriteCompany(
  session: Partial<SessionData>,
  companyUserId: string | null | undefined
): boolean {
  return session.role === "CAMPAIGN_MANAGER" || (!!session.userId && session.userId === companyUserId);
}
