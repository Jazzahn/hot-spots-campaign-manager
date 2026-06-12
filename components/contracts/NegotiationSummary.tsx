import { Badge } from "@/components/ui/badge";
import {
  TERM_KEYS,
  TERM_LABELS,
  describeStep,
  valuesToSteps,
  type TermKey,
} from "@/lib/calculations/contract-negotiation";
import type { CommandRightsValue, SupportValue } from "@/lib/constants/contract-steps";

interface TermSet {
  basePayPct: number;
  commandRights: string;
  salvageRightsPct: number;
  supportType: string;
  supportPct: number;
  transportPct: number;
}

interface Props {
  presented: TermSet;
  negotiated: TermSet;
}

function toSteps(t: TermSet): Record<TermKey, number> {
  return valuesToSteps({
    basePayPct: t.basePayPct,
    commandRights: t.commandRights as CommandRightsValue,
    salvageRightsPct: t.salvageRightsPct,
    supportType: t.supportType as SupportValue["type"],
    supportPct: t.supportPct,
    transportPct: t.transportPct,
  });
}

export default function NegotiationSummary({ presented, negotiated }: Props) {
  const presentedSteps = toSteps(presented);
  const negotiatedSteps = toSteps(negotiated);

  return (
    <div className="space-y-1.5">
      {TERM_KEYS.map((term) => {
        const delta = negotiatedSteps[term] - presentedSteps[term];
        const changed = delta !== 0;
        return (
          <div key={term} className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">{TERM_LABELS[term]}</span>
            <div className="flex items-center gap-2">
              <span className={changed ? "text-muted-foreground line-through" : "font-medium"}>
                {describeStep(term, presentedSteps[term])}
              </span>
              {changed && (
                <>
                  <span className="text-muted-foreground">→</span>
                  <span className="font-medium">{describeStep(term, negotiatedSteps[term])}</span>
                  <Badge variant={delta > 0 ? "success" : "warning"} className="text-xs">
                    {delta > 0 ? `+${delta}` : delta}
                  </Badge>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
