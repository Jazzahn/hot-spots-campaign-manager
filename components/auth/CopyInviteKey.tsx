"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  inviteKey: string;
}

export default function CopyInviteKey({ inviteKey }: Props) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/join/${inviteKey}`;

  function copy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
      <span className="text-muted-foreground shrink-0">Invite link</span>
      <span className="font-mono text-xs truncate flex-1 text-foreground">{url}</span>
      <Button size="sm" variant="outline" className="shrink-0 h-7 text-xs" onClick={copy}>
        {copied ? "Copied!" : "Copy"}
      </Button>
    </div>
  );
}
