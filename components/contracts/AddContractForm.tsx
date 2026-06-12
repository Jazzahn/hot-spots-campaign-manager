"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectGroup, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createContract } from "@/lib/actions/contracts";
import {
  getRandomContractOffer,
  rollRandomContractOffer,
  acceptRandomContractOffer,
  type RandomOfferView,
} from "@/lib/actions/random-contract";
import { HOT_SPOTS_DATA, type ContractTemplate } from "@/lib/constants/hot-spots-data";
import { HIRING_HALL_LABELS, type HiringHall } from "@/lib/constants/random-contract";
import NegotiationPanel from "@/components/contracts/NegotiationPanel";
import { valuesToSteps, type TermKey } from "@/lib/calculations/contract-negotiation";
import type { CommandRightsValue, SupportValue } from "@/lib/constants/contract-steps";
import { formatContractType } from "@/lib/utils";

interface Props {
  companyId: string;
  currentScale: number;
  reputation: number;
  initialHotSpot?: string;
  initialSide?: "A" | "B";
}

const DOBLESS = "__DOBLESS__";

// Neutral baseline offer used when negotiating without a Hot Spot template.
const FALLBACK_PRESENTED = {
  basePayPct: 100,
  commandRights: "HOUSE" as CommandRightsValue,
  salvageRightsPct: 40,
  supportType: "STRAIGHT" as SupportValue["type"],
  supportPct: 100,
  transportPct: 100,
};

export default function AddContractForm({ companyId, currentScale, reputation, initialHotSpot, initialSide }: Props) {
  const [isPending, startTransition] = useTransition();
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(() => {
    if (!initialHotSpot || !initialSide) return null;
    const hs = HOT_SPOTS_DATA.find((h) => h.planet === initialHotSpot || h.name === initialHotSpot);
    return hs?.contracts.find((c) => c.side === initialSide) ?? null;
  });
  const [open, setOpen] = useState(() => !!initialHotSpot && !!initialSide);
  const [scale, setScale] = useState(currentScale);
  const [negotiationLegal, setNegotiationLegal] = useState(true);

  // Dobless (random contract) state
  const [isDobless, setIsDobless] = useState(false);
  const [hiringHall, setHiringHall] = useState<HiringHall>("TYBALT");
  const [offer, setOffer] = useState<RandomOfferView | null>(null);

  function reset() {
    setSelectedTemplate(null);
    setIsDobless(false);
    setOffer(null);
  }

  function handleSourceSelect(value: string) {
    if (value === DOBLESS) {
      setSelectedTemplate(null);
      setIsDobless(true);
      // Load any offer already rolled for this month.
      startTransition(async () => {
        setOffer(await getRandomContractOffer(companyId));
      });
      return;
    }
    setIsDobless(false);
    setOffer(null);
    const [hotSpot, side] = value.split("|");
    const hs = HOT_SPOTS_DATA.find((h) => h.name === hotSpot);
    setSelectedTemplate(hs?.contracts.find((c) => c.side === (side as "A" | "B")) ?? null);
  }

  function handleRoll() {
    startTransition(async () => {
      setOffer(await rollRandomContractOffer(companyId, hiringHall));
    });
  }

  const t = selectedTemplate;

  // Presented (default) steps: from the Dobless roll, the template values, or the fallback.
  const presentedSteps: Record<TermKey, number> = useMemo(() => {
    if (isDobless && offer) {
      const pv = offer.roll.playerValues;
      return valuesToSteps({
        basePayPct: pv.basePayPct,
        commandRights: pv.commandRights,
        salvageRightsPct: pv.salvageRightsPct,
        supportType: pv.supportType,
        supportPct: pv.supportPct,
        transportPct: pv.transportPct,
      });
    }
    const v = t
      ? {
          basePayPct: t.basePayPct,
          commandRights: t.commandRights as CommandRightsValue,
          salvageRightsPct: t.salvageRightsPct,
          supportType: t.supportType as SupportValue["type"],
          supportPct: t.supportPct,
          transportPct: t.transportPct,
        }
      : FALLBACK_PRESENTED;
    return valuesToSteps(v);
  }, [isDobless, offer, t]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!negotiationLegal) return;
    const data = new FormData(e.currentTarget);

    if (isDobless) {
      if (!offer) return;
      startTransition(async () => {
        await acceptRandomContractOffer({
          offerId: offer.id,
          contractName: data.get("contractName") as string,
          scale: Number(data.get("scale")),
          reputation,
          basePayPct: Number(data.get("basePayPct")),
          supportType: data.get("supportType") as string,
          supportPct: Number(data.get("supportPct")),
          salvageRightsPct: Number(data.get("salvageRightsPct")),
          commandRights: data.get("commandRights") as string,
          transportPct: Number(data.get("transportPct")),
        });
        setOpen(false);
        reset();
      });
      return;
    }

    startTransition(async () => {
      await createContract({
        companyId,
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
        defaultBasePayPct: Number(data.get("defaultBasePayPct")),
        defaultSupportType: data.get("defaultSupportType") as string,
        defaultSupportPct: Number(data.get("defaultSupportPct")),
        defaultSalvageRightsPct: Number(data.get("defaultSalvageRightsPct")),
        defaultCommandRights: data.get("defaultCommandRights") as string,
        defaultTransportPct: Number(data.get("defaultTransportPct")),
        reputation,
      });
      setOpen(false);
      reset();
    });
  }

  const roll = offer?.roll ?? null;
  const offerConsumed = isDobless && offer?.status === "CONSUMED";
  // Show the negotiation + accept block once a template is chosen, in Dobless mode after a roll
  // (but not once that roll has already been accepted this month), or in manual mode.
  const showTerms = (!isDobless || !!offer) && !offerConsumed;

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <Button>Negotiate Contract</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Negotiate Contract</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Source picker */}
          <div className="space-y-1.5">
            <Label>Contract Source (pre-fills default terms)</Label>
            <Select onValueChange={handleSourceSelect} value={isDobless ? DOBLESS : undefined}>
              <SelectTrigger><SelectValue placeholder="Select from book, Dobless random, or fill in manually…" /></SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Dobless Information Services</SelectLabel>
                  <SelectItem value={DOBLESS}>Random Contract (roll)</SelectItem>
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Hot Spot Contracts</SelectLabel>
                  {HOT_SPOTS_DATA.map((hs) =>
                    hs.contracts.map((c) => (
                      <SelectItem key={`${hs.name}|${c.side}`} value={`${hs.name}|${c.side}`}>
                        {hs.name}: {c.name} ({c.contractType})
                      </SelectItem>
                    ))
                  )}
                </SelectGroup>
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

          {/* Dobless: hiring hall + roll (before a roll exists) */}
          {isDobless && !offer && (
            <div className="space-y-3 rounded border border-border p-3">
              <div className="space-y-1.5">
                <Label>Hiring Hall</Label>
                <Select value={hiringHall} onValueChange={(v) => setHiringHall(v as HiringHall)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TYBALT">{HIRING_HALL_LABELS.TYBALT} (−1 contract type)</SelectItem>
                    <SelectItem value="PROSERPINA">{HIRING_HALL_LABELS.PROSERPINA} (+1 contract type)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">
                One random contract may be generated per company per month. Once rolled, the offer is locked until the month advances.
              </p>
              <Button type="button" className="w-full" onClick={handleRoll} disabled={isPending}>
                {isPending ? "Rolling…" : "Roll Contract"}
              </Button>
            </div>
          )}

          {/* Dobless: a contract was already taken this month */}
          {offerConsumed && (
            <div className="rounded border border-border p-3 text-sm text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">Random contract already taken this month.</p>
              <p>{roll ? `${roll.variantLabel} — ${roll.system}` : ""} has been accepted. A new random contract can be rolled once the campaign month advances.</p>
            </div>
          )}

          {/* Dobless: rolled offer summary */}
          {isDobless && !offerConsumed && roll && (
            <div className="text-xs text-muted-foreground bg-muted rounded p-2 space-y-1">
              <p><span className="font-medium">Employer:</span> {roll.breakdown.find((b) => b.label === "Employer")?.detail}</p>
              <p><span className="font-medium">System:</span> {roll.system} — {roll.terrain} ({roll.jumps} jump{roll.jumps === 1 ? "" : "s"})</p>
              <p><span className="font-medium">Opposing force:</span> {roll.opposingFaction} — {formatContractType(roll.opposingContractType)}</p>
              <details className="mt-1">
                <summary className="cursor-pointer">Roll breakdown</summary>
                <ul className="mt-1 space-y-0.5">
                  {roll.breakdown.map((b, i) => (
                    <li key={i}><span className="font-medium">{b.label}:</span> {b.detail}</li>
                  ))}
                </ul>
              </details>
            </div>
          )}

          {showTerms && (
            <>
              <div className="grid grid-cols-2 gap-3">
                {isDobless ? (
                  <>
                    <div className="space-y-1.5 col-span-2">
                      <Label>Contract Name</Label>
                      <Input name="contractName" key={`cn-${offer?.id}`}
                        defaultValue={roll ? `${roll.variantLabel} — ${roll.system}` : ""} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Contract Type</Label>
                      <Input value={roll ? formatContractType(roll.contractType) : ""} disabled readOnly />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Duration</Label>
                      <Input value={roll ? `${roll.lengthMonths} months` : ""} disabled readOnly />
                    </div>
                    <div className="space-y-1.5 col-span-2">
                      <Label>System (Hot Spot)</Label>
                      <Input value={roll?.system ?? ""} disabled readOnly />
                    </div>
                  </>
                ) : (
                  <>
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
                      <Label>Duration (months)</Label>
                      <Input name="durationMonths" type="number" min={1} max={15}
                        defaultValue={t?.durationMonths ?? 3} key={`dur-${t?.contractNumber}`} required />
                    </div>
                  </>
                )}
                <div className="space-y-1.5">
                  <Label>Scale</Label>
                  <Select name="scale" value={String(scale)} onValueChange={(v) => setScale(Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Scale 1 (3,000 BV)</SelectItem>
                      <SelectItem value="2">Scale 2 (6,000 BV)</SelectItem>
                      <SelectItem value="3">Scale 3 (9,000 BV)</SelectItem>
                      <SelectItem value="4">Scale 4 (12,000 BV)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <NegotiationPanel
                  key={isDobless ? `dobless-${offer?.id}` : (t?.contractNumber ?? "manual")}
                  defaults={presentedSteps}
                  scale={scale}
                  reputation={reputation}
                  commandNonNegotiable={!isDobless && (t?.commandNonNegotiable ?? false)}
                  onValidityChange={setNegotiationLegal}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" className="flex-1" disabled={isPending || !negotiationLegal}>
                  {isPending ? "Saving…" : "Accept Contract"}
                </Button>
              </div>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
