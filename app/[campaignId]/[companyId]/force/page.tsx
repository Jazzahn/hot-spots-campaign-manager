import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UnitStatusBadge } from "@/components/force/UnitStatusBadge";
import { formatBV } from "@/lib/utils";
import AddUnitForm from "@/components/force/AddUnitForm";
import UnitActions from "@/components/force/UnitActions";
import { calculateRepairCost, getRepairLabel } from "@/lib/calculations/repair";
import { getCompanyForForce } from "@/lib/actions/company";

interface Props {
  params: Promise<{ campaignId: string; companyId: string }>;
}

export default async function ForcePage({ params }: Props) {
  const { campaignId, companyId } = await params;
  const company = await getCompanyForForce(companyId);
  if (!company || company.campaignId !== campaignId) notFound();

  const activeUnits = company.units.filter((u) => u.status !== "TRULY_DESTROYED");
  const totalBV = activeUnits.reduce((sum, u) => sum + u.battleValue, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Force</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {activeUnits.length} units · {formatBV(totalBV)} total
          </p>
        </div>
        <AddUnitForm companyId={companyId} />
      </div>

      {activeUnits.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground">No units yet. Add your starting BattleMechs.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {company.units.map((unit) => {
            const repairCost = calculateRepairCost(unit.status, unit.tonnage, unit.techBase, unit.unitType);
            const assignedPilot = company.pilots.find((p) => p.unitId === unit.id);

            return (
              <Card key={unit.id} className={unit.status === "TRULY_DESTROYED" ? "opacity-50" : ""}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{unit.name}</h3>
                        <UnitStatusBadge status={unit.status} />
                        {unit.techBase !== "IS" && <Badge variant="secondary">{unit.techBase}</Badge>}
                        {unit.isOmni && <Badge variant="outline">Omni</Badge>}
                        {unit.isTemporaryHire && <Badge variant="secondary">Temp Hire</Badge>}
                        {!unit.availableNextTrack && unit.status !== "TRULY_DESTROYED" && (
                          <Badge variant="warning">In Repair</Badge>
                        )}
                      </div>
                      <div className="flex gap-4 mt-1.5 text-sm text-muted-foreground">
                        <span>{unit.unitType.replace(/_/g, " ")}</span>
                        <span>{unit.tonnage}t</span>
                        <span>{formatBV(unit.battleValue)}</span>
                        {assignedPilot && (
                          <span className="text-foreground">
                            Pilot: <span className="font-medium">{assignedPilot.name}</span>
                          </span>
                        )}
                      </div>
                      {unit.status !== "OPERATIONAL" && unit.status !== "TRULY_DESTROYED" && (
                        <p className="text-xs text-yellow-400 mt-1">
                          Repair: {getRepairLabel(unit.status)} — {repairCost.toLocaleString()} SP
                        </p>
                      )}
                    </div>
                    <UnitActions
                      unit={unit}
                      pilots={company.pilots.filter((p) => p.isNamed && !p.isKilled)}
                      repairCost={repairCost}
                      companyId={companyId}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
