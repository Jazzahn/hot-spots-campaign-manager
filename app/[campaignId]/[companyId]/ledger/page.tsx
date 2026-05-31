import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatSP } from "@/lib/utils";
import { getCompanyForLedger } from "@/lib/actions/company";

interface Props {
  params: Promise<{ campaignId: string; companyId: string }>;
}

const CATEGORY_LABELS: Record<string, string> = {
  MAINTENANCE: "Maintenance",
  COMBAT_PAY: "Combat Pay",
  TRANSPORT: "Transport",
  REPAIR: "Repair",
  REARM: "Rearm",
  PURCHASE: "Purchase",
  SELL: "Sell",
  SALVAGE: "Salvage",
  UNIT_TRAINING: "Unit Training",
  PILOT_HIRE: "Pilot Hire",
  UNIT_PURCHASE: "Unit Purchase",
  COMMAND_TRAINING: "Command Training",
  BATTLEFIELD_LOSS_COMPENSATION: "Battle Loss Comp.",
  DEBT_INTEREST: "Debt Interest",
  OTHER: "Other",
};

export default async function LedgerPage({ params }: Props) {
  const { campaignId, companyId } = await params;
  const company = await getCompanyForLedger(companyId);
  if (!company || company.campaignId !== campaignId) notFound();

  const byMonth = company.transactions.reduce<Record<number, typeof company.transactions>>(
    (acc, tx) => { (acc[tx.month] ||= []).push(tx); return acc; },
    {}
  );

  const months = Object.keys(byMonth).map(Number).sort((a, b) => b - a);
  const inDebt = company.warchest < 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Financial Ledger</h1>
          <p className="text-muted-foreground text-sm mt-1">{company.transactions.length} transactions</p>
        </div>
        <div className={`text-right ${inDebt ? "text-red-400" : "text-green-400"}`}>
          <p className="text-xs text-muted-foreground">Current Warchest</p>
          <p className="text-2xl font-bold">{formatSP(company.warchest)}</p>
          {inDebt && <p className="text-xs">⚠ In Debt</p>}
        </div>
      </div>

      {months.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent><p className="text-muted-foreground">No transactions yet.</p></CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {months.map((month) => {
            const txs = byMonth[month];
            const income = txs.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
            const expenses = txs.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0);

            return (
              <Card key={month}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>Month {month}</span>
                    <div className="flex items-center gap-4 text-sm font-normal">
                      <span className="text-green-400">+{formatSP(income)}</span>
                      <span className="text-red-400">{formatSP(expenses)}</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {txs.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between text-sm py-1.5 border-b border-border/50 last:border-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs shrink-0">
                            {CATEGORY_LABELS[tx.category] ?? tx.category}
                          </Badge>
                          <span className="text-muted-foreground">{tx.description}</span>
                        </div>
                        <div className="flex items-center gap-6 shrink-0 ml-4">
                          <span className={`font-medium w-28 text-right ${tx.amount >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {tx.amount >= 0 ? "+" : ""}{formatSP(tx.amount)}
                          </span>
                          <span className="text-muted-foreground w-28 text-right">{formatSP(tx.runningBalance)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
