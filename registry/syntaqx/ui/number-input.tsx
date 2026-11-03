"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/registry/syntaqx/ui/input-group";

// A whole-number field: a text input with the numeric keypad on phones
// (type="number" mangles input and scrolls on wheel), arrow keys to step,
// and steppers that disable at the bounds. Typing is free; the value is
// clamped when the field loses focus, so nobody is fought mid-keystroke.

export interface NumberInputProps extends Omit<
  React.ComponentProps<typeof InputGroupInput>,
  "type" | "value" | "defaultValue" | "onChange" | "min" | "max" | "step"
> {
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
}

function NumberInput({
  className,
  size,
  value: valueProp,
  defaultValue = null,
  onValueChange,
  min = Number.MIN_SAFE_INTEGER,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  onBlur,
  onKeyDown,
  disabled,
  ...props
}: NumberInputProps) {
  const [inner, setInner] = React.useState<number | null>(defaultValue);
  const value = valueProp !== undefined ? valueProp : inner;
  const [text, setText] = React.useState(value === null ? "" : String(value));
  const [lastValue, setLastValue] = React.useState(value);

  // Follow a controlled value that changes from outside.
  if (value !== lastValue) {
    setLastValue(value);
    setText(value === null ? "" : String(value));
  }

  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const commit = (next: number | null) => {
    setLastValue(next);
    setText(next === null ? "" : String(next));
    if (valueProp === undefined) setInner(next);
    onValueChange?.(next);
  };
  const stepBy = (dir: 1 | -1) => commit(clamp((value ?? (dir > 0 ? min : max)) + dir * step));

  return (
    <InputGroup size={size} className={cn("w-40", className)} data-slot="number-input">
      <InputGroupAddon align="inline-start">
        <InputGroupButton
          size="icon-sm"
          aria-label="Decrease"
          tabIndex={-1}
          disabled={disabled || (value !== null && value <= min)}
          onClick={() => stepBy(-1)}
        >
          <Minus />
        </InputGroupButton>
      </InputGroupAddon>
      <InputGroupInput
        type="text"
        inputMode="numeric"
        autoComplete="off"
        role="spinbutton"
        aria-valuemin={min > Number.MIN_SAFE_INTEGER ? min : undefined}
        aria-valuemax={max < Number.MAX_SAFE_INTEGER ? max : undefined}
        aria-valuenow={value ?? undefined}
        size={size}
        disabled={disabled}
        value={text}
        className="text-center tabular-nums"
        onChange={(e) => {
          const raw = e.target.value.replace(/[^\d-]/g, "");
          setText(raw);
          const n = Number.parseInt(raw, 10);
          const next = Number.isNaN(n) ? null : n;
          setLastValue(next);
          if (valueProp === undefined) setInner(next);
          onValueChange?.(next);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            e.preventDefault();
            stepBy(e.key === "ArrowUp" ? 1 : -1);
          }
          onKeyDown?.(e);
        }}
        onBlur={(e) => {
          if (value !== null && clamp(value) !== value) commit(clamp(value));
          onBlur?.(e);
        }}
        {...props}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon-sm"
          aria-label="Increase"
          tabIndex={-1}
          disabled={disabled || (value !== null && value >= max)}
          onClick={() => stepBy(1)}
        >
          <Plus />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}

export { NumberInput };
