import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompanyForLayout } from "@/lib/actions/company";

interface Props {
  children: React.ReactNode;
  params: Promise<{ campaignId: string; companyId: string }>;
}

export default async function CompanyLayout({ children, params }: Props) {
  const { campaignId, companyId } = await params;

  const company = await getCompanyForLayout(companyId);
  if (!company || company.campaignId !== campaignId) notFound();

  const inDebt = company.warchest < 0;

  const navLinks = [
    { href: `/${campaignId}/${companyId}`, label: "Dashboard" },
    { href: `/${campaignId}/${companyId}/force`, label: "Force" },
    { href: `/${campaignId}/${companyId}/pilots`, label: "Pilots" },
    { href: `/${campaignId}/${companyId}/contracts`, label: "Contracts" },
    { href: `/${campaignId}/${companyId}/ledger`, label: "Ledger" },
  ];

  return (
    <>
      <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3">
          <Link href={`/${campaignId}`} className="text-muted-foreground hover:text-foreground text-sm shrink-0">
            ← Companies
          </Link>
          <div className="h-4 w-px bg-border" />
          <Link href={`/${campaignId}/${companyId}`} className="font-bold text-primary text-base tracking-wide shrink-0">
            {company.name}
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
            <span>Rep {company.reputation}</span>
            <span>Scale {company.scale}</span>
            <span className={inDebt ? "text-red-400 font-semibold" : "text-green-400 font-semibold"}>
              {company.warchest.toLocaleString()} SP
            </span>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </>
  );
}
