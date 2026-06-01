"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { readyUpContract } from "@/lib/actions/contracts";

interface Props {
  contractId: string;
  campaignCurrentMonth: number;
  isReady: boolean;
}

export default function ReadyUpButton({ contractId, campaignCurrentMonth, isReady }: Props) {
  const [isPending, startTransition] = useTransition();

  if (isReady) {
    return (
      <span className="text-xs text-green-500/80 font-medium flex items-center gap-1">
        ✓ Ready
      </span>
    );
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="flex-1 text-xs border-green-500/40 text-green-400 hover:bg-green-500/10"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await readyUpContract(contractId, campaignCurrentMonth);
        })
      }
    >
      {isPending ? "Readying…" : "Ready Up"}
    </Button>
  );
}
