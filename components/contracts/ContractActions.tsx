"use client";

import { useTransition } from "react";
import type { Contract } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { activateContract, completeContract, breakContract } from "@/lib/actions/contracts";
import { collectMonthlyBasePay } from "@/lib/actions/contracts";

interface Props {
  contract: Contract;
  companyId: string;
}

export default function ContractActions({ contract, companyId: _companyId }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleActivate() {
    const month = Number(prompt("Start month number?", "1"));
    if (!month) return;
    startTransition(async () => { await activateContract(contract.id, month); });
  }

  function handleCollectPay() {
    const month = Number(prompt("Month number to collect pay for?", "1"));
    if (!month) return;
    startTransition(async () => {
      const result = await collectMonthlyBasePay(contract.id, month);
      alert(`Base Pay: +${result.basePay} SP\nMaintenance: -${result.maintenanceCost} SP\nShortfall: ${result.shortfall} SP`);
    });
  }

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
      <Button onClick={handleActivate} disabled={isPending}>
        Activate Contract
      </Button>
    );
  }

  if (contract.status === "ACTIVE") {
    return (
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleCollectPay} disabled={isPending} size="sm">
          Collect Monthly Pay
        </Button>
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
