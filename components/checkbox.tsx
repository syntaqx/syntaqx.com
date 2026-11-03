"use client";

import { useId, type ReactNode } from "react";
import * as RadixCheckbox from "@radix-ui/react-checkbox";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Check, Info } from "lucide-react";
import { cn } from "@/lib/cn";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  tooltip?: ReactNode;
  className?: string;
}

export function Checkbox({ checked, onChange, label, tooltip, className }: CheckboxProps) {
  const id = useId();

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-1.5 group">
        <RadixCheckbox.Root
          id={id}
          checked={checked}
          onCheckedChange={(c) => onChange(c === true)}
          className="flex items-center justify-center size-3.5  border border-muted-foreground/40 transition-colors cursor-pointer group-hover:border-primary/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        >
          <RadixCheckbox.Indicator className="flex items-center justify-center">
            <Check size={10} strokeWidth={3} className="text-background" />
          </RadixCheckbox.Indicator>
        </RadixCheckbox.Root>
        <label
          htmlFor={id}
          className="text-xs text-muted-foreground group-hover:text-primary transition-colors select-none cursor-pointer"
        >
          {label}
        </label>
      </div>
      {tooltip && (
        <Tooltip.Provider delayDuration={150}>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                type="button"
                aria-label={`More information about ${label}`}
                className="inline-flex text-muted-foreground/50 hover:text-muted-foreground transition-colors cursor-help"
              >
                <Info size={11} />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                side="top"
                sideOffset={6}
                collisionPadding={8}
                className="max-w-48 border border-border bg-card px-2.5 py-1.5 text-[10px] text-muted-foreground leading-snug shadow-lg z-100"
              >
                {tooltip}
                <Tooltip.Arrow className="fill-card" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      )}
    </div>
  );
}
