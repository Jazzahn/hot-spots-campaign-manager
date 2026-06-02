"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  // Form field state
  const [chassis, setChassis] = useState("");
  const [model, setModel] = useState("");
  const [unitType, setUnitType] = useState("BATTLEMECH");
  const [techBase, setTechBase] = useState("IS");
  const [tonnage, setTonnage] = useState("");
  const [battleValue, setBattleValue] = useState("");
  const [pointValue, setPointValue] = useState("");
  const [isOmni, setIsOmni] = useState(false);

  // Browse state
  const [tableFilter, setTableFilter] = useState<AvailabilityTable | "ALL">("ALL");
  const [search, setSearch] = useState("");

  function resetForm() {
    setChassis(""); setModel(""); setUnitType("BATTLEMECH"); setTechBase("IS");
    setTonnage(""); setBattleValue(""); setPointValue(""); setIsOmni(false);
    setSearch(""); setTableFilter("ALL");
  }

  function selectUnit(unit: DraconisReachUnit) {
    setChassis(unit.chassis);
    setModel(unit.model);
    setUnitType("BATTLEMECH");
    setTechBase(unit.techBase);
    setTonnage(String(unit.tonnage));
    setBattleValue(String(unit.battleValue));
    setPointValue(String(unit.pointValue));
    setIsOmni(unit.isOmni);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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

  // Filtered + sorted unit list
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
            <TabsTrigger value="manual">Enter Manually</TabsTrigger>
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
              <p className="text-xs text-muted-foreground shrink-0 mb-2 px-0.5">
                {TABLE_DESCRIPTIONS[tableFilter]}
              </p>
            )}

            <div className="flex-1 overflow-y-auto border border-border rounded-md divide-y divide-border/50 min-h-0">
              {filtered.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">No units match.</p>
              ) : (
                filtered.map((unit, i) => (
                  <UnitRow
                    key={i}
                    unit={unit}
                    showTable={tableFilter === "ALL"}
                    onSelect={selectUnit}
                  />
                ))
              )}
            </div>

            <p className="text-xs text-muted-foreground shrink-0 mt-2">
              {filtered.length} unit{filtered.length !== 1 ? "s" : ""} — click a row to pre-fill the form
            </p>
          </TabsContent>

          {/* ── MANUAL / FORM TAB ── */}
          <TabsContent value="manual" className="mt-3">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Chassis</Label>
                  <Input
                    value={chassis}
                    onChange={(e) => setChassis(e.target.value)}
                    placeholder="e.g. Caesar"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Model/Variant</Label>
                  <Input
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. CES-3R"
                  />
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
                  <Input
                    value={tonnage}
                    onChange={(e) => setTonnage(e.target.value)}
                    type="number" min={1} max={200} required placeholder="70"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Battle Value</Label>
                  <Input
                    value={battleValue}
                    onChange={(e) => setBattleValue(e.target.value)}
                    type="number" min={1} required placeholder="1578"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>PV (AS)</Label>
                  <Input
                    value={pointValue}
                    onChange={(e) => setPointValue(e.target.value)}
                    type="number" min={1} placeholder="42"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isOmni"
                  checked={isOmni}
                  onChange={(e) => setIsOmni(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="isOmni">OmniMech / OmniVehicle</Label>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isPending}>
                  {isPending ? "Adding…" : "Add Unit"}
                </Button>
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
  onSelect,
}: {
  unit: DraconisReachUnit;
  showTable: boolean;
  onSelect: (u: DraconisReachUnit) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(unit)}
      className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-muted/50 transition-colors group"
    >
      {/* Tonnage */}
      <span className="text-xs text-muted-foreground w-8 shrink-0 text-right font-mono">
        {unit.tonnage}t
      </span>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium group-hover:text-primary transition-colors">
          {unit.chassis}
        </span>
        {unit.model !== unit.chassis && (
          <span className="text-xs text-muted-foreground ml-1.5">{unit.model}</span>
        )}
      </div>

      {/* Table + subtable badges */}
      {showTable && (
        <Badge variant="outline" className="text-xs shrink-0">
          {TABLE_LABELS[unit.table]}
          {unit.subtable ? ` · ${unit.subtable}` : ""}
        </Badge>
      )}
      {!showTable && unit.subtable && (
        <Badge variant="outline" className="text-xs shrink-0">{unit.subtable}</Badge>
      )}

      {/* Tech badge */}
      <Badge
        variant={unit.techBase === "CLAN" ? "secondary" : "outline"}
        className="text-xs shrink-0"
      >
        {unit.techBase === "CLAN" ? "Clan" : "IS"}
        {unit.isOmni ? " Omni" : ""}
      </Badge>

      {/* Stats */}
      <span className="text-xs text-muted-foreground shrink-0 w-20 text-right">
        {unit.battleValue.toLocaleString()} BV
      </span>
      {unit.pointValue > 0 && (
        <span className="text-xs text-muted-foreground shrink-0 w-12 text-right">
          {unit.pointValue} PV
        </span>
      )}
    </button>
  );
}
