"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { advanceConflictMonth } from "@/lib/actions/contracts";

interface Props {
  hotSpot: string;
  campaignId: string;
  campaignCurrentMonth: number;
  currentConflictMonth: number;
  maxDurationMonths: number;
}

export default function AdvanceMonthButton({
  hotSpot,
  campaignId,
  campaignCurrentMonth,
  currentConflictMonth,
  maxDurationMonths,
}: Props) {
  const [isPending, startTransition] = useTransition();

  if (currentConflictMonth >= maxDurationMonths) return null;

  function handleAdvance() {
    if (
      !confirm(
        `Advance to Month ${currentConflictMonth + 1}?\n\nThis will collect base pay and charge maintenance for all companies in this conflict.`
      )
    ) return;
    startTransition(async () => {
      await advanceConflictMonth(hotSpot, campaignId, campaignCurrentMonth);
    });
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="w-full text-xs mt-1"
      disabled={isPending}
      onClick={handleAdvance}
    >
      {isPending ? "Advancing…" : `Advance to Month ${currentConflictMonth + 1} — collect pay`}
    </Button>
  );
}
