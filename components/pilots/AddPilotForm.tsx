"use client";

import { useState, useTransition } from "react";
import type { Unit } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createPilot } from "@/lib/actions/pilots";
import { MAX_NAMED_PILOTS } from "@/lib/constants/scales";

interface Props {
  companyId: string;
  units: Unit[];
  namedPilotCount: number;
}

export default function AddPilotForm({ companyId, units, namedPilotCount }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const unitId = data.get("unitId") as string;
    startTransition(async () => {
      await createPilot({
        companyId,
        name: data.get("name") as string,
        callsign: (data.get("callsign") as string) || undefined,
        isNamed: data.get("isNamed") === "true",
        unitId: unitId === "none" ? undefined : unitId || undefined,
      });
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={namedPilotCount >= MAX_NAMED_PILOTS}>
          Add Pilot
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Add MechWarrior</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input name="name" placeholder="e.g. Lt. Aiko Hatakeyama" required />
          </div>
          <div className="space-y-1.5">
            <Label>Callsign (optional)</Label>
            <Input name="callsign" placeholder='e.g. "Tora"' />
          </div>
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select name="isNamed" defaultValue="true">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Named Pilot (costs 150 SP)</SelectItem>
                <SelectItem value="false">Non-Named Crew (free, G4/P5)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Assign to Unit (optional)</Label>
            <Select name="unitId" defaultValue="none">
              <SelectTrigger><SelectValue placeholder="No assignment" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No unit</SelectItem>
                {units.map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={isPending}>{isPending ? "Adding…" : "Add Pilot"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
