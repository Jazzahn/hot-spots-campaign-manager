import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AddPilotForm from "@/components/pilots/AddPilotForm";
import PilotCard from "@/components/pilots/PilotCard";
import { MAX_NAMED_PILOTS } from "@/lib/constants/scales";

interface Props {
  params: Promise<{ campaignId: string; companyId: string }>;
}

export default async function PilotsPage({ params }: Props) {
  const { campaignId, companyId } = await params;

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      campaign: { select: { gameRules: true } },
      pilots: { include: { unit: true }, orderBy: { createdAt: "asc" } },
      units: true,
    },
  });

  if (!company || company.campaignId !== campaignId) notFound();

  const namedPilots = company.pilots.filter((p) => p.isNamed && !p.isKilled);
  const regularCrew = company.pilots.filter((p) => !p.isNamed && !p.isKilled);
  const killed = company.pilots.filter((p) => p.isKilled);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pilots</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {namedPilots.length}/{MAX_NAMED_PILOTS} named pilots
          </p>
        </div>
        <AddPilotForm
          companyId={companyId}
          units={company.units.filter((u) => u.status !== "TRULY_DESTROYED")}
          namedPilotCount={namedPilots.length}
        />
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Named Pilots</h2>
        {namedPilots.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              <p className="text-muted-foreground">No named pilots. Add up to 4.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {namedPilots.map((pilot) => (
              <PilotCard key={pilot.id} pilot={pilot} isAlphaStrike={company.campaign.gameRules === "ALPHA_STRIKE"} />
            ))}
          </div>
        )}
      </section>

      {regularCrew.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Non-Named Crew</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {regularCrew.map((pilot) => (
              <Card key={pilot.id}>
                <CardContent className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{pilot.name}</p>
                    <p className="text-xs text-muted-foreground">G4/P5 (Regular)</p>
                  </div>
                  {pilot.wounds > 0 && <Badge variant="danger">{pilot.wounds} wounds</Badge>}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {killed.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Killed in Action</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {killed.map((pilot) => (
              <Card key={pilot.id} className="opacity-50">
                <CardContent className="py-3">
                  <p className="font-medium text-sm line-through">{pilot.name}</p>
                  {pilot.callsign && <p className="text-xs text-muted-foreground">&quot;{pilot.callsign}&quot;</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
