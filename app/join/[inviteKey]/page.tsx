import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { campaigns } from "@/lib/schema";
import { eq } from "drizzle-orm";
import JoinForm from "@/components/auth/JoinForm";
import AuthShell from "@/components/auth/AuthShell";

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
    <AuthShell subtitle="You have been invited to join a campaign">
      <JoinForm inviteKey={inviteKey} campaignName={campaign.name} />
    </AuthShell>
  );
}
