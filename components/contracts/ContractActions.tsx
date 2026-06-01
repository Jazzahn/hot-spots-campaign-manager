"use client";

import { useTransition } from "react";
import type { Contract } from "@/types";
import { Button } from "@/components/ui/button";
import { completeContract, breakContract, cancelContractAsManager } from "@/lib/actions/contracts";

interface Props {
  contract: Contract;
  companyId: string;
  isManager?: boolean;
}

export default function ContractActions({ contract, companyId: _companyId, isManager }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleComplete() {
    if (!confirm("Mark contract as completed successfully?")) return;
    startTransition(async () => { await completeContract(contract.id, true); });
  }

  function handleBreak() {
    const escape = confirm("Invoke escape clause? (Only valid if < 2/3 of Scale limit remaining)");
    startTransition(async () => { await breakContract(contract.id, escape); });
  }

  function handleManagerCancel() {
    const msg = contract.status === "PENDING"
      ? "Delete this pending contract? This removes it entirely."
      : "Force cancel this contract? It will be marked Broken with no reputation penalty.";
    if (!confirm(msg)) return;
    startTransition(async () => { await cancelContractAsManager(contract.id); });
  }

  if (contract.status === "PENDING") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground italic">Ready up via the campaign overview to activate</span>
        {isManager && (
          <Button variant="ghost" size="sm" className="text-xs text-destructive hover:bg-destructive/10" disabled={isPending} onClick={handleManagerCancel}>
            Delete
          </Button>
        )}
      </div>
    );
  }

  if (contract.status === "ACTIVE") {
    return (
      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" onClick={handleComplete} disabled={isPending} size="sm">
          Complete Contract
        </Button>
        <Button variant="destructive" onClick={handleBreak} disabled={isPending} size="sm">
          Break Contract
        </Button>
        {isManager && (
          <Button variant="outline" onClick={handleManagerCancel} disabled={isPending} size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10">
            CM Cancel
          </Button>
        )}
      </div>
    );
  }

  return null;
}
