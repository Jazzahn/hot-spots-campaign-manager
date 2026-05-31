"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createContract } from "@/lib/actions/contracts";
import { BASE_PAY_STEPS } from "@/lib/constants/contract-steps";
import { HOT_SPOTS_DATA, type ContractTemplate } from "@/lib/constants/hot-spots-data";

interface Props {
  campaignId: string;
  currentScale: number;
}

export default function AddContractForm({ campaignId, currentScale }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);

  function handleTemplateSelect(value: string) {
    if (!value) { setSelectedTemplate(null); return; }
    const [hotSpot, side] = value.split("|");
    const hs = HOT_SPOTS_DATA.find((h) => h.name === hotSpot);
    const contract = hs?.contracts.find((c) => c.side === (side as "A" | "B"));
    setSelectedTemplate(contract ?? null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(async () => {
      await createContract({
        campaignId,
        hotSpot: data.get("hotSpot") as string,
        contractName: data.get("contractName") as string,
        contractType: data.get("contractType") as string,
        scale: Number(data.get("scale")),
        durationMonths: Number(data.get("durationMonths")),
        basePayPct: Number(data.get("basePayPct")),
        supportType: data.get("supportType") as string,
        supportPct: Number(data.get("supportPct")),
        salvageRightsPct: Number(data.get("salvageRightsPct")),
        commandRights: data.get("commandRights") as string,
        transportPct: Number(data.get("transportPct")),
      });
      setOpen(false);
      setSelectedTemplate(null);
    });
  }

  const t = selectedTemplate;

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setSelectedTemplate(null); }}>
      <DialogTrigger asChild>
        <Button>Negotiate Contract</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Negotiate Contract</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Hot Spot template picker */}
          <div className="space-y-1.5">
            <Label>Hot Spot Contract (pre-fills default terms)</Label>
            <Select onValueChange={handleTemplateSelect}>
              <SelectTrigger><SelectValue placeholder="Select from book, or fill in manually…" /></SelectTrigger>
              <SelectContent>
                {HOT_SPOTS_DATA.map((hs) =>
                  hs.contracts.map((c) => (
                    <SelectItem key={`${hs.name}|${c.side}`} value={`${hs.name}|${c.side}`}>
                      {hs.name}: {c.name} ({c.contractType})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {t && (
              <div className="text-xs text-muted-foreground bg-muted rounded p-2 space-y-1">
                <p><span className="font-medium">Employer:</span> {t.employer}</p>
                <p><span className="font-medium">Intensity:</span> {t.intensity}</p>
                <p><span className="font-medium">Tracks:</span> {t.trackSequence.slice(0, 120)}…</p>
                {t.commandNonNegotiable && <p className="text-yellow-400">⚠ Command Rights non-negotiable</p>}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2">
              <Label>Hot Spot</Label>
              <Input name="hotSpot" defaultValue={t?.planet ?? ""} key={`hs-${t?.contractNumber}`} required placeholder="e.g. Achernar" />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Contract Name</Label>
              <Input name="contractName" defaultValue={t?.name ?? ""} key={`cn-${t?.contractNumber}`} required placeholder="e.g. Esteros Disruption" />
            </div>
            <div className="space-y-1.5">
              <Label>Contract Type</Label>
              <Select name="contractType" defaultValue={t?.contractType ?? "GARRISON"} key={`ct-${t?.contractType}`}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="RAID">Raid</SelectItem>
                  <SelectItem value="EXPEDITION">Expedition</SelectItem>
                  <SelectItem value="PIRATE_HUNT">Pirate Hunt</SelectItem>
                  <SelectItem value="GARRISON">Garrison</SelectItem>
                  <SelectItem value="INVASION">Invasion</SelectItem>
                  <SelectItem value="RETAINER">Retainer</SelectItem>
                  <SelectItem value="ACTS_OF_PIRACY">Acts of Piracy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Scale</Label>
              <Select name="scale" defaultValue={String(currentScale)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Scale 1 (3,000 BV)</SelectItem>
                  <SelectItem value="2">Scale 2 (6,000 BV)</SelectItem>
                  <SelectItem value="3">Scale 3 (9,000 BV)</SelectItem>
                  <SelectItem value="4">Scale 4 (12,000 BV)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Duration (months)</Label>
              <Input name="durationMonths" type="number" min={1} max={15}
                defaultValue={t?.durationMonths ?? 3} key={`dur-${t?.contractNumber}`} required />
            </div>
          </div>

          <div className="border-t border-border pt-4 space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">Contract Terms</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Base Pay %</Label>
                <Select name="basePayPct" defaultValue={String(t?.basePayPct ?? 100)} key={`bp-${t?.contractNumber}`}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BASE_PAY_STEPS.map((pct) => (
                      <SelectItem key={pct} value={String(pct)}>{pct}%</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Command Rights</Label>
                <Select name="commandRights" defaultValue={t?.commandRights ?? "INDEPENDENT"} key={`cr-${t?.contractNumber}`}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INDEPENDENT">Independent</SelectItem>
                    <SelectItem value="LIAISON">Liaison</SelectItem>
                    <SelectItem value="HOUSE">House</SelectItem>
                    <SelectItem value="INTEGRATED">Integrated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Salvage Rights %</Label>
                <Input name="salvageRightsPct" type="number" min={0} max={100}
                  defaultValue={t?.salvageRightsPct ?? 50} key={`sr-${t?.contractNumber}`} />
              </div>
              <div className="space-y-1.5">
                <Label>Transport %</Label>
                <Input name="transportPct" type="number" min={0} max={100}
                  defaultValue={t?.transportPct ?? 100} key={`tr-${t?.contractNumber}`} />
              </div>
              <div className="space-y-1.5">
                <Label>Support Type</Label>
                <Select name="supportType" defaultValue={t?.supportType ?? "STRAIGHT"} key={`st-${t?.contractType}`}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">None</SelectItem>
                    <SelectItem value="STRAIGHT">Straight</SelectItem>
                    <SelectItem value="BATTLE">Battle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Support %</Label>
                <Input name="supportPct" type="number" min={0} max={100}
                  defaultValue={t?.supportPct ?? 100} key={`sp-${t?.contractNumber}`} />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={isPending}>{isPending ? "Saving…" : "Accept Contract"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
