import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import LeaveConflictButton from "@/components/contracts/LeaveConflictButton";
import ReadyUpButton from "@/components/contracts/ReadyUpButton";
import AdvanceMonthButton from "@/components/contracts/AdvanceMonthButton";
import type { getCampaignConflicts } from "@/lib/actions/campaign";
import { formatContractType } from "@/lib/utils";

type Conflict = Awaited<ReturnType<typeof getCampaignConflicts>>[number];
type ConflictEntry = Conflict["sideA"][number];

export default function CampaignConflicts({
  conflicts,
  campaignId,
  campaignCurrentMonth,
  myCompanyId,
  isManager,
}: {
  conflicts: Conflict[];
  campaignId: string;
  campaignCurrentMonth: number;
  myCompanyId: string | null;
  isManager: boolean;
}) {
  // Exclude special schedule types from the conflict system
  const active = conflicts.filter(
    (c) => c.hsData?.scheduleType !== "special"
  );
  if (active.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Active Conflicts
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {active.map((c) => {
          const myEntryA = myCompanyId ? c.sideA.find((e) => e.companyId === myCompanyId) : null;
          const myEntryB = myCompanyId ? c.sideB.find((e) => e.companyId === myCompanyId) : null;
          const myEntry = myEntryA ?? myEntryB ?? null;

          return c.isLocked
            ? <ActiveConflictCard key={c.hotSpot} conflict={c} campaignId={campaignId} campaignCurrentMonth={campaignCurrentMonth} myCompanyId={myCompanyId} myEntry={myEntry} isManager={isManager} />
            : <PendingConflictCard key={c.hotSpot} conflict={c} campaignId={campaignId} campaignCurrentMonth={campaignCurrentMonth} myCompanyId={myCompanyId} myEntry={myEntry} />;
        })}
      </div>
    </div>
  );
}

function PendingConflictCard({
  conflict: c,
  campaignId,
  campaignCurrentMonth,
  myCompanyId,
  myEntry,
}: {
  conflict: Conflict;
  campaignId: string;
  campaignCurrentMonth: number;
  myCompanyId: string | null;
  myEntry: ConflictEntry | null;
}) {
  const onSideA = myCompanyId ? c.sideA.some((e) => e.companyId === myCompanyId) : false;
  const onSideB = myCompanyId ? c.sideB.some((e) => e.companyId === myCompanyId) : false;

  return (
    <Card className="border-yellow-500/20">
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="text-base flex items-center gap-2">
          <span className="text-yellow-500">⚔</span>
          {c.hotSpot}
          {c.hsData && (
            <span className="text-xs font-normal text-muted-foreground">
              {c.hsData.primaryTerrain} · {c.hsData.faction}
            </span>
          )}
          {c.readyCount > 0 && (
            <Badge variant="warning" className="text-xs ml-auto">
              {c.readyCount}/{c.totalCount} ready
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pb-4">
        <SideRow label="Side A" template={c.templateA} companies={c.sideA} />
        <SideRow label="Side B" template={c.templateB} companies={c.sideB} optional={c.opposingSideOptional} />

        {myCompanyId && (
          <div className="flex gap-2 pt-1">
            {myEntry ? (
              <div className="flex gap-2 flex-1">
                <ReadyUpButton
                  contractId={myEntry.contractId}
                  campaignCurrentMonth={campaignCurrentMonth}
                  isReady={myEntry.isReady}
                />
                <LeaveConflictButton contractId={myEntry.contractId} />
              </div>
            ) : (
              <>
                {!onSideA && (
                  <Button variant="outline" size="sm" asChild className="flex-1 text-xs">
                    <Link href={`/${campaignId}/${myCompanyId}/contracts?hotSpot=${encodeURIComponent(c.hotSpot)}&side=A`}>
                      Join Side A{c.templateA ? ` — ${c.templateA.name}` : ""}
                    </Link>
                  </Button>
                )}
                {!onSideB && (
                  <Button variant="outline" size="sm" asChild className="flex-1 text-xs">
                    <Link href={`/${campaignId}/${myCompanyId}/contracts?hotSpot=${encodeURIComponent(c.hotSpot)}&side=B`}>
                      Join Side B{c.templateB ? ` — ${c.templateB.name}` : ""}
                    </Link>
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ActiveConflictCard({
  conflict: c,
  campaignId,
  campaignCurrentMonth,
  myCompanyId,
  myEntry,
  isManager,
}: {
  conflict: Conflict;
  campaignId: string;
  campaignCurrentMonth: number;
  myCompanyId: string | null;
  myEntry: ConflictEntry | null;
  isManager: boolean;
}) {
  const scheduleType = c.hsData?.scheduleType ?? "fixed";

  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="text-base flex items-center gap-2">
          <span className="text-primary">🔒</span>
          {c.hotSpot}
          {c.hsData && (
            <span className="text-xs font-normal text-muted-foreground">
              {c.hsData.primaryTerrain}
            </span>
          )}
          <Badge variant="secondary" className="text-xs ml-auto">
            Month {c.currentConflictMonth}/{c.maxDurationMonths}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pb-4">
        {/* Forces */}
        <div className="space-y-1">
          <SideRow label="Side A" template={c.templateA} companies={c.sideA} />
          <SideRow label="Side B" template={c.templateB} companies={c.sideB} />
        </div>

        {/* Monthly schedule */}
        {scheduleType === "fixed" && c.currentMonthSchedule && (
          <div className="rounded border border-border bg-muted/30 px-3 py-2 space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Month {c.currentConflictMonth} — Expected Tracks
            </p>
            {c.currentMonthSchedule.tracks.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                {c.currentMonthSchedule.note ?? "No tracks this month"}
              </p>
            ) : (
              <>
                {c.currentMonthSchedule.tracks.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <Badge variant="outline" className="text-xs">{t.trackType}</Badge>
                    <span className="text-muted-foreground">
                      {t.attackerSide === "A" ? "Side A attacks" :
                       t.attackerSide === "B" ? "Side B attacks" :
                       t.attackerSide === "winner" ? "Prior winner attacks" :
                       t.attackerSide === "loser" ? "Prior loser attacks" :
                       "Conditional — see notes"}
                    </span>
                    {t.note && <span className="text-muted-foreground/70 truncate">{t.note}</span>}
                  </div>
                ))}
                {c.currentMonthSchedule.isConditional && (
                  <p className="text-xs text-yellow-500/80">⚠ Conditional — {c.currentMonthSchedule.note}</p>
                )}
              </>
            )}
          </div>
        )}

        {scheduleType === "roll-based" && c.hsData?.rollTable && (
          <div className="rounded border border-border bg-muted/30 px-3 py-2 space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Month {c.currentConflictMonth} — Roll {c.hsData.rollsPerMonth}×1D6 for tracks
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
              {c.hsData.rollTable.map((entry) => (
                <div key={entry.roll} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-4 text-right font-mono">{entry.roll}:</span>
                  {entry.trackType
                    ? <><Badge variant="outline" className="text-xs">{entry.trackType}</Badge><span>({entry.attackerSide})</span></>
                    : <span className="italic">No track</span>
                  }
                </div>
              ))}
            </div>
            {c.hsData.rollVictoryNote && (
              <p className="text-xs text-muted-foreground/70 pt-1">{c.hsData.rollVictoryNote}</p>
            )}
          </div>
        )}

        {/* My company's contract link */}
        {myEntry && (
          <div className="flex items-center justify-between pt-1">
            <Button variant="ghost" size="sm" asChild className="text-xs h-7">
              <Link href={`/${campaignId}/${myEntry.companyId}/contracts`}>
                View my contract →
              </Link>
            </Button>
          </div>
        )}

        {/* Campaign Manager: advance month */}
        {isManager && (
          <AdvanceMonthButton
            hotSpot={c.hotSpot}
            campaignId={campaignId}
            campaignCurrentMonth={campaignCurrentMonth}
            currentConflictMonth={c.currentConflictMonth}
            maxDurationMonths={c.maxDurationMonths}
          />
        )}
      </CardContent>
    </Card>
  );
}

function SideRow({
  label,
  template,
  companies,
  optional,
}: {
  label: string;
  template: { name: string; contractType: string } | null;
  companies: ConflictEntry[];
  optional?: boolean;
}) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="text-xs text-muted-foreground w-10 pt-0.5 shrink-0">{label}</span>
      <div className="flex-1 min-w-0 space-y-1">
        {companies.length === 0 ? (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <span className={optional ? "text-muted-foreground/50" : "text-green-500/70"}>●</span>
            {template
              ? `${template.name} (${formatContractType(template.contractType)})${optional ? " — optional" : " — open"}`
              : optional ? "Optional" : "Open"}
          </span>
        ) : (
          companies.map((e) => (
            <div key={e.companyId} className="flex flex-wrap items-center gap-1.5">
              <span className="font-medium text-xs">{e.companyName}</span>
              <Badge variant={e.status === "ACTIVE" ? "success" : "warning"} className="text-xs">
                {e.isReady && e.status === "PENDING" ? "Ready" : e.status}
              </Badge>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
