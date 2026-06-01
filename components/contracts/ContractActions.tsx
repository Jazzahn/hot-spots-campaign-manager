"use client";

import { useTransition } from "react";
import type { Contract } from "@/types";
import { Button } from "@/components/ui/button";
import { completeContract, breakContract } from "@/lib/actions/contracts";

interface Props {
  contract: Contract;
  companyId: string;
}

export default function ContractActions({ contract, companyId: _companyId }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleComplete() {
    if (!confirm("Mark contract as completed successfully?")) return;
    startTransition(async () => { await completeContract(contract.id, true); });
  }

  function handleBreak() {
    const escape = confirm("Invoke escape clause? (Only valid if < 2/3 of Scale limit remaining)");
    startTransition(async () => { await breakContract(contract.id, escape); });
  }

  if (contract.status === "PENDING") {
    return (
      <div className="text-xs text-muted-foreground italic">
        Ready up via the campaign overview to activate
      </div>
    );
  }

  if (contract.status === "ACTIVE") {
    return (
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleComplete} disabled={isPending} size="sm">
          Complete Contract
        </Button>
        <Button variant="destructive" onClick={handleBreak} disabled={isPending} size="sm">
          Break Contract
        </Button>
      </div>
    );
  }

  return null;
}
