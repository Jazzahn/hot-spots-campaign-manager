"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { advanceCampaignMonthManual } from "@/lib/actions/campaign";

export default function AdvanceCampaignMonthButton({ campaignId }: { campaignId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant="outline"
      className="text-xs"
      disabled={isPending}
      onClick={() => {
        if (!confirm("Advance to the next campaign month?\n\nOnly use this when there are no active conflicts.")) return;
        startTransition(async () => {
          await advanceCampaignMonthManual(campaignId);
        });
      }}
    >
      {isPending ? "Advancing…" : "Advance Month"}
    </Button>
  );
}
