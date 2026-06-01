import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { campaigns } from "@/lib/schema";
import { eq } from "drizzle-orm";
import JoinForm from "@/components/auth/JoinForm";

interface Props {
  params: Promise<{ inviteKey: string }>;
}

export default async function JoinPage({ params }: Props) {
  const { inviteKey } = await params;
  const campaign = await db.query.campaigns.findFirst({
    where: eq(campaigns.inviteKey, inviteKey),
    columns: { id: true, name: true },
  });

  if (!campaign) notFound();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">Hot Spots</h1>
          <p className="text-muted-foreground mt-1">You have been invited to join a campaign</p>
        </div>
        <JoinForm inviteKey={inviteKey} campaignName={campaign.name} />
      </div>
    </div>
  );
}
