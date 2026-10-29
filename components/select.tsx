"use client";

import { useId } from "react";
import * as RadixSelect from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectGroup {
  label: string;
  options: SelectOption[];
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: (SelectOption | SelectGroup)[];
  label?: string;
  id?: string;
  // sm sits in option bars; md matches the height of text inputs.
  size?: "sm" | "md";
  className?: string;
}

const sizes = {
  sm: "px-2 py-1 text-xs",
  md: "px-3 py-2 text-[11px]",
};

// Radix reserves "" for clearing the selection, so an option whose value is
// "" (Auto, default) goes through a sentinel.
const EMPTY = "__empty__";
const toRadix = (v: string) => (v === "" ? EMPTY : v);
const fromRadix = (v: string) => (v === EMPTY ? "" : v);

export function Select({
  value,
  onChange,
  options,
  label,
  id,
  size = "sm",
  className = "",
}: SelectProps) {
  const autoId = useId();
  const triggerId = id ?? autoId;

  const select = (
    <RadixSelect.Root
      value={toRadix(value)}
      onValueChange={(v) => onChange(fromRadix(v))}
    >
      <RadixSelect.Trigger
        id={triggerId}
        className={`inline-flex items-center justify-between gap-2 border border-border bg-background text-foreground transition-colors cursor-pointer outline-none hover:border-border-hover focus-visible:border-accent/50 data-[state=open]:border-accent/50 ${sizes[size]} ${className}`}
      >
        <RadixSelect.Value />
        <RadixSelect.Icon className="text-dim">
          <ChevronDown size={12} />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={4}
          collisionPadding={8}
          className="min-w-(--radix-select-trigger-width) max-h-(--radix-select-content-available-height) border border-border bg-surface py-1 shadow-lg z-100"
        >
          <RadixSelect.Viewport>
            {options.map((o) =>
              "options" in o ? (
                <RadixSelect.Group key={o.label}>
                  <RadixSelect.Label className="inst px-3 pt-2 pb-1 text-dim">
                    {o.label}
                  </RadixSelect.Label>
                  {o.options.map((item) => (
                    <Item key={item.value} option={item} />
                  ))}
                </RadixSelect.Group>
              ) : (
                <Item key={o.value} option={o} />
              ),
            )}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );

  if (!label) return select;

  return (
    <div className="flex items-center gap-1.5">
      <label htmlFor={triggerId} className="text-xs text-dim">
        {label}
      </label>
      {select}
    </div>
  );
}

function Item({ option }: { option: SelectOption }) {
  return (
    <RadixSelect.Item
      value={toRadix(option.value)}
      className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-dim transition-colors cursor-pointer outline-none select-none data-highlighted:bg-background data-highlighted:text-foreground data-[state=checked]:text-accent"
    >
      <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
      <RadixSelect.ItemIndicator className="ml-auto">
        <Check size={12} />
      </RadixSelect.ItemIndicator>
    </RadixSelect.Item>
  );
}
