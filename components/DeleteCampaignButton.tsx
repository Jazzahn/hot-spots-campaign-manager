"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { deleteCampaign } from "@/lib/actions/campaign";
import { Trash2 } from "lucide-react";

export default function DeleteCampaignButton({ campaignId, campaignName }: { campaignId: string; campaignName: string }) {
  const [open, setOpen] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [deleteInput, setDeleteInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const confirmed = nameInput === campaignName && deleteInput === "DELETE";

  function reset() {
    setNameInput("");
    setDeleteInput("");
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!confirmed) return;
    startTransition(async () => {
      await deleteCampaign(campaignId);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          title="Delete campaign"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-destructive">Delete Campaign</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This permanently deletes <span className="font-semibold text-foreground">{campaignName}</span> and{" "}
            <span className="font-semibold text-foreground">all companies within it</span> — units, pilots, contracts,
            and ledgers. This cannot be undone.
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="confirmName">
              Type the campaign name <span className="font-semibold text-foreground">{campaignName}</span> to confirm
            </Label>
            <Input
              id="confirmName"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder={campaignName}
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
              {isPending ? "Deleting…" : "Delete Campaign"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
