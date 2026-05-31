import type { Pilot, Unit } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GUNNERY_THRESHOLDS,
  PILOTING_THRESHOLDS,
  EDGE_TOKEN_THRESHOLDS,
  EDGE_ABILITY_THRESHOLDS,
  AS_SKILL_THRESHOLDS,
} from "@/lib/constants/pilot-improvement";

interface Props {
  pilot: Pilot & { unit: Unit | null };
  isAlphaStrike?: boolean;
}

function nextThreshold(sp: number, thresholds: typeof GUNNERY_THRESHOLDS) {
  const next = thresholds.find((t) => t.sp > sp);
  return next ? next.sp - sp : null;
}

export default function PilotCard({ pilot, isAlphaStrike = false }: Props) {
  const pilotingTable = isAlphaStrike ? AS_SKILL_THRESHOLDS : PILOTING_THRESHOLDS;

  const nextGun = nextThreshold(pilot.spGunnery, GUNNERY_THRESHOLDS);
  const nextPil = nextThreshold(pilot.spPiloting, pilotingTable);
  const nextEdge = nextThreshold(pilot.spEdgeTokens, EDGE_TOKEN_THRESHOLDS);
  const nextAbility = nextThreshold(pilot.spEdgeAbilities, EDGE_ABILITY_THRESHOLDS);

  return (
    <Card className={pilot.wounds > 0 ? "border-red-700/50" : ""}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between gap-2">
          <div>
            <span>{pilot.name}</span>
            {pilot.callsign && (
              <span className="text-muted-foreground font-normal text-sm ml-2">&quot;{pilot.callsign}&quot;</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {pilot.wounds > 0 && <Badge variant="danger">{pilot.wounds}W</Badge>}
            {pilot.mvpCount > 0 && <Badge variant="secondary">MVP ×{pilot.mvpCount}</Badge>}
            <Badge variant="outline">+{pilot.handicap} BSP</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Skills */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <SkillBox
            label={isAlphaStrike ? "Skill" : "Gunnery"}
            value={pilot.gunnery}
            sp={pilot.spGunnery}
            nextSP={nextGun}
          />
          {!isAlphaStrike && (
            <SkillBox
              label="Piloting"
              value={pilot.piloting}
              sp={pilot.spPiloting}
              nextSP={nextPil}
            />
          )}
          <SkillBox
            label="Edge"
            value={pilot.edgeTokens}
            sp={pilot.spEdgeTokens}
            nextSP={nextEdge}
          />
          <SkillBox
            label="Abilities"
            value={pilot.edgeAbilities.length}
            sp={pilot.spEdgeAbilities}
            nextSP={nextAbility}
          />
        </div>

        {/* SP totals */}
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground border-t border-border pt-3">
          <div>Total SP earned: <span className="text-foreground font-medium">{pilot.totalSPEarned}</span></div>
          <div>Assigned unit: <span className="text-foreground font-medium">{pilot.unit?.name ?? "—"}</span></div>
        </div>

        {/* Edge abilities */}
        {pilot.edgeAbilities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {pilot.edgeAbilities.map((ab) => (
              <Badge key={ab} variant="secondary" className="text-xs">{ab}</Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SkillBox({ label, value, sp, nextSP }: { label: string; value: number; sp: number; nextSP: number | null }) {
  return (
    <div className="bg-muted rounded p-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{sp} SP</p>
      {nextSP !== null && (
        <p className="text-xs text-primary">+{nextSP} next</p>
      )}
    </div>
  );
}
