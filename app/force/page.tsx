import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UnitStatusBadge } from "@/components/force/UnitStatusBadge";
import { formatBV } from "@/lib/utils";
import AddUnitForm from "@/components/force/AddUnitForm";
import UnitActions from "@/components/force/UnitActions";
import { calculateRepairCost, getRepairLabel } from "@/lib/calculations/repair";

interface Props {
  searchParams: Promise<{ campaign?: string }>;
}

export default async function ForcePage({ searchParams }: Props) {
  const { campaign: campaignId } = await searchParams;

  if (!campaignId) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Select a campaign from the home page to manage your force.
      </div>
    );
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { units: { orderBy: { createdAt: "asc" } }, pilots: true },
  });

  if (!campaign) return <div className="text-muted-foreground">Campaign not found.</div>;

  const activeUnits = campaign.units.filter((u) => u.status !== "TRULY_DESTROYED");
  const totalBV = activeUnits.reduce((sum, u) => sum + u.battleValue, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{campaign.name} — Force</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {activeUnits.length} units · {formatBV(totalBV)} total
          </p>
        </div>
        <AddUnitForm campaignId={campaignId} />
      </div>

      {activeUnits.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground">No units yet. Add your starting BattleMechs.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {campaign.units.map((unit) => {
            const repairCost = calculateRepairCost(unit.status, unit.tonnage, unit.techBase, unit.unitType);
            const assignedPilot = campaign.pilots.find((p) => p.unitId === unit.id);

            return (
              <Card key={unit.id} className={unit.status === "TRULY_DESTROYED" ? "opacity-50" : ""}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{unit.name}</h3>
                        <UnitStatusBadge status={unit.status} />
                        {unit.techBase !== "IS" && (
                          <Badge variant="secondary">{unit.techBase}</Badge>
                        )}
                        {unit.isOmni && <Badge variant="outline">Omni</Badge>}
                        {unit.isTemporaryHire && <Badge variant="secondary">Temp Hire</Badge>}
                        {!unit.availableNextTrack && unit.status !== "TRULY_DESTROYED" && (
                          <Badge variant="warning">In Repair</Badge>
                        )}
                      </div>
                      <div className="flex gap-4 mt-1.5 text-sm text-muted-foreground">
                        <span>{unit.unitType.replace("_", " ")}</span>
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
                      pilots={campaign.pilots.filter((p) => p.isNamed && !p.isKilled)}
                      repairCost={repairCost}
                      campaignId={campaignId}
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
