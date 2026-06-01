import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions } from "@/lib/auth/session-options";
import type { SessionData } from "@/lib/auth/session-options";

export async function getSessionFromCookies() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}
