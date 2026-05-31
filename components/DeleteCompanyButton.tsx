"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteCompany } from "@/lib/actions/company";
import { Trash2 } from "lucide-react";

export default function DeleteCompanyButton({
  companyId,
  companyName,
  campaignId,
}: {
  companyId: string;
  companyName: string;
  campaignId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    if (!confirm(`Delete "${companyName}"? This cannot be undone.`)) return;
    startTransition(async () => {
      await deleteCompany(companyId);
      router.push(`/${campaignId}`);
    });
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
      onClick={handleDelete}
      disabled={isPending}
      title="Delete company"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
