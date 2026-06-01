"use client";

import { useState, useTransition } from "react";
import { createManagerAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  adminSecret: string;
}

export default function CreateManagerForm({ adminSecret }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await createManagerAction(
        data.get("callsign") as string,
        data.get("passphrase") as string,
        adminSecret
      );
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess(`Campaign Manager "${result.callsign}" created.`);
        (e.target as HTMLFormElement).reset();
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Campaign Manager</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="callsign">Callsign</Label>
            <Input id="callsign" name="callsign" required autoComplete="off" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="passphrase">Passphrase</Label>
            <Input id="passphrase" name="passphrase" type="password" required autoComplete="new-password" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-green-500">{success}</p>}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Creating…" : "Create Manager"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
