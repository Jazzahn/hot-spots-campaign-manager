"use client";

import { useState, useTransition } from "react";
import { joinCampaignAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  inviteKey: string;
  campaignName: string;
}

export default function JoinForm({ inviteKey, campaignName }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await joinCampaignAction(
        inviteKey,
        data.get("callsign") as string,
        data.get("passphrase") as string,
        data.get("companyName") as string
      );
      if (result?.error) setError(result.error);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Join Campaign</CardTitle>
        <CardDescription>{campaignName}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              name="companyName"
              placeholder="e.g. Whalley's Warriors"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="callsign">Your Callsign</Label>
            <Input id="callsign" name="callsign" placeholder="e.g. Ghost" required autoComplete="username" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="passphrase">Passphrase</Label>
            <Input
              id="passphrase"
              name="passphrase"
              type="password"
              required
              autoComplete="new-password"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Joining…" : "Join Campaign"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
