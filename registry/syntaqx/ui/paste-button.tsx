"use client";

import * as React from "react";
import { Check, ClipboardPaste } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/registry/syntaqx/ui/button";

// The Copy Button's other half: a Button that reads the clipboard and hands
// the text to `onPaste`, then turns into its own confirmation for 2s. At an
// icon size it's icon-only with a screen reader label; at a text size it
// reads "Paste", then "Pasted". Where the Clipboard API is missing or the
// reader declines the permission prompt, nothing happens: Ctrl/Cmd+V in the
// field still works, so there's nothing to report.

export async function readClipboard() {
  if (typeof window === "undefined" || !navigator.clipboard?.readText) return null;
  try {
    return await navigator.clipboard.readText();
  } catch {
    return null;
  }
}

function PasteButton({
  className,
  variant = "ghost",
  size = "icon",
  onPaste,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "children" | "onClick" | "onPaste"> & {
  /** Called with the clipboard's text, when there is some. */
  onPaste: (text: string) => void;
}) {
  const [pasted, setPasted] = React.useState(false);
  const iconOnly = typeof size === "string" && size.startsWith("icon");

  React.useEffect(() => {
    if (!pasted) return;
    const timer = setTimeout(() => setPasted(false), 2000);
    return () => clearTimeout(timer);
  }, [pasted]);

  return (
    <Button
      data-slot="paste-button"
      data-pasted={pasted || undefined}
      variant={variant}
      size={size}
      className={cn("data-pasted:text-primary", className)}
      onClick={async () => {
        const text = await readClipboard();
        if (text) {
          onPaste(text);
          setPasted(true);
        }
      }}
      {...props}
    >
      {pasted ? <Check /> : <ClipboardPaste />}
      {iconOnly ? (
        <span className="sr-only">{pasted ? "Pasted" : "Paste"}</span>
      ) : pasted ? (
        "Pasted"
      ) : (
        "Paste"
      )}
      <span aria-live="polite" className="sr-only">
        {pasted ? "Pasted from clipboard" : ""}
      </span>
    </Button>
  );
}

export { PasteButton };
