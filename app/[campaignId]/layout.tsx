import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompanyForLayout } from "@/lib/actions/company";
import { getCampaign } from "@/lib/actions/campaign";

interface Props {
  children: React.ReactNode;
  params: Promise<{ campaignId: string }>;
}

export default async function CampaignLayout({ children, params }: Props) {
  const { campaignId } = await params;
  const campaign = await getCampaign(campaignId);
  if (!campaign) notFound();

  return (
    <>
      <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3 text-sm">
          <Link href="/" className="text-muted-foreground hover:text-foreground shrink-0">
            ← Campaigns
          </Link>
          <div className="h-4 w-px bg-border" />
          <Link href={`/${campaignId}`} className="font-semibold text-primary shrink-0">
            {campaign.name}
          </Link>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </>
  );
}
