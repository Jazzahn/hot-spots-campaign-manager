import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { getCampaignConflicts } from "@/lib/actions/campaign";

type Conflict = Awaited<ReturnType<typeof getCampaignConflicts>>[number];

interface Props {
  conflicts: Conflict[];
  campaignId: string;
  myCompanyId: string | null;
}

const CONTRACT_TYPE_LABELS: Record<string, string> = {
  RAID: "Raid", EXPEDITION: "Expedition", PIRATE_HUNT: "Pirate Hunt",
  GARRISON: "Garrison", INVASION: "Invasion", RETAINER: "Retainer",
  ACTS_OF_PIRACY: "Acts of Piracy",
};

export default function CampaignConflicts({ conflicts, campaignId, myCompanyId }: Props) {
  if (conflicts.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Active Conflicts
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {conflicts.map((c) => {
          const myContractHere =
            myCompanyId &&
            (c.sideA?.companyId === myCompanyId || c.sideB?.companyId === myCompanyId);

          return (
            <Card key={c.hotSpot} className="border-yellow-500/20">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="text-yellow-500">⚔</span>
                  {c.hotSpot}
                  {c.hsData && (
                    <span className="text-xs font-normal text-muted-foreground">
                      {c.hsData.primaryTerrain} · {c.hsData.faction}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pb-4">
                <Side
                  label="Side A"
                  company={c.sideA ? { name: c.sideA.companyName, contractName: c.sideA.contractName, contractType: c.sideA.contractType, status: c.sideA.status } : null}
                  template={c.opposingA}
                />
                <Side
                  label="Side B"
                  company={c.sideB ? { name: c.sideB.companyName, contractName: c.sideB.contractName, contractType: c.sideB.contractType, status: c.sideB.status } : null}
                  template={c.opposingB}
                />
                {myCompanyId && !myContractHere && (
                  <div className="pt-1">
                    <Button variant="outline" size="sm" asChild className="w-full text-xs">
                      <Link href={`/${campaignId}/${myCompanyId}/contracts`}>
                        Take contract at {c.hotSpot} →
                      </Link>
                    </Button>
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

function Side({
  label,
  company,
  template,
}: {
  label: string;
  company: { name: string; contractName: string; contractType: string; status: string } | null;
  template: { name: string; contractType: string } | null;
}) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="text-xs text-muted-foreground w-10 pt-0.5 shrink-0">{label}</span>
      {company ? (
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          <span className="font-medium truncate">{company.name}</span>
          <span className="text-muted-foreground text-xs truncate">— {company.contractName}</span>
          <Badge variant={company.status === "ACTIVE" ? "success" : "warning"} className="text-xs">
            {company.status}
          </Badge>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <span className="text-green-500/70">●</span>
          <span className="text-xs">
            {template ? `${template.name} (${CONTRACT_TYPE_LABELS[template.contractType] ?? template.contractType})` : "Open"}
          </span>
        </div>
      )}
    </div>
  );
}
