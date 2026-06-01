import { notFound } from "next/navigation";
import { getAllCampaignInviteKeys } from "@/lib/actions/auth";
import CreateManagerForm from "@/components/auth/CreateManagerForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
  searchParams: Promise<{ secret?: string }>;
}

export default async function AdminPage({ searchParams }: Props) {
  const { secret } = await searchParams;

  if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
    notFound();
  }

  const campaignKeys = await getAllCampaignInviteKeys();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-primary">Admin</h1>
        <p className="text-muted-foreground mt-1">Campaign Manager accounts</p>
      </div>

      <CreateManagerForm adminSecret={secret} />

      {campaignKeys.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Campaign Invite Keys</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {campaignKeys.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-4">
                <span className="font-medium">{c.name}</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {c.inviteKey ?? "—"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
