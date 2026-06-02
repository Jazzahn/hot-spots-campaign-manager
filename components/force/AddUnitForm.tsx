"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { createUnit } from "@/lib/actions/units";
import {
  DRACONIS_REACH_UNITS,
  TABLE_LABELS,
  TABLE_DESCRIPTIONS,
  type AvailabilityTable,
  type DraconisReachUnit,
} from "@/lib/constants/draconis-reach-units";

const ALL_TABLES = Object.keys(TABLE_LABELS) as AvailabilityTable[];
const SUBTABLE_ORDER: Record<string, number> = { A: 0, B: 1, C: 2, Light: 0, Medium: 1, Heavy: 2, Assault: 3 };

export default function AddUnitForm({ companyId }: { companyId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Browse state
  const [tableFilter, setTableFilter] = useState<AvailabilityTable | "ALL">("ALL");
  const [search, setSearch] = useState("");

  // Manual entry state
  const [chassis, setChassis] = useState("");
  const [model, setModel] = useState("");
  const [unitType, setUnitType] = useState("BATTLEMECH");
  const [techBase, setTechBase] = useState("IS");
  const [tonnage, setTonnage] = useState("");
  const [battleValue, setBattleValue] = useState("");
  const [pointValue, setPointValue] = useState("");
  const [isOmni, setIsOmni] = useState(false);

  function resetForm() {
    setChassis(""); setModel(""); setUnitType("BATTLEMECH"); setTechBase("IS");
    setTonnage(""); setBattleValue(""); setPointValue(""); setIsOmni(false);
    setSearch(""); setTableFilter("ALL");
  }

  function addFromBrowse(unit: DraconisReachUnit) {
    startTransition(async () => {
      await createUnit({
        companyId,
        name: unit.model !== unit.chassis ? `${unit.chassis} ${unit.model}` : unit.chassis,
        chassis: unit.chassis,
        model: unit.model,
        unitType: "BATTLEMECH",
        tonnage: unit.tonnage,
        battleValue: unit.battleValue,
        pointValue: unit.pointValue,
        techBase: unit.techBase as never,
        isOmni: unit.isOmni,
      });
      resetForm();
      setOpen(false);
    });
  }

  function handleManualSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      await createUnit({
        companyId,
        name: model ? `${chassis} ${model}` : chassis,
        chassis,
        model: model || chassis,
        unitType: unitType as never,
        tonnage: Number(tonnage),
        battleValue: Number(battleValue),
        pointValue: pointValue ? Number(pointValue) : undefined,
        techBase: techBase as never,
        isOmni,
      });
      resetForm();
      setOpen(false);
    });
  }

  const filtered = DRACONIS_REACH_UNITS
    .filter((u) => tableFilter === "ALL" || u.table === tableFilter)
    .filter((u) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return u.chassis.toLowerCase().includes(q) || u.model.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (a.table !== b.table) return ALL_TABLES.indexOf(a.table) - ALL_TABLES.indexOf(b.table);
      const sa = SUBTABLE_ORDER[a.subtable] ?? 99;
      const sb = SUBTABLE_ORDER[b.subtable] ?? 99;
      if (sa !== sb) return sa - sb;
      return a.battleValue - b.battleValue;
    });

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        <Button>Add Unit</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Unit to Force</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="browse" className="flex-1 flex flex-col min-h-0">
          <TabsList className="shrink-0">
            <TabsTrigger value="browse">Browse Draconis Reach</TabsTrigger>
            <TabsTrigger value="manual">Custom Entry</TabsTrigger>
          </TabsList>

          {/* ── BROWSE TAB ── */}
          <TabsContent value="browse" className="flex-1 flex flex-col min-h-0 mt-3">
            <div className="flex gap-2 shrink-0 mb-2">
              <Input
                placeholder="Search chassis or model…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 h-8 text-sm"
              />
              <Select value={tableFilter} onValueChange={(v) => setTableFilter(v as AvailabilityTable | "ALL")}>
                <SelectTrigger className="w-52 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Tables</SelectItem>
                  {ALL_TABLES.map((t) => (
                    <SelectItem key={t} value={t}>{TABLE_LABELS[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {tableFilter !== "ALL" && (
              <p className="text-xs text-muted-foreground shrink-0 mb-2">
                {TABLE_DESCRIPTIONS[tableFilter]}
              </p>
            )}

            <TooltipProvider delayDuration={300}>
              <div className="flex-1 overflow-y-auto border border-border rounded-md divide-y divide-border/50 min-h-0">
                {filtered.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">No units match.</p>
                ) : (
                  filtered.map((unit, i) => (
                    <UnitRow
                      key={i}
                      unit={unit}
                      showTable={tableFilter === "ALL"}
                      isPending={isPending}
                      onAdd={addFromBrowse}
                    />
                  ))
                )}
              </div>
            </TooltipProvider>

            <p className="text-xs text-muted-foreground shrink-0 mt-2">
              {filtered.length} unit{filtered.length !== 1 ? "s" : ""} — hover for loadout, click to add
            </p>
          </TabsContent>

          {/* ── CUSTOM ENTRY TAB ── */}
          <TabsContent value="manual" className="mt-3">
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Chassis</Label>
                  <Input value={chassis} onChange={(e) => setChassis(e.target.value)} placeholder="e.g. Caesar" required />
                </div>
                <div className="space-y-1.5">
                  <Label>Model/Variant</Label>
                  <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="e.g. CES-3R" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Unit Type</Label>
                  <Select value={unitType} onValueChange={setUnitType}>
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
                  <Select value={techBase} onValueChange={setTechBase}>
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
                  <Input value={tonnage} onChange={(e) => setTonnage(e.target.value)} type="number" min={1} max={200} required placeholder="70" />
                </div>
                <div className="space-y-1.5">
                  <Label>Battle Value</Label>
                  <Input value={battleValue} onChange={(e) => setBattleValue(e.target.value)} type="number" min={1} required placeholder="1578" />
                </div>
                <div className="space-y-1.5">
                  <Label>PV (AS)</Label>
                  <Input value={pointValue} onChange={(e) => setPointValue(e.target.value)} type="number" min={1} placeholder="42" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isOmni" checked={isOmni} onChange={(e) => setIsOmni(e.target.checked)} className="rounded" />
                <Label htmlFor="isOmni">OmniMech / OmniVehicle</Label>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" className="flex-1" disabled={isPending}>{isPending ? "Adding…" : "Add Unit"}</Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function UnitRow({
  unit,
  showTable,
  isPending,
  onAdd,
}: {
  unit: DraconisReachUnit;
  showTable: boolean;
  isPending: boolean;
  onAdd: (u: DraconisReachUnit) => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          disabled={isPending}
          onClick={() => onAdd(unit)}
          className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-muted/50 transition-colors disabled:opacity-50 group"
        >
          <span className="text-xs text-muted-foreground w-8 shrink-0 text-right font-mono">
            {unit.tonnage}t
          </span>

          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium group-hover:text-primary transition-colors">
              {unit.chassis}
            </span>
            {unit.model !== unit.chassis && (
              <span className="text-xs text-muted-foreground ml-1.5">{unit.model}</span>
            )}
          </div>

          {showTable && (
            <Badge variant="outline" className="text-xs shrink-0">
              {TABLE_LABELS[unit.table]}{unit.subtable ? ` · ${unit.subtable}` : ""}
            </Badge>
          )}
          {!showTable && unit.subtable && (
            <Badge variant="outline" className="text-xs shrink-0">{unit.subtable}</Badge>
          )}

          <Badge
            variant={unit.techBase === "CLAN" ? "secondary" : "outline"}
            className="text-xs shrink-0"
          >
            {unit.techBase === "CLAN" ? "Clan" : "IS"}{unit.isOmni ? " Omni" : ""}
          </Badge>

          <span className="text-xs text-muted-foreground shrink-0 w-20 text-right tabular-nums">
            {unit.battleValue.toLocaleString()} BV
          </span>
          <span className="text-xs text-muted-foreground shrink-0 w-12 text-right tabular-nums">
            {unit.pointValue} PV
          </span>
        </button>
      </TooltipTrigger>

      <TooltipContent side="left" className="w-80 p-0 overflow-hidden">
        <RecordSheet unit={unit} />
      </TooltipContent>
    </Tooltip>
  );
}

function RecordSheet({ unit }: { unit: DraconisReachUnit }) {
  const techLabel = unit.techBase === "CLAN" ? "Clan" : "Inner Sphere";
  const weapons = unit.weapons ? unit.weapons.split(" · ") : [];

  return (
    <div className="text-xs font-mono">
      {/* Header */}
      <div className="bg-muted/60 px-3 py-2 border-b border-border">
        <div className="font-bold text-sm text-foreground leading-tight">
          {unit.chassis}
          {unit.model !== unit.chassis && (
            <span className="font-normal text-muted-foreground ml-1.5 text-xs">{unit.model}</span>
          )}
        </div>
        <div className="text-muted-foreground mt-0.5">
          {unit.tonnage}t · {techLabel}{unit.isOmni ? " OmniMech" : ""}
        </div>
      </div>

      {/* Stats row */}
      <div className="px-3 py-2 border-b border-border grid grid-cols-3 gap-x-4">
        <div>
          <div className="text-muted-foreground text-[10px] uppercase tracking-wide">Movement</div>
          <div className="text-foreground font-semibold">
            {unit.walk}/{unit.run}/{unit.jump}
          </div>
          <div className="text-muted-foreground text-[10px]">W/R/J</div>
        </div>
        <div>
          <div className="text-muted-foreground text-[10px] uppercase tracking-wide">Heat Sinks</div>
          <div className="text-foreground font-semibold">{unit.hs}</div>
          <div className="text-muted-foreground text-[10px]">
            {unit.techBase === "CLAN" ? "double" : "single/dbl"}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground text-[10px] uppercase tracking-wide">Armor</div>
          <div className="text-foreground font-semibold">{unit.armor}</div>
          <div className="text-muted-foreground text-[10px]">total pts</div>
        </div>
      </div>

      {/* Weapons */}
      {weapons.length > 0 && (
        <div className="px-3 py-2 border-b border-border">
          <div className="text-muted-foreground text-[10px] uppercase tracking-wide mb-1.5">
            Weapons &amp; Equipment
          </div>
          <div className="space-y-0.5">
            {weapons.map((w, i) => (
              <div key={i} className="flex items-center gap-1.5 text-foreground">
                <span className="text-muted-foreground">›</span>
                <span>{w}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-3 py-1.5 flex justify-between text-muted-foreground">
        <span>BV {unit.battleValue.toLocaleString()}</span>
        <span>PV {unit.pointValue}</span>
        <span className="italic text-[10px] self-center">click to add</span>
      </div>
    </div>
  );
}
