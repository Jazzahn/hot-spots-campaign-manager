export const dynamic = "force-dynamic";

import Link from "next/link";
import { getAllCampaigns } from "@/lib/actions/campaign";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NewCampaignForm from "@/components/NewCampaignForm";
import DeleteCampaignButton from "@/components/DeleteCampaignButton";

export default async function HomePage() {
  const campaigns = await getAllCampaigns();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Hot Spots</h1>
          <p className="text-muted-foreground mt-1">Chaos Campaign: Mercenaries</p>
        </div>
        <NewCampaignForm />
      </div>

      {campaigns.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <p className="text-muted-foreground text-lg mb-4">No campaigns yet.</p>
            <p className="text-sm text-muted-foreground">Create a campaign to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="hover:border-primary/50 transition-colors h-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/${campaign.id}`} className="flex-1 min-w-0">
                    <CardTitle className="text-lg hover:text-primary transition-colors">{campaign.name}</CardTitle>
                  </Link>
                  <div className="flex items-center gap-1 shrink-0">
                    <Badge variant="outline">{campaign.gameRules === "ALPHA_STRIKE" ? "Alpha Strike" : "BattleTech"}</Badge>
                    <DeleteCampaignButton campaignId={campaign.id} campaignName={campaign.name} />
                  </div>
                </div>
              </CardHeader>
              <Link href={`/${campaign.id}`}>
                <CardContent className="space-y-3">
                  {campaign.background && (
                    <p className="text-sm text-muted-foreground">{campaign.background}</p>
                  )}
                  <div className="flex gap-3 text-sm text-muted-foreground border-t border-border pt-3">
                    <span>Month {campaign.currentMonth}</span>
                    <span>·</span>
                    <span>{campaign._count.companies} {campaign._count.companies === 1 ? "company" : "companies"}</span>
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
