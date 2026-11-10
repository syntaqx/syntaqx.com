"use client";

import type { ComponentProps, ReactNode } from "react";
import { ExternalLink, FileText, Info, Trash2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Button } from "@/registry/syntaqx/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/registry/syntaqx/ui/card";
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

/**
 * A titled box in a tool's main column: a bar with its icon, title and
 * actions, its content, and an optional footer bar. `flush` drops the
 * content's padding, for rows that draw their own edges or a <pre> that pads
 * itself.
 */
export function ToolPanel({
  icon,
  title,
  action,
  footer,
  flush = false,
  className,
  contentClassName,
  children,
}: {
  icon?: ReactNode;
  title: ReactNode;
  action?: ReactNode;
  footer?: ReactNode;
  flush?: boolean;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}) {
  return (
    <Card size="sm" className={cn("gap-0 py-0", className)}>
      <CardHeader className="flex min-h-12 items-center justify-between gap-2 border-b py-2 [.border-b]:pb-2">
        <CardTitle className="flex min-w-0 items-center gap-2 text-sm font-medium">
          {/* Teal by inheritance, so an icon's own color (a failed check, say) wins. */}
          {icon && <span className="flex shrink-0 text-primary [&>svg]:size-4">{icon}</span>}
          {title}
        </CardTitle>
        {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
      </CardHeader>
      <CardContent className={cn(flush ? "gap-0 px-0" : "py-4", contentClassName)}>
        {children}
      </CardContent>
      {footer && <CardFooter className="border-t py-3 [.border-t]:pt-3">{footer}</CardFooter>}
    </Card>
  );
}

/** A tool's right-hand column of notes, beside the tool on wide screens and under it on phones. */
export function ToolAside({ className, ...props }: ComponentProps<"aside">) {
  return <aside className={cn("flex shrink-0 flex-col gap-6 lg:w-96", className)} {...props} />;
}

/**
 * A note in a ToolAside: an icon and a heading, then reading text. The
 * heading is an h2 under the tool's h1, so the page's outline lists it.
 */
export function ToolCard({
  icon,
  title,
  action,
  className,
  children,
}: {
  icon?: ReactNode;
  title: ReactNode;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Card size="sm" className={className}>
      <CardHeader className="flex items-center justify-between gap-2">
        {/* Classes on CardTitle, not the h2, so cn() resolves them against the title's own. */}
        <CardTitle
          asChild
          className="flex items-center gap-2 text-lg leading-none tracking-wide group-data-[size=sm]/card:text-lg [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-primary"
        >
          <h2>
            {icon}
            {title}
          </h2>
        </CardTitle>
        {action}
      </CardHeader>
      <CardContent className="leading-relaxed text-muted-foreground">{children}</CardContent>
    </Card>
  );
}

/** The links a tool builds on: site pages open in place, anything else in a new tab. */
export function ReferencesCard({ links }: { links: readonly { href: string; label: string }[] }) {
  return (
    <ToolCard icon={<ExternalLink />} title="References">
      <ul className="flex flex-col gap-2">
        {links.map(({ href, label }) => {
          const className = "text-foreground transition-colors hover:text-primary";
          return (
            <li key={href}>
              {/^https?:/.test(href) ? (
                <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
                  {label}
                </a>
              ) : (
                <Link href={href} className={className}>
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </ToolCard>
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
