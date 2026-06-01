import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import LeaveConflictButton from "@/components/contracts/LeaveConflictButton";
import type { getCampaignConflicts } from "@/lib/actions/campaign";
import { formatContractType } from "@/lib/utils";

type Conflict = Awaited<ReturnType<typeof getCampaignConflicts>>[number];
type ConflictEntry = Conflict["sideA"][number];

export default function CampaignConflicts({
  conflicts,
  campaignId,
  myCompanyId,
}: {
  conflicts: Conflict[];
  campaignId: string;
  myCompanyId: string | null;
}) {
  if (conflicts.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Active Conflicts
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {conflicts.map((c) => {
          const isLocked = [...c.sideA, ...c.sideB].some((e) => e.status === "ACTIVE");
          const myEntryA = myCompanyId ? c.sideA.find((e) => e.companyId === myCompanyId) : null;
          const myEntryB = myCompanyId ? c.sideB.find((e) => e.companyId === myCompanyId) : null;
          const myEntry = myEntryA ?? myEntryB ?? null;

          return (
            <Card key={c.hotSpot} className={isLocked ? "border-primary/30" : "border-yellow-500/20"}>
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className={isLocked ? "text-primary" : "text-yellow-500"}>
                    {isLocked ? "🔒" : "⚔"}
                  </span>
                  {c.hotSpot}
                  {c.hsData && (
                    <span className="text-xs font-normal text-muted-foreground">
                      {c.hsData.primaryTerrain} · {c.hsData.faction}
                    </span>
                  )}
                  {isLocked && (
                    <Badge variant="secondary" className="text-xs ml-auto">Active</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pb-4">
                <SideRow label="Side A" template={c.templateA} companies={c.sideA} />
                <SideRow label="Side B" template={c.templateB} companies={c.sideB} optional={c.opposingSideOptional} />

                {myCompanyId && !isLocked && (
                  <div className="flex gap-2 pt-1">
                    {myEntry ? (
                      <LeaveConflictButton contractId={myEntry.contractId} />
                    ) : (
                      <>
                        <Button variant="outline" size="sm" asChild className="flex-1 text-xs">
                          <Link href={`/${campaignId}/${myCompanyId}/contracts?hotSpot=${encodeURIComponent(c.hotSpot)}&side=A`}>
                            Join Side A{c.templateA ? ` — ${c.templateA.name}` : ""}
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild className="flex-1 text-xs">
                          <Link href={`/${campaignId}/${myCompanyId}/contracts?hotSpot=${encodeURIComponent(c.hotSpot)}&side=B`}>
                            Join Side B{c.templateB ? ` — ${c.templateB.name}` : ""}
                          </Link>
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
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
                {e.status}
              </Badge>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
