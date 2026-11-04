"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/registry/syntaqx/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/registry/syntaqx/ui/dialog";

function describe(el: Element | null): string {
  if (!el || el === document.body) return "nothing (the page itself)";
  const label = el.getAttribute("aria-label") ?? el.textContent?.trim();
  return label ? `"${label.slice(0, 32)}"` : el.tagName.toLowerCase();
}

// Shows where focus is, so the difference is visible without a screen reader.
function FocusWatcher() {
  const [where, setWhere] = useState("nothing yet");

  useEffect(() => {
    // focusout fires before the next element gains focus, so read the
    // settled activeElement a tick later.
    const update = () => setTimeout(() => setWhere(describe(document.activeElement)), 0);
    document.addEventListener("focusin", update);
    document.addEventListener("focusout", update);
    return () => {
      document.removeEventListener("focusin", update);
      document.removeEventListener("focusout", update);
    };
  }, []);

  return (
    <p className="text-sm text-muted-foreground" aria-hidden>
      Focus is on: <span className="text-foreground">{where}</span>
    </p>
  );
}

// The common way, for contrast: focus comes in only because the close button
// autofocuses. Tab can walk out behind it, and closing it drops focus on the
// page, so a keyboard user starts over from the top.
function HandRolledDialog({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-background/70 p-4"
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div className="w-full max-w-sm rounded-lg border bg-card p-6 shadow-lg">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-base font-medium">Hand-rolled dialog</p>
          <Button variant="ghost" size="icon-sm" autoFocus aria-label="Close" onClick={onClose}>
            <X />
          </Button>
        </div>
        <p className="text-sm/relaxed text-muted-foreground">
          Tab can still walk out behind this overlay, and closing it drops focus on the page.
        </p>
      </div>
    </div>
  );
}

export default function DialogFocusReturn() {
  const [handRolled, setHandRolled] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog</DialogTitle>
              <DialogDescription>
                Focus is trapped in here. Close it any way you like and it goes back to the button
                that opened it.
              </DialogDescription>
            </DialogHeader>
            <DialogClose asChild>
              <Button className="justify-self-start">Done</Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
        <Button variant="outline" onClick={() => setHandRolled(true)}>
          Open hand-rolled overlay
        </Button>
      </div>
      <FocusWatcher />
      {handRolled && <HandRolledDialog onClose={() => setHandRolled(false)} />}
    </div>
  );
}
