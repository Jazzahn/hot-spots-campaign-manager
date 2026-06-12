"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TERM_KEYS,
  TERM_LABELS,
  describeStep,
  stepsToValues,
  isLandable,
  landableBounds,
  canStepUp,
  canStepDown,
  validateNegotiation,
  negotiationBudget,
  type TermKey,
} from "@/lib/calculations/contract-negotiation";

interface Props {
  /** presented (default) steps as offered by the employer */
  defaults: Record<TermKey, number>;
  scale: number;
  reputation: number;
  commandNonNegotiable: boolean;
  /** notifies the parent whether the current negotiation is legal (for the Accept button) */
  onValidityChange?: (legal: boolean) => void;
}

const lockedTerms = (commandNonNegotiable: boolean): Set<TermKey> =>
  commandNonNegotiable ? new Set<TermKey>(["command"]) : new Set<TermKey>();

export default function NegotiationPanel({
  defaults,
  scale,
  reputation,
  commandNonNegotiable,
  onValidityChange,
}: Props) {
  const defaultsKey = useMemo(() => JSON.stringify(defaults), [defaults]);
  const [steps, setSteps] = useState<Record<TermKey, number>>(defaults);

  // Reset to the freshly presented terms whenever the template (defaults) changes.
  useEffect(() => {
    setSteps(defaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultsKey]);

  const state = useMemo(
    () => validateNegotiation({ defaults, current: steps, scale, reputation }),
    [defaults, steps, scale, reputation]
  );
  const budget = useMemo(() => negotiationBudget(scale, reputation), [scale, reputation]);

  useEffect(() => {
    onValidityChange?.(state.legal);
  }, [state.legal, onValidityChange]);

  const locked = lockedTerms(commandNonNegotiable);
  const values = stepsToValues(steps);
  const presentedValues = stepsToValues(defaults);

  function move(term: TermKey, dir: 1 | -1) {
    const next = steps[term] + dir;
    const { min, max } = landableBounds(term);
    if (next < min || next > max) return;
    setSteps((prev) => ({ ...prev, [term]: next }));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground">Contract Terms</h3>
        <div className="flex items-center gap-2 text-xs">
          <Badge variant={state.repUsed > state.repAvailable ? "danger" : "outline"}>
            Reputation {state.repUsed}/{state.repAvailable}
          </Badge>
          <Badge variant={state.swapsUsed > state.swapsAvailable ? "danger" : "outline"}>
            Swaps {state.swapsUsed}/{state.swapsAvailable}
          </Badge>
        </div>
      </div>

      <div className="space-y-1.5">
        {TERM_KEYS.map((term) => {
          const isLocked = locked.has(term);
          const delta = state.perTermDeltas[term];
          const onEmDash = !isLandable(term, steps[term]);
          const canUp = !isLocked && canStepUp({ term, defaults, current: steps, scale, reputation });
          const canDown = !isLocked && canStepDown(term, steps);
          return (
            <div
              key={term}
              className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">{TERM_LABELS[term]}</p>
                <p className="text-xs text-muted-foreground">
                  Presented: {describeStep(term, defaults[term])}
                  {isLocked && " · non-negotiable"}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {delta !== 0 && (
                  <Badge variant={delta > 0 ? "success" : "warning"} className="text-xs">
                    {delta > 0 ? `+${delta}` : delta}
                  </Badge>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0"
                  disabled={!canDown}
                  onClick={() => move(term, -1)}
                  aria-label={`Lower ${TERM_LABELS[term]}`}
                >
                  −
                </Button>
                <span
                  className={`w-24 text-center text-sm font-medium tabular-nums ${onEmDash ? "text-red-400" : ""}`}
                  title={onEmDash ? "Between steps — not a selectable value" : undefined}
                >
                  {describeStep(term, steps[term])}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0"
                  disabled={!canUp}
                  onClick={() => move(term, 1)}
                  aria-label={`Raise ${TERM_LABELS[term]}`}
                >
                  +
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {state.errors.length > 0 && (
        <ul className="text-xs text-red-400 space-y-0.5">
          {state.errors.map((e, i) => (
            <li key={i}>⚠ {e}</li>
          ))}
        </ul>
      )}

      {/* Final negotiated terms — read by the form on submit */}
      <input type="hidden" name="basePayPct" value={values.basePayPct} />
      <input type="hidden" name="supportType" value={values.supportType} />
      <input type="hidden" name="supportPct" value={values.supportPct} />
      <input type="hidden" name="salvageRightsPct" value={values.salvageRightsPct} />
      <input type="hidden" name="commandRights" value={values.commandRights} />
      <input type="hidden" name="transportPct" value={values.transportPct} />
      {/* Presented (default) terms — recorded for the audit trail */}
      <input type="hidden" name="defaultBasePayPct" value={presentedValues.basePayPct} />
      <input type="hidden" name="defaultSupportType" value={presentedValues.supportType} />
      <input type="hidden" name="defaultSupportPct" value={presentedValues.supportPct} />
      <input type="hidden" name="defaultSalvageRightsPct" value={presentedValues.salvageRightsPct} />
      <input type="hidden" name="defaultCommandRights" value={presentedValues.commandRights} />
      <input type="hidden" name="defaultTransportPct" value={presentedValues.transportPct} />
    </div>
  );
}
