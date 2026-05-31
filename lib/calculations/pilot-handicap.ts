import {
  GUNNERY_THRESHOLDS,
  PILOTING_THRESHOLDS,
  EDGE_TOKEN_THRESHOLDS,
  EDGE_ABILITY_THRESHOLDS,
  AS_SKILL_THRESHOLDS,
} from "@/lib/constants/pilot-improvement";

function resolveThreshold(sp: number, thresholds: typeof GUNNERY_THRESHOLDS) {
  let current = thresholds[0];
  for (const t of thresholds) {
    if (sp >= t.sp) current = t;
    else break;
  }
  return current;
}

export interface PilotStats {
  gunnery: number;
  piloting: number;
  edgeTokens: number;
  edgeAbilitiesCount: number;
  handicap: number;
}

export function computePilotStats(
  spGunnery: number,
  spPiloting: number,
  spEdgeTokens: number,
  spEdgeAbilities: number,
  isAlphaStrike = false
): PilotStats {
  const gun = resolveThreshold(spGunnery, GUNNERY_THRESHOLDS);
  const pil = isAlphaStrike
    ? resolveThreshold(spPiloting, AS_SKILL_THRESHOLDS)
    : resolveThreshold(spPiloting, PILOTING_THRESHOLDS);
  const edge = resolveThreshold(spEdgeTokens, EDGE_TOKEN_THRESHOLDS);
  const abilities = resolveThreshold(spEdgeAbilities, EDGE_ABILITY_THRESHOLDS);

  const handicap = gun.handicap + pil.handicap + edge.handicap + abilities.handicap;

  return {
    gunnery: gun.level,
    piloting: isAlphaStrike ? pil.level : pil.level,
    edgeTokens: edge.level,
    edgeAbilitiesCount: abilities.level,
    handicap,
  };
}
