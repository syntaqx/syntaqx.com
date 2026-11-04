"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/registry/syntaqx/ui/button";

// The copy button from shadcn's own docs (apps/v4/components/copy-button.tsx),
// as an installable component: a Button that copies `value`, falls back to
// execCommand where the Clipboard API is blocked, and turns into its own
// confirmation for 2s. At an icon size it's icon-only with a screen reader
// label; at a text size it reads "Copy", then "Copied".

function legacyCopy(value: string) {
  const area = document.createElement("textarea");
  area.value = value;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  area.style.pointerEvents = "none";
  document.body.appendChild(area);
  area.focus();
  area.select();
  area.setSelectionRange(0, value.length);
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }
  document.body.removeChild(area);
  return copied;
}

export async function copyToClipboard(value: string) {
  if (typeof window === "undefined" || !value) return false;
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      return legacyCopy(value);
    }
  }
  return legacyCopy(value);
}

function CopyButton({
  value,
  className,
  variant = "ghost",
  size = "icon",
  onCopy,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "value" | "children"> & {
  value: string;
  /** Called after a successful copy. */
  onCopy?: () => void;
}) {
  const [copied, setCopied] = React.useState(false);
  const iconOnly = typeof size === "string" && size.startsWith("icon");

  React.useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <Button
      data-slot="copy-button"
      data-copied={copied || undefined}
      variant={variant}
      size={size}
      className={cn("data-copied:text-primary", className)}
      onClick={async () => {
        if (await copyToClipboard(value)) {
          setCopied(true);
          onCopy?.();
        }
      }}
      {...props}
    >
      {copied ? <Check /> : <Copy />}
      {iconOnly ? (
        <span className="sr-only">{copied ? "Copied" : "Copy"}</span>
      ) : copied ? (
        "Copied"
      ) : (
        "Copy"
      )}
      <span aria-live="polite" className="sr-only">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </Button>
  );
}

export { CopyButton };
