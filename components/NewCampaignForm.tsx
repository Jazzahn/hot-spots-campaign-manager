"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createCampaign } from "@/lib/actions/campaign";
import { STARTING_WARCHEST } from "@/lib/constants/scales";

export default function NewCampaignForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(async () => {
      const campaign = await createCampaign({
        name: data.get("name") as string,
        gameRules: data.get("gameRules") as "BATTLETECH" | "ALPHA_STRIKE",
        commandType: data.get("commandType") as "MERCENARY" | "REGULAR_MILITARY",
        background: data.get("background") as string || undefined,
        warchest: Number(data.get("warchest")) || STARTING_WARCHEST,
      });
      setOpen(false);
      router.push(`/${campaign.id}`);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New Campaign</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Mercenary Command</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Company Name</Label>
            <Input id="name" name="name" placeholder="e.g. Henshin Tigers" required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="gameRules">Game Rules</Label>
            <Select name="gameRules" defaultValue="BATTLETECH">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="BATTLETECH">BattleTech</SelectItem>
                <SelectItem value="ALPHA_STRIKE">Alpha Strike</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="commandType">Command Type</Label>
            <Select name="commandType" defaultValue="MERCENARY">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="MERCENARY">Mercenary</SelectItem>
                <SelectItem value="REGULAR_MILITARY">Regular Military</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="background">Background (optional)</Label>
            <Select name="background">
              <SelectTrigger><SelectValue placeholder="Select background…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Former Draconis Combine">Former Draconis Combine</SelectItem>
                <SelectItem value="Former Federated Suns">Former Federated Suns</SelectItem>
                <SelectItem value="Former Capellan Confederation">Former Capellan Confederation</SelectItem>
                <SelectItem value="Former Raven Alliance">Former Raven Alliance</SelectItem>
                <SelectItem value="Pirate">Pirate</SelectItem>
                <SelectItem value="Former Clan">Former Clan</SelectItem>
                <SelectItem value="Mercenary">Experienced Mercenary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="warchest">Starting Warchest (SP)</Label>
            <Input
              id="warchest"
              name="warchest"
              type="number"
              defaultValue={STARTING_WARCHEST}
              min={0}
            />
            <p className="text-xs text-muted-foreground">Standard: 3,000 SP. Veteran command: 6,000 SP.</p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? "Creating…" : "Create Command"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
