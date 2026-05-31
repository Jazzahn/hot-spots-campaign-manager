import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatSP } from "@/lib/utils";
import { UnitStatusBadge } from "@/components/force/UnitStatusBadge";
import { calculateCombatPay } from "@/lib/calculations/combat-pay";
import ContractActions from "@/components/contracts/ContractActions";
import AddTrackForm from "@/components/tracks/AddTrackForm";

interface Props {
  params: Promise<{ id: string }>;
}

const RESULT_LABELS: Record<string, string> = {
  ALL_OBJECTIVES: "All Objectives",
  SUCCESS: "Success",
  UNSUCCESSFUL: "Unsuccessful",
  INCOMPLETE: "Incomplete",
};

const RESULT_VARIANT: Record<string, "success" | "warning" | "danger" | "secondary"> = {
  ALL_OBJECTIVES: "success",
  SUCCESS: "success",
  UNSUCCESSFUL: "warning",
  INCOMPLETE: "danger",
};

export default async function ContractDetailPage({ params }: Props) {
  const { id } = await params;

  const contract = await prisma.contract.findUnique({
    where: { id },
    include: {
      campaign: { include: { units: true, pilots: { include: { unit: true } } } },
      tracks: {
        include: {
          trackUnits: { include: { unit: true } },
          trackPilots: { include: { pilot: true } },
          salvageItems: true,
        },
        orderBy: { trackNumber: "asc" },
      },
    },
  });

  if (!contract) notFound();

  const campaign = contract.campaign;
  const totalCombatPay = contract.tracks.reduce((sum, t) => sum + t.combatPay, 0);
  const maintenanceCost = 500 * contract.scale;
  const basePay = Math.floor(maintenanceCost * (contract.basePayPct / 100));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href={`/contracts?campaign=${campaign.id}`}
              className="text-muted-foreground text-sm hover:text-foreground"
            >
              ← Contracts
            </Link>
          </div>
          <h1 className="text-2xl font-bold mt-1">{contract.contractName}</h1>
          <p className="text-muted-foreground text-sm">{contract.hotSpot} · {contract.contractType.replace("_", " ")} · Scale {contract.scale}</p>
        </div>
        <ContractActions contract={contract} campaignId={campaign.id} />
      </div>

      {/* Terms summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>Contract Terms</span>
            <Badge variant={contract.status === "ACTIVE" ? "success" : contract.status === "BROKEN" ? "danger" : "secondary"}>
              {contract.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <Stat label="Base Pay" value={`${contract.basePayPct}%`} sub={`${formatSP(basePay)}/mo`} />
            <Stat label="Support" value={`${contract.supportType} ${contract.supportPct}%`} />
            <Stat label="Salvage" value={`${contract.salvageRightsPct}%`} />
            <Stat label="Command" value={contract.commandRights} />
            <Stat label="Transport" value={`${contract.transportPct}%`} />
          </div>
          <div className="mt-3 pt-3 border-t border-border grid grid-cols-3 gap-4 text-sm">
            <Stat label="Duration" value={`${contract.durationMonths} months`} />
            <Stat label="Tracks Played" value={String(contract.tracks.length)} />
            <Stat label="Total Combat Pay" value={formatSP(totalCombatPay)} />
          </div>
        </CardContent>
      </Card>

      {/* Tracks */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Tracks</h2>
          {contract.status === "ACTIVE" && (
            <AddTrackForm
              contract={contract}
              units={campaign.units.filter((u) => u.availableNextTrack && u.status !== "TRULY_DESTROYED")}
              pilots={campaign.pilots.filter((p) => p.isNamed && !p.isKilled)}
              campaignId={campaign.id}
            />
          )}
        </div>

        {contract.tracks.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              <p className="text-muted-foreground">No tracks yet.</p>
            </CardContent>
          </Card>
        ) : (
          contract.tracks.map((track) => (
            <Card key={track.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">Track {track.trackNumber} — {track.trackType}</span>
                      <Badge variant={RESULT_VARIANT[track.result] ?? "outline"}>
                        {RESULT_LABELS[track.result]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Month {track.month} · Scale {track.scale} ·
                      VP: {track.playerVP} vs {track.opponentVP}
                    </p>

                    {/* Units */}
                    {track.trackUnits.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {track.trackUnits.map((tu) => (
                          <div key={tu.id} className="flex items-center gap-1 text-xs">
                            <span>{tu.unit.name}</span>
                            {tu.damageResult !== "OPERATIONAL" && (
                              <UnitStatusBadge status={tu.damageResult} />
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Pilots */}
                    {track.trackPilots.length > 0 && (
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                        {track.trackPilots.map((tp) => (
                          <span key={tp.id}>
                            {tp.pilot.name}
                            {tp.wasMVP && " ⭐"}
                            {tp.spEarned > 0 && ` +${tp.spEarned} SP`}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Salvage */}
                    {track.salvageItems.length > 0 && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Salvage: {track.salvageItems.map((s) => s.unitName).join(", ")}
                        {" ("}+{formatSP(track.salvageItems.reduce((sum, s) => sum + s.playerShare, 0))}
                        {")"}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-green-400">{formatSP(track.combatPay)}</p>
                    <p className="text-xs text-muted-foreground">combat pay</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-medium">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
