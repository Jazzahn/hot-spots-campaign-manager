"use client";

import { useTransition } from "react";
import type { Unit, Pilot } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateUnitStatus, markUnitRepaired, deleteUnit } from "@/lib/actions/units";

interface Props {
  unit: Unit;
  pilots: Pilot[];
  repairCost: number;
  companyId: string;
}

export default function UnitActions({ unit, repairCost }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(status: string) {
    startTransition(async () => { await updateUnitStatus(unit.id, status as never); });
  }

  function handleRepair() {
    startTransition(async () => { await markUnitRepaired(unit.id); });
  }

  function handleDelete() {
    if (!confirm(`Remove ${unit.name} from your force?`)) return;
    startTransition(async () => { await deleteUnit(unit.id); });
  }

  if (unit.status === "TRULY_DESTROYED") {
    return (
      <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={handleDelete} disabled={isPending}>
        Remove
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      {unit.status !== "OPERATIONAL" && (
        <Button variant="outline" size="sm" onClick={handleRepair} disabled={isPending}>
          Repair ({repairCost.toLocaleString()} SP)
        </Button>
      )}
      <Select
        value={unit.status}
        onValueChange={handleStatusChange}
        disabled={isPending}
      >
        <SelectTrigger className="w-40 text-xs h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="OPERATIONAL">Operational</SelectItem>
          <SelectItem value="ARMOR_DAMAGE">Armor Damage</SelectItem>
          <SelectItem value="STRUCTURE_CRIT">Structure/Crit</SelectItem>
          <SelectItem value="CRIPPLED">Crippled</SelectItem>
          <SelectItem value="DESTROYED">Destroyed</SelectItem>
          <SelectItem value="TRULY_DESTROYED">Truly Destroyed</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={handleDelete} disabled={isPending}>
        ✕
      </Button>
    </div>
  );
}
