import Link from "next/link";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

interface Props {
  children: React.ReactNode;
  params: Promise<{ campaignId: string }>;
}

export default async function CampaignLayout({ children, params }: Props) {
  const { campaignId } = await params;

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: { id: true, name: true, warchest: true, reputation: true, scale: true, currentMonth: true },
  });

  if (!campaign) notFound();

  const navLinks = [
    { href: `/${campaignId}`, label: "Dashboard" },
    { href: `/${campaignId}/force`, label: "Force" },
    { href: `/${campaignId}/pilots`, label: "Pilots" },
    { href: `/${campaignId}/contracts`, label: "Contracts" },
    { href: `/${campaignId}/ledger`, label: "Ledger" },
  ];

  const inDebt = campaign.warchest < 0;

  return (
    <>
      <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-4">
          <Link href="/" className="text-muted-foreground hover:text-foreground text-sm shrink-0">
            ← Campaigns
          </Link>
          <div className="h-4 w-px bg-border" />
          <Link href={`/${campaignId}`} className="font-bold text-primary text-base tracking-wide shrink-0">
            {campaign.name}
          </Link>
          <nav className="flex gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-4 text-xs text-muted-foreground shrink-0">
            <span>Month {campaign.currentMonth}</span>
            <span>Rep {campaign.reputation}</span>
            <span>Scale {campaign.scale}</span>
            <span className={inDebt ? "text-red-400 font-semibold" : "text-green-400 font-semibold"}>
              {campaign.warchest.toLocaleString()} SP
            </span>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </>
  );
}
