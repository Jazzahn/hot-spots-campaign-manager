"use client";

import { useState, useTransition } from "react";
import type { Contract, Unit, Pilot } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { recordTrack } from "@/lib/actions/tracks";
import { calculateCombatPay } from "@/lib/calculations/combat-pay";
import { formatSP } from "@/lib/utils";
import { GENERAL_TRACKS } from "@/lib/constants/general-tracks";

const TRACK_NAMES = GENERAL_TRACKS.map((t) => t.name);

interface UnitResult {
  unitId: string;
  damageResult: string;
  retreated: boolean;
}

interface PilotResult {
  pilotId: string;
  wasMVP: boolean;
  spEarned: number;
  spToGunnery: number;
  spToPiloting: number;
  spToEdgeTokens: number;
  spToEdgeAbilities: number;
}

interface Props {
  contract: Contract & { tracks?: { trackNumber: number }[] };
  units: Unit[];
  pilots: Pilot[];
  companyId: string;
}

export default function AddTrackForm({ contract, units, pilots, companyId }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);
  const [selectedPilotIds, setSelectedPilotIds] = useState<string[]>([]);
  const [result, setResult] = useState<string>("SUCCESS");
  const [scale, setScale] = useState(contract.scale);
  const [trackType, setTrackType] = useState("Strike");

  const selectedTrackData = GENERAL_TRACKS.find((t) => t.name === trackType);

  const combatPayPreview = calculateCombatPay(result as never, scale);
  const nextTrackNum = contract.tracks ? (contract.tracks as { trackNumber: number }[]).length + 1 : 1;

  function toggleUnit(unitId: string) {
    setSelectedUnitIds((prev) =>
      prev.includes(unitId) ? prev.filter((id) => id !== unitId) : [...prev, unitId]
    );
  }

  function togglePilot(pilotId: string) {
    setSelectedPilotIds((prev) =>
      prev.includes(pilotId) ? prev.filter((id) => id !== pilotId) : [...prev, pilotId]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const month = Number(data.get("month"));
    const trackType = data.get("trackType") as string;
    const playerVP = Number(data.get("playerVP"));
    const opponentVP = Number(data.get("opponentVP"));
    const notes = data.get("notes") as string;

    const unitResults: UnitResult[] = selectedUnitIds.map((uid) => ({
      unitId: uid,
      damageResult: (data.get(`unit_damage_${uid}`) as string) || "OPERATIONAL",
      retreated: data.get(`unit_retreated_${uid}`) === "on",
    }));

    const pilotResults: PilotResult[] = selectedPilotIds.map((pid) => {
      const spEarned = Number(data.get(`pilot_sp_${pid}`) || 0);
      return {
        pilotId: pid,
        wasMVP: data.get(`pilot_mvp_${pid}`) === "on",
        spEarned,
        spToGunnery: Number(data.get(`pilot_gun_${pid}`) || 0),
        spToPiloting: Number(data.get(`pilot_pil_${pid}`) || 0),
        spToEdgeTokens: Number(data.get(`pilot_edge_${pid}`) || 0),
        spToEdgeAbilities: Number(data.get(`pilot_abil_${pid}`) || 0),
      };
    });

    // Salvage items from form
    const salvageCount = Number(data.get("salvageCount") || 0);
    const salvageItems = Array.from({ length: salvageCount }, (_, i) => ({
      unitName: data.get(`salvage_name_${i}`) as string,
      battleValue: Number(data.get(`salvage_bv_${i}`) || 0),
      salvageValue: Math.floor(Number(data.get(`salvage_bv_${i}`) || 0) / 2),
      playerShare: Math.floor(
        (Number(data.get(`salvage_bv_${i}`) || 0) / 2) * (contract.salvageRightsPct / 100)
      ),
    })).filter((s) => s.unitName);

    startTransition(async () => {
      await recordTrack(
        {
          contractId: contract.id,
          trackNumber: nextTrackNum,
          month,
          trackType,
          scale,
          result: result as never,
          playerVP,
          opponentVP,
          notes,
          unitResults,
          pilotResults,
          salvageItems,
        },
        companyId
      );
      setOpen(false);
      setSelectedUnitIds([]);
      setSelectedPilotIds([]);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Record Track {nextTrackNum}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Track {nextTrackNum}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Basic info */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Month</Label>
              <Input name="month" type="number" min={1} defaultValue={1} required />
            </div>
            <div className="space-y-1.5">
              <Label>Track Type</Label>
              <Select name="trackType" defaultValue="Strike" onValueChange={setTrackType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TRACK_NAMES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Scale</Label>
              <Select value={String(scale)} onValueChange={(v) => setScale(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4].map((s) => (
                    <SelectItem key={s} value={String(s)}>Scale {s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Track rules summary */}
          {selectedTrackData && (
            <div className="bg-muted rounded p-3 text-xs space-y-2">
              <p className="font-medium text-foreground">{selectedTrackData.description}</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-muted-foreground">Attacker:</span> {selectedTrackData.attackerRole}
                </div>
                <div>
                  <span className="text-muted-foreground">Defender:</span> {selectedTrackData.defenderRole}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground font-medium">Objectives:</span>
                <ul className="mt-1 space-y-0.5">
                  {selectedTrackData.objectives.map((obj) => (
                    <li key={obj.name} className="flex gap-1">
                      <span className={obj.side === "ATTACKER" ? "text-blue-400" : obj.side === "DEFENDER" ? "text-orange-400" : "text-purple-400"}>
                        [{obj.vp}]
                      </span>
                      <span><span className="font-medium">{obj.name}:</span> {obj.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-muted-foreground"><span className="font-medium">Salvage:</span> {selectedTrackData.salvageRule}</p>
              <p className="text-muted-foreground"><span className="font-medium">Ends:</span> {selectedTrackData.trackEnd}</p>
            </div>
          )}

          {/* Result */}
          <div className="space-y-1.5">
            <Label>Track Result</Label>
            <Select value={result} onValueChange={setResult}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL_OBJECTIVES">All Objectives Completed (+{formatSP(calculateCombatPay("ALL_OBJECTIVES", scale))})</SelectItem>
                <SelectItem value="SUCCESS">Successful (+{formatSP(calculateCombatPay("SUCCESS", scale))})</SelectItem>
                <SelectItem value="UNSUCCESSFUL">Unsuccessful (+{formatSP(calculateCombatPay("UNSUCCESSFUL", scale))})</SelectItem>
                <SelectItem value="INCOMPLETE">Incomplete / Broke Contract (+0)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-primary">Combat pay: {formatSP(combatPayPreview)}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Your VP</Label>
              <Input name="playerVP" type="number" min={0} defaultValue={0} />
            </div>
            <div className="space-y-1.5">
              <Label>Opponent VP</Label>
              <Input name="opponentVP" type="number" min={0} defaultValue={0} />
            </div>
          </div>

          {/* Units */}
          {units.length > 0 && (
            <div className="space-y-2">
              <Label>Units Deployed</Label>
              {units.map((unit) => (
                <div key={unit.id} className="border border-border rounded p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`unit_${unit.id}`}
                      checked={selectedUnitIds.includes(unit.id)}
                      onChange={() => toggleUnit(unit.id)}
                      className="rounded"
                    />
                    <label htmlFor={`unit_${unit.id}`} className="text-sm font-medium cursor-pointer">
                      {unit.name}
                    </label>
                  </div>
                  {selectedUnitIds.includes(unit.id) && (
                    <div className="ml-6 grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Damage Result</Label>
                        <Select name={`unit_damage_${unit.id}`} defaultValue="OPERATIONAL">
                          <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="OPERATIONAL">Operational</SelectItem>
                            <SelectItem value="ARMOR_DAMAGE">Armor Damage</SelectItem>
                            <SelectItem value="STRUCTURE_CRIT">Structure/Critical</SelectItem>
                            <SelectItem value="CRIPPLED">Crippled</SelectItem>
                            <SelectItem value="DESTROYED">Destroyed</SelectItem>
                            <SelectItem value="TRULY_DESTROYED">Truly Destroyed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-1 pt-4">
                        <input type="checkbox" name={`unit_retreated_${unit.id}`} id={`ret_${unit.id}`} />
                        <label htmlFor={`ret_${unit.id}`} className="text-xs">Retreated</label>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Named Pilots SP allocation */}
          {pilots.length > 0 && (
            <div className="space-y-2">
              <Label>Named Pilots</Label>
              <p className="text-xs text-muted-foreground">
                Max {200 * scale} SP total to pilots (100 SP max per pilot per track)
              </p>
              {pilots.map((pilot) => (
                <div key={pilot.id} className="border border-border rounded p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`pilot_${pilot.id}`}
                      checked={selectedPilotIds.includes(pilot.id)}
                      onChange={() => togglePilot(pilot.id)}
                      className="rounded"
                    />
                    <label htmlFor={`pilot_${pilot.id}`} className="text-sm font-medium cursor-pointer">
                      {pilot.name}{pilot.callsign ? ` "${pilot.callsign}"` : ""}
                    </label>
                    <span className="text-xs text-muted-foreground">G{pilot.gunnery}/P{pilot.piloting}</span>
                  </div>
                  {selectedPilotIds.includes(pilot.id) && (
                    <div className="ml-6 grid grid-cols-2 md:grid-cols-3 gap-2">
                      <div className="flex items-center gap-1">
                        <input type="checkbox" name={`pilot_mvp_${pilot.id}`} id={`mvp_${pilot.id}`} />
                        <label htmlFor={`mvp_${pilot.id}`} className="text-xs">MVP (+20 SP bonus)</label>
                      </div>
                      <div className="space-y-1 col-span-2 md:col-span-3">
                        <Label className="text-xs">SP earned this track (max 100)</Label>
                        <Input name={`pilot_sp_${pilot.id}`} type="number" min={0} max={100} defaultValue={0} className="h-7 text-xs" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">→ Gunnery SP</Label>
                        <Input name={`pilot_gun_${pilot.id}`} type="number" min={0} defaultValue={0} className="h-7 text-xs" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">→ Piloting SP</Label>
                        <Input name={`pilot_pil_${pilot.id}`} type="number" min={0} defaultValue={0} className="h-7 text-xs" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">→ Edge Tokens SP</Label>
                        <Input name={`pilot_edge_${pilot.id}`} type="number" min={0} defaultValue={0} className="h-7 text-xs" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">→ Edge Abilities SP</Label>
                        <Input name={`pilot_abil_${pilot.id}`} type="number" min={0} defaultValue={0} className="h-7 text-xs" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Salvage */}
          {contract.salvageRightsPct > 0 && (
            <div className="space-y-2">
              <Label>Salvage (salvage rights: {contract.salvageRightsPct}%)</Label>
              <input type="hidden" name="salvageCount" id="salvageCountInput" value="3" />
              {[0, 1, 2].map((i) => (
                <div key={i} className="grid grid-cols-2 gap-2">
                  <Input name={`salvage_name_${i}`} placeholder={`Salvage unit ${i + 1} name`} className="text-xs h-8" />
                  <Input name={`salvage_bv_${i}`} type="number" placeholder="BV" min={0} className="text-xs h-8" />
                </div>
              ))}
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Notes (optional)</Label>
            <Input name="notes" placeholder="Battle notes…" />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? "Recording…" : `Record Track (+${formatSP(combatPayPreview)})`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
