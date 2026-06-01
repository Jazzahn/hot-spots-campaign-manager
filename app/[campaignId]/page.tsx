import Link from "next/link";
import { notFound } from "next/navigation";
import { getCampaign } from "@/lib/actions/campaign";
import { getSessionFromCookies } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatSP } from "@/lib/utils";
import NewCompanyForm from "@/components/NewCompanyForm";
import DeleteCompanyButton from "@/components/DeleteCompanyButton";
import CopyInviteKey from "@/components/auth/CopyInviteKey";

interface Props {
  params: Promise<{ campaignId: string }>;
}

export default async function CampaignOverviewPage({ params }: Props) {
  const { campaignId } = await params;
  const [campaign, session] = await Promise.all([getCampaign(campaignId), getSessionFromCookies()]);
  if (!campaign) notFound();

  const isManager = session.userId && session.userId === campaign.managedById;

  return (
    <div className="space-y-8">
      {isManager && campaign.inviteKey && (
        <CopyInviteKey inviteKey={campaign.inviteKey} />
      )}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{campaign.name}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            <span>{campaign.gameRules === "ALPHA_STRIKE" ? "Alpha Strike" : "BattleTech"}</span>
            <span>·</span>
            <span>Month {campaign.currentMonth}</span>
            {campaign.background && (
              <>
                <span>·</span>
                <span>{campaign.background}</span>
              </>
            )}
          </div>
        </div>
        <NewCompanyForm campaignId={campaignId} />
      </div>

      {campaign.companies.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <p className="text-muted-foreground text-lg mb-2">No companies yet.</p>
            <p className="text-sm text-muted-foreground">Add the first mercenary command to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaign.companies.map((company) => (
            <Card key={company.id} className="hover:border-primary/50 transition-colors h-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/${campaignId}/${company.id}`} className="flex-1 min-w-0">
                    <CardTitle className="text-lg hover:text-primary transition-colors">{company.name}</CardTitle>
                  </Link>
                  <div className="flex items-center gap-1 shrink-0">
                    <Badge variant="outline">Scale {company.scale}</Badge>
                    <DeleteCompanyButton
                      companyId={company.id}
                      companyName={company.name}
                      campaignId={campaignId}
                    />
                  </div>
                </div>
              </CardHeader>
              <Link href={`/${campaignId}/${company.id}`}>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <Stat label="Warchest" value={formatSP(company.warchest)} />
                    <Stat label="Reputation" value={String(company.reputation)} />
                    <Stat label="Command" value={company.commandType === "MERCENARY" ? "Mercenary" : "Regular"} />
                    {company.background && <Stat label="Background" value={company.background} />}
                  </div>
                  <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground pt-1 border-t border-border">
                    <div className="flex gap-3">
                      <span>{company._count.units} units</span>
                      <span>{company._count.pilots} pilots</span>
                      <span>{company._count.contracts} contracts</span>
                    </div>
                    {company.user && (
                      <span className="text-primary/70">{company.user.callsign}</span>
                    )}
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-medium text-sm">{value}</p>
    </div>
  );
}
