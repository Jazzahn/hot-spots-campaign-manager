import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import type { UserRole } from "@/lib/schema";

export interface SessionData {
  userId: string;
  callsign: string;
  role: UserRole;
}

export const sessionOptions = {
  password: process.env.IRON_SESSION_SECRET ?? "change-me-at-least-32-characters-long",
  cookieName: "hs-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
  },
};

export async function getSessionFromCookies() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}
