"use client";

import type { ComponentProps, ReactNode } from "react";
import { FileText, Info, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/registry/syntaqx/ui/button";
import { Checkbox } from "@/registry/syntaqx/ui/checkbox";
import { Field, FieldLabel } from "@/registry/syntaqx/ui/field";
import { InputGroupAddon } from "@/registry/syntaqx/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/syntaqx/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/registry/syntaqx/ui/tooltip";

// The /tools building blocks, composed from the /ui registry. A tool's
// input is an InputGroup holding a textarea, with a PanelHeader (its label
// and actions) above and a PanelFooter (its options) below; the options are
// a checkbox or a select with the label inline.

/** A code textarea that keeps the rows it's given and resizes by hand, in place of growing. */
export const codeArea = "field-sizing-fixed max-h-none resize-y font-mono";

/** On an InputGroup inside a FileDrop: dashed and highlighted while a file is over it. */
export const dropTarget =
  "group-data-dragging/file-drop:border-dashed group-data-dragging/file-drop:border-primary";

/** A panel's top bar: its label on the left, its actions on the right. */
export function PanelHeader({ className, ...props }: ComponentProps<typeof InputGroupAddon>) {
  return (
    <InputGroupAddon
      align="block-start"
      className={cn("justify-between gap-2 border-b py-2 [.border-b]:pb-2", className)}
      {...props}
    />
  );
}

/**
 * A panel's bottom bar, for its options. Unlike other addons, a click here
 * doesn't move focus to the textarea: an option's label toggles its option.
 */
export function PanelFooter({ className, ...props }: ComponentProps<typeof InputGroupAddon>) {
  return (
    <InputGroupAddon
      align="block-end"
      className={cn(
        "cursor-default flex-wrap gap-x-4 gap-y-2 border-t py-2 [.border-t]:pt-2",
        className,
      )}
      onClick={() => {}}
      {...props}
    />
  );
}

/** A small figure beside a panel's actions, like a character count. */
export function Stat({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={cn("text-xs font-normal text-muted-foreground tabular-nums", className)}
      {...props}
    />
  );
}

const optionLabel = "font-normal text-muted-foreground";

/** The name of the file a panel's content came from, beside its label. */
export function FileName({ name, icon = <FileText /> }: { name: string; icon?: ReactNode }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1 font-normal text-primary [&_svg]:size-3.5 [&_svg]:shrink-0">
      {icon}
      <span className="truncate">{name}</span>
    </span>
  );
}

/** A labeled checkbox, with an optional "more about this" tooltip. */
export function OptionCheckbox({
  label,
  hint,
  checked,
  onCheckedChange,
}: {
  label: string;
  hint?: ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <Field orientation="horizontal" className="w-auto gap-2">
      <Checkbox checked={checked} onCheckedChange={(c) => onCheckedChange(c === true)} />
      <FieldLabel className={optionLabel}>{label}</FieldLabel>
      {hint && (
        <Tooltip>
          <TooltipTrigger
            aria-label={`More about ${label}`}
            className="relative inline-flex cursor-help rounded-sm text-muted-foreground transition-colors outline-none after:absolute after:-inset-1.25 after:content-[''] hover:text-foreground focus-visible:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Info className="size-3.5" />
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={6} collisionPadding={8} className="max-w-56">
            {hint}
          </TooltipContent>
        </Tooltip>
      )}
    </Field>
  );
}

/** A select with its label inline. Values can't be "", which Radix reserves. */
export function OptionSelect<T extends string>({
  label,
  value,
  onValueChange,
  options,
}: {
  label: string;
  value: T;
  onValueChange: (value: T) => void;
  options: readonly { value: T; label: string }[];
}) {
  return (
    <Field orientation="horizontal" className="w-auto gap-2">
      <FieldLabel className={optionLabel}>{label}</FieldLabel>
      <Select value={value} onValueChange={(v) => onValueChange(v as T)}>
        <SelectTrigger size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

/** The icon-only clear button in a panel's header. */
export function ClearButton({
  onClick,
  label = "Clear",
  className,
}: {
  onClick: () => void;
  label?: string;
  className?: string;
}) {
  return (
    <Button
      variant="outline"
      size="icon-sm"
      aria-label={label}
      onClick={onClick}
      className={cn("hover:text-destructive", className)}
    >
      <Trash2 />
    </Button>
  );
}
