"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { advanceCompanyMonth } from "@/lib/actions/contracts";

interface Props {
  contractId: string;
  campaignCurrentMonth: number;
  conflictMonth: number;
  durationMonths: number;
  companyMonthReady: boolean;
}

export default function AdvanceCompanyMonthButton({
  contractId,
  campaignCurrentMonth,
  conflictMonth,
  durationMonths,
  companyMonthReady,
}: Props) {
  const [isPending, startTransition] = useTransition();

  if (conflictMonth >= durationMonths) return null;

  if (companyMonthReady) {
    return (
      <span className="text-xs text-yellow-500/80 font-medium flex items-center gap-1">
        ⏳ Month advanced — awaiting others
      </span>
    );
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="text-xs border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await advanceCompanyMonth(contractId, campaignCurrentMonth);
        })
      }
    >
      {isPending ? "Advancing…" : "Advance My Month"}
    </Button>
  );
}
