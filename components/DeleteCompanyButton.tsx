"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  const [open, setOpen] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [deleteInput, setDeleteInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const confirmed = nameInput === companyName && deleteInput === "DELETE";

  function reset() {
    setNameInput("");
    setDeleteInput("");
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!confirmed) return;
    startTransition(async () => {
      await deleteCompany(companyId);
      setOpen(false);
      router.push(`/${campaignId}`);
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          title="Delete company"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-destructive">Delete Company</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This permanently deletes <span className="font-semibold text-foreground">{companyName}</span> and all of its
            units, pilots, contracts, and ledger. This cannot be undone.
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="confirmName">
              Type the company name <span className="font-semibold text-foreground">{companyName}</span> to confirm
            </Label>
            <Input
              id="confirmName"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder={companyName}
              autoComplete="off"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmDelete">
              Type <span className="font-mono font-semibold text-foreground">DELETE</span> to confirm
            </Label>
            <Input
              id="confirmDelete"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="DELETE"
              autoComplete="off"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" className="flex-1" disabled={!confirmed || isPending}>
              {isPending ? "Deleting…" : "Delete Company"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
