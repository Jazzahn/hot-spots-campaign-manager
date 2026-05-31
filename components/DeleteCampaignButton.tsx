"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteCampaign } from "@/lib/actions/campaign";
import { Trash2 } from "lucide-react";

export default function DeleteCampaignButton({ campaignId, campaignName }: { campaignId: string; campaignName: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault(); // stop the parent <Link> from navigating
    if (!confirm(`Delete "${campaignName}"? This cannot be undone.`)) return;
    startTransition(async () => {
      await deleteCampaign(campaignId);
      router.refresh();
    });
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
      onClick={handleDelete}
      disabled={isPending}
      title="Delete campaign"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
