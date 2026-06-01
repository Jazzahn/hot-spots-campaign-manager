import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AddContractForm from "@/components/contracts/AddContractForm";
import { formatSP } from "@/lib/utils";
import { getScale } from "@/lib/constants/scales";
import { getCompanyForContracts } from "@/lib/actions/company";
import { getSessionFromCookies } from "@/lib/auth/session";

interface Props {
  params: Promise<{ campaignId: string; companyId: string }>;
  searchParams: Promise<{ hotSpot?: string; side?: string }>;
}

const STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "outline" | "secondary"> = {
  ACTIVE: "success",
  PENDING: "warning",
  COMPLETED: "secondary",
  BROKEN: "danger",
};

export default async function ContractsPage({ params, searchParams }: Props) {
  const [{ campaignId, companyId }, sp] = await Promise.all([params, searchParams]);
  const [company, session] = await Promise.all([getCompanyForContracts(companyId), getSessionFromCookies()]);
  if (!company || company.campaignId !== campaignId) notFound();
  const canWrite = session.role === "CAMPAIGN_MANAGER" || session.userId === company.userId;
  const initialHotSpot = sp.hotSpot;
  const initialSide = (sp.side === "A" || sp.side === "B") ? sp.side : undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contracts</h1>
          <p className="text-muted-foreground text-sm mt-1">Reputation: {company.reputation}</p>
        </div>
        {canWrite && (
          <AddContractForm
            companyId={companyId}
            currentScale={company.scale}
            initialHotSpot={initialHotSpot}
            initialSide={initialSide}
          />
        )}
      </div>

      {company.contracts.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground">No contracts yet. Negotiate your first contract.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {company.contracts.map((contract) => {
            const scaleData = getScale(contract.scale);
            const monthlyBasePay = Math.floor(scaleData.maintenanceCost * (contract.basePayPct / 100));

            return (
              <Card key={contract.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{contract.contractName}</h3>
                        <Badge variant={STATUS_VARIANT[contract.status] ?? "outline"}>{contract.status}</Badge>
                        <Badge variant="outline">{contract.contractType.replace(/_/g, " ")}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {contract.hotSpot} · Scale {contract.scale} · {contract.durationMonths} months
                      </p>
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mt-3 text-xs">
                        <Stat label="Base Pay" value={`${contract.basePayPct}%`} sub={formatSP(monthlyBasePay) + "/mo"} />
                        <Stat label="Support" value={`${contract.supportType}/${contract.supportPct}%`} />
                        <Stat label="Salvage" value={`${contract.salvageRightsPct}%`} />
                        <Stat label="Command" value={contract.commandRights} />
                        <Stat label="Tracks" value={String(contract.tracks.length)} />
                      </div>
                    </div>
                    <Button variant="outline" asChild size="sm" className="shrink-0">
                      <Link href={`/${campaignId}/${companyId}/contracts/${contract.id}`}>View</Link>
                    </Button>
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

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
      {sub && <p className="text-muted-foreground">{sub}</p>}
    </div>
  );
}
