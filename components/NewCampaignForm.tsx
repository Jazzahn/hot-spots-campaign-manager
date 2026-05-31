"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createCampaign } from "@/lib/actions/campaign";

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
        background: (data.get("background") as string) || undefined,
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
          <DialogTitle>Create Campaign</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Campaign Name</Label>
            <Input id="name" name="name" placeholder="e.g. Draconis Reach" required />
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
            <Label htmlFor="background">Setting Notes (optional)</Label>
            <Input id="background" name="background" placeholder="e.g. Hot Spots: Draconis Reach, 3151" />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? "Creating…" : "Create Campaign"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
