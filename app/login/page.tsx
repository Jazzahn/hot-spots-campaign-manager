import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth/session";
import LoginForm from "@/components/auth/LoginForm";
import AuthShell from "@/components/auth/AuthShell";

export default async function LoginPage() {
  const session = await getSessionFromCookies();
  if (session.userId) redirect("/");

  return (
    <AuthShell subtitle="Chaos Campaign: Mercenaries">
      <LoginForm />
    </AuthShell>
  );
}
