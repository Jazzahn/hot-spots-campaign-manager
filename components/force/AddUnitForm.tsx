"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createUnit } from "@/lib/actions/units";

export default function AddUnitForm({ companyId }: { companyId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const chassis = data.get("chassis") as string;
    const model = data.get("model") as string;
    startTransition(async () => {
      await createUnit({
        companyId,
        name: model ? `${chassis} ${model}` : chassis,
        chassis,
        model: model || chassis,
        unitType: data.get("unitType") as never,
        tonnage: Number(data.get("tonnage")),
        battleValue: Number(data.get("battleValue")),
        pointValue: data.get("pointValue") ? Number(data.get("pointValue")) : undefined,
        techBase: data.get("techBase") as never,
        isOmni: data.get("isOmni") === "on",
      });
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Unit</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Unit to Force</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Chassis</Label>
              <Input name="chassis" placeholder="e.g. Caesar" required />
            </div>
            <div className="space-y-1.5">
              <Label>Model/Variant</Label>
              <Input name="model" placeholder="e.g. CES-3R" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Unit Type</Label>
              <Select name="unitType" defaultValue="BATTLEMECH">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BATTLEMECH">BattleMech</SelectItem>
                  <SelectItem value="COMBAT_VEHICLE">Combat Vehicle</SelectItem>
                  <SelectItem value="BATTLE_ARMOR">Battle Armor</SelectItem>
                  <SelectItem value="INFANTRY">Infantry</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Tech Base</Label>
              <Select name="techBase" defaultValue="IS">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="IS">Inner Sphere</SelectItem>
                  <SelectItem value="CLAN">Clan</SelectItem>
                  <SelectItem value="MIXED">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Tonnage</Label>
              <Input name="tonnage" type="number" min={1} max={200} required placeholder="70" />
            </div>
            <div className="space-y-1.5">
              <Label>Battle Value</Label>
              <Input name="battleValue" type="number" min={1} required placeholder="1578" />
            </div>
            <div className="space-y-1.5">
              <Label>PV (AS)</Label>
              <Input name="pointValue" type="number" min={1} placeholder="42" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="isOmni" name="isOmni" className="rounded" />
            <Label htmlFor="isOmni">OmniMech / OmniVehicle</Label>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={isPending}>{isPending ? "Adding…" : "Add Unit"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
