"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { updateCompanyLocation } from "@/lib/actions/company";
import { SYSTEM_GROUPS } from "@/lib/constants/systems";

interface Props {
  companyId: string;
  currentLocation: string | null;
}

// Radix Select items cannot use an empty-string value, so use a sentinel for "not set".
const NONE = "__none__";

export default function EditCompanyLocationForm({ companyId, currentLocation }: Props) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(currentLocation ?? NONE);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      await updateCompanyLocation(companyId, value === NONE ? "" : value);
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) setValue(currentLocation ?? NONE); }}>
      <DialogTrigger asChild>
        <button className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors">
          edit
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle>Current Location</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>System</Label>
            <Select value={value} onValueChange={setValue}>
              <SelectTrigger><SelectValue placeholder="Select a system…" /></SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value={NONE}>— Not set —</SelectItem>
                {SYSTEM_GROUPS.map((g) => (
                  <SelectGroup key={g.label}>
                    <SelectLabel>{g.label}</SelectLabel>
                    {g.systems.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
