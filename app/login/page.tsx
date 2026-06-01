import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth/session";
import LoginForm from "@/components/auth/LoginForm";

export default async function LoginPage() {
  const session = await getSessionFromCookies();
  if (session.userId) redirect("/");

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">Hot Spots</h1>
          <p className="text-muted-foreground mt-1">Chaos Campaign: Mercenaries</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
