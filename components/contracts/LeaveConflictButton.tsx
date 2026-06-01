"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { leaveConflict } from "@/lib/actions/contracts";

export default function LeaveConflictButton({ contractId }: { contractId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleLeave() {
    if (!confirm("Leave this conflict? Your contract will be removed and you can rejoin on either side.")) return;
    startTransition(async () => {
      await leaveConflict(contractId);
    });
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="flex-1 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
      onClick={handleLeave}
      disabled={isPending}
    >
      {isPending ? "Leaving…" : "Leave Conflict"}
    </Button>
  );
}
