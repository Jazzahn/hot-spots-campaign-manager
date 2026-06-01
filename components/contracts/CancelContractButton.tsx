"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { cancelContractAsManager } from "@/lib/actions/contracts";

interface Props {
  contractId: string;
  companyName: string;
  status: string;
}

export default function CancelContractButton({ contractId, companyName, status }: Props) {
  const [isPending, startTransition] = useTransition();

  const label = status === "PENDING" ? "Remove" : "Force cancel";
  const confirmMsg =
    status === "PENDING"
      ? `Remove ${companyName} from this conflict?`
      : `Force cancel ${companyName}'s contract?\n\nThe contract will be marked as Broken. No reputation penalty is applied for a Campaign Manager cancellation.`;

  function handle() {
    if (!confirm(confirmMsg)) return;
    startTransition(async () => { await cancelContractAsManager(contractId); });
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-6 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
      onClick={handle}
      disabled={isPending}
    >
      {isPending ? "…" : label}
    </Button>
  );
}
