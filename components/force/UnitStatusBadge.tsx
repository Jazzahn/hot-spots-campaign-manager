import { Badge } from "@/components/ui/badge";
import type { UnitStatus } from "@/types";

const STATUS_CONFIG: Record<UnitStatus, { label: string; variant: "success" | "warning" | "danger" | "outline" | "secondary" }> = {
  OPERATIONAL:     { label: "Operational", variant: "success" },
  ARMOR_DAMAGE:    { label: "Armor Dmg", variant: "warning" },
  STRUCTURE_CRIT:  { label: "Struct/Crit", variant: "danger" },
  CRIPPLED:        { label: "Crippled", variant: "danger" },
  DESTROYED:       { label: "Destroyed", variant: "danger" },
  TRULY_DESTROYED: { label: "Truly Destroyed", variant: "outline" },
};

export function UnitStatusBadge({ status }: { status: UnitStatus }) {
  const config = STATUS_CONFIG[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
