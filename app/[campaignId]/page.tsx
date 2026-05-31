import { notFound } from "next/navigation";
import Link from "next/link";
import { getCampaign } from "@/lib/actions/campaign";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatSP, formatBV } from "@/lib/utils";
import { UnitStatusBadge } from "@/components/force/UnitStatusBadge";
import { getScale } from "@/lib/constants/scales";

interface Props {
  params: Promise<{ campaignId: string }>;
}

export default async function DashboardPage({ params }: Props) {
  const { campaignId } = await params;
  const campaign = await getCampaign(campaignId);
  if (!campaign) notFound();

  const activeContract = campaign.contracts.find((c) => c.status === "ACTIVE");
  const namedPilots = campaign.pilots.filter((p) => p.isNamed && !p.isKilled);
  const availableUnits = campaign.units.filter((u) => u.status !== "TRULY_DESTROYED");
  const scaleData = getScale(campaign.scale);

  const totalBV = availableUnits.reduce((sum, u) => sum + u.battleValue, 0);
  const inDebt = campaign.warchest < 0;
  const debtMonths = inDebt ? Math.ceil(Math.abs(campaign.warchest) / scaleData.maintenanceCost) : 0;

  return (
    <div className="space-y-6">
      {/* Key stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Warchest"
          value={formatSP(campaign.warchest)}
          sub={inDebt ? `⚠ Debt (~${debtMonths} months)` : undefined}
          className={inDebt ? "border-destructive/50" : ""}
        />
        <StatCard label="Reputation" value={String(campaign.reputation)} sub={`Scale ${campaign.scale}`} />
        <StatCard label="Month" value={String(campaign.currentMonth)} sub="April 3151 base" />
        <StatCard label="Force BV" value={formatBV(totalBV)} sub={`Limit: ${formatBV(scaleData.bvLimit)}`} />
      </div>

      {/* Active contract */}
      {activeContract ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Active Contract</span>
              <Badge variant="success">ACTIVE</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{activeContract.contractName}</p>
                <p className="text-sm text-muted-foreground">{activeContract.hotSpot} · {activeContract.contractType.replace(/_/g, " ")}</p>
              </div>
              <Button variant="outline" asChild size="sm">
                <Link href={`/${campaignId}/contracts/${activeContract.id}`}>View Contract</Link>
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-4 text-sm border-t border-border pt-3">
              <Stat label="Base Pay" value={`${activeContract.basePayPct}%`} />
              <Stat label="Salvage" value={`${activeContract.salvageRightsPct}%`} />
              <Stat label="Command" value={activeContract.commandRights} />
              <Stat label="Tracks" value={String(activeContract.tracks.length)} />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-between py-6">
            <p className="text-muted-foreground">No active contract. Time to find work.</p>
            <Button asChild size="sm">
              <Link href={`/${campaignId}/contracts`}>Find Contract</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Force & Pilots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span>Force ({availableUnits.length} units)</span>
              <Button variant="ghost" asChild size="sm">
                <Link href={`/${campaignId}/force`}>Manage →</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {availableUnits.length === 0 ? (
              <p className="text-muted-foreground text-sm">No units. Add mechs to your force.</p>
            ) : (
              availableUnits.slice(0, 6).map((unit) => (
                <div key={unit.id} className="flex items-center justify-between text-sm py-1">
                  <div>
                    <span className="font-medium">{unit.name}</span>
                    <span className="text-muted-foreground ml-2 text-xs">{formatBV(unit.battleValue)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {!unit.availableNextTrack && (
                      <span className="text-xs text-yellow-500">In Repair</span>
                    )}
                    <UnitStatusBadge status={unit.status} />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span>Named Pilots ({namedPilots.length}/4)</span>
              <Button variant="ghost" asChild size="sm">
                <Link href={`/${campaignId}/pilots`}>Manage →</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {namedPilots.length === 0 ? (
              <p className="text-muted-foreground text-sm">No named pilots yet.</p>
            ) : (
              namedPilots.map((pilot) => (
                <div key={pilot.id} className="flex items-center justify-between text-sm py-1">
                  <div>
                    <span className="font-medium">{pilot.name}</span>
                    {pilot.callsign && (
                      <span className="text-muted-foreground ml-1 text-xs">&quot;{pilot.callsign}&quot;</span>
                    )}
                    {pilot.wounds > 0 && (
                      <span className="text-red-400 text-xs ml-2">({pilot.wounds} wounds)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>G{pilot.gunnery}/P{pilot.piloting}</span>
                    <span>+{pilot.handicap} BSP</span>
                    <span>{pilot.edgeTokens} Edge</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent transactions */}
      {campaign.transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span>Recent Transactions</span>
              <Button variant="ghost" asChild size="sm">
                <Link href={`/${campaignId}/ledger`}>Full Ledger →</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {[...campaign.transactions].reverse().slice(0, 5).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between text-sm py-1">
                  <span className="text-muted-foreground">{tx.description}</span>
                  <div className="flex items-center gap-4">
                    <span className={tx.amount >= 0 ? "text-green-400" : "text-red-400"}>
                      {tx.amount >= 0 ? "+" : ""}{formatSP(tx.amount)}
                    </span>
                    <span className="text-muted-foreground w-24 text-right">{formatSP(tx.runningBalance)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({ label, value, sub, className }: { label: string; value: string; sub?: string; className?: string }) {
  return (
    <Card className={className}>
      <CardContent className="pt-4 pb-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-medium text-xs">{value}</p>
    </div>
  );
}
