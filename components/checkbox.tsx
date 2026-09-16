"use client";

import { useId, type ReactNode } from "react";
import * as RadixCheckbox from "@radix-ui/react-checkbox";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Check, Info } from "lucide-react";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  tooltip?: ReactNode;
  className?: string;
}

export function Checkbox({
  checked,
  onChange,
  label,
  tooltip,
  className = "",
}: CheckboxProps) {
  const id = useId();

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-1.5 group">
        <RadixCheckbox.Root
          id={id}
          checked={checked}
          onCheckedChange={(c) => onChange(c === true)}
          className="flex items-center justify-center w-3.5 h-3.5 rounded border border-dim/40 transition-colors cursor-pointer group-hover:border-accent/50 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
        >
          <RadixCheckbox.Indicator className="flex items-center justify-center">
            <Check size={10} strokeWidth={3} className="text-background" />
          </RadixCheckbox.Indicator>
        </RadixCheckbox.Root>
        <label
          htmlFor={id}
          className="text-xs text-dim group-hover:text-accent transition-colors select-none cursor-pointer"
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
                className="inline-flex text-dim/50 hover:text-dim transition-colors cursor-help"
              >
                <Info size={11} />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                side="top"
                sideOffset={6}
                collisionPadding={8}
                className="max-w-48 rounded-md border border-border bg-surface px-2.5 py-1.5 text-[10px] text-dim leading-snug shadow-lg z-100"
              >
                {tooltip}
                <Tooltip.Arrow className="fill-surface" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      )}
    </div>
  );
}
