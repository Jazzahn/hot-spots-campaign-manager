import Link from "next/link";
import { getAllCampaigns } from "@/lib/actions/campaign";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatSP } from "@/lib/utils";
import NewCampaignForm from "@/components/NewCampaignForm";
import DeleteCampaignButton from "@/components/DeleteCampaignButton";

export default async function HomePage() {
  const campaigns = await getAllCampaigns();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">⚡ Draconis Reach</h1>
          <p className="text-muted-foreground mt-1">Hot Spots: Draconis Reach · Chaos Campaign: Mercenaries</p>
        </div>
        <NewCampaignForm />
      </div>

      {campaigns.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <p className="text-muted-foreground text-lg mb-4">No campaigns yet.</p>
            <p className="text-sm text-muted-foreground">Create a new mercenary command to get started.</p>
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
                    <Badge variant="outline">Scale {campaign.scale}</Badge>
                    <DeleteCampaignButton campaignId={campaign.id} campaignName={campaign.name} />
                  </div>
                </div>
              </CardHeader>
              <Link href={`/${campaign.id}`}>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <Stat label="Warchest" value={formatSP(campaign.warchest)} />
                    <Stat label="Reputation" value={String(campaign.reputation)} />
                    <Stat label="Month" value={String(campaign.currentMonth)} />
                    <Stat label="Command" value={campaign.commandType === "MERCENARY" ? "Mercenary" : "Regular"} />
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground pt-1 border-t border-border">
                    <span>{campaign._count.units} units</span>
                    <span>{campaign._count.pilots} pilots</span>
                    <span>{campaign._count.contracts} contracts</span>
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
      <p className="font-medium">{value}</p>
    </div>
  );
}
