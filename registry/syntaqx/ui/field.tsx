"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { CircleAlert, CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/registry/syntaqx/ui/label";

// shadcn's Field, extended: a Field wires up the control inside it. The
// label points at the control, the control is described by whatever
// description, error or success message is actually rendered, and
// `invalid`, `disabled` and `required` reach the control without repeating
// them on every element.

type Part = "description" | "error" | "valid";

interface FieldState {
  id: string;
  invalid: boolean;
  disabled: boolean;
  required: boolean;
  ids: Record<Part, string>;
  present: Set<Part>;
  register: (part: Part) => () => void;
}

const FieldContext = React.createContext<FieldState | null>(null);

/** The field's state, or null outside a Field. */
export function useField() {
  return React.useContext(FieldContext);
}

/**
 * Props a control spreads onto its element so the Field around it can label
 * and describe it. The control's own props win.
 */
export function useFieldControl<
  P extends {
    id?: string;
    disabled?: boolean;
    required?: boolean;
    "aria-invalid"?: React.AriaAttributes["aria-invalid"];
    "aria-describedby"?: string;
  },
>(props: P): P {
  const field = useField();
  if (!field) return props;
  const describedBy = (["description", "error", "valid"] as const)
    .filter((part) => field.present.has(part))
    .map((part) => field.ids[part]);
  if (props["aria-describedby"]) describedBy.push(props["aria-describedby"]);
  return {
    ...props,
    id: props.id ?? field.id,
    disabled: props.disabled ?? (field.disabled || undefined),
    required: props.required ?? (field.required || undefined),
    "aria-invalid": props["aria-invalid"] ?? (field.invalid || undefined),
    "aria-describedby": describedBy.length ? describedBy.join(" ") : undefined,
  };
}

function useRegister(part: Part) {
  const field = useField();
  const register = field?.register;
  React.useLayoutEffect(() => register?.(part), [register, part]);
  return field?.ids[part];
}

function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn(
        "flex flex-col gap-6 has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3",
        className,
      )}
      {...props}
    />
  );
}

function FieldLegend({
  className,
  variant = "legend",
  ...props
}: React.ComponentProps<"legend"> & { variant?: "legend" | "label" }) {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn(
        "mb-3 font-medium text-foreground data-[variant=label]:text-sm data-[variant=legend]:text-base",
        className,
      )}
      {...props}
    />
  );
}

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        "group/field-group @container/field-group flex w-full flex-col gap-6 data-[slot=checkbox-group]:gap-3 *:data-[slot=field-group]:gap-4",
        className,
      )}
      {...props}
    />
  );
}

const fieldVariants = cva("group/field flex w-full gap-2", {
  variants: {
    orientation: {
      vertical: ["flex-col *:w-full [&>.sr-only]:w-auto"],
      horizontal: [
        "flex-row items-center gap-3",
        "*:data-[slot=field-label]:flex-auto",
        "has-[>[data-slot=field-content]]:items-start has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
      ],
      responsive: [
        "flex-col @md/field-group:flex-row @md/field-group:items-center @md/field-group:gap-3 *:w-full @md/field-group:*:w-auto [&>.sr-only]:w-auto",
        "@md/field-group:*:data-[slot=field-label]:flex-auto",
        "@md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
      ],
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
});

function Field({
  className,
  orientation = "vertical",
  invalid = false,
  disabled = false,
  required = false,
  id: idProp,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof fieldVariants> & {
    /** Marks the control invalid (aria-invalid) and styles it so. */
    invalid?: boolean;
    disabled?: boolean;
    /** Marks the control required and adds a marker to the label. */
    required?: boolean;
  }) {
  const generated = React.useId();
  const id = idProp ?? generated;
  const [present, setPresent] = React.useState<Set<Part>>(() => new Set());

  const register = React.useCallback((part: Part) => {
    setPresent((s) => new Set(s).add(part));
    return () =>
      setPresent((s) => {
        const next = new Set(s);
        next.delete(part);
        return next;
      });
  }, []);

  const state = React.useMemo<FieldState>(
    () => ({
      id,
      invalid,
      disabled,
      required,
      ids: { description: `${id}-description`, error: `${id}-error`, valid: `${id}-valid` },
      present,
      register,
    }),
    [id, invalid, disabled, required, present, register],
  );

  return (
    <FieldContext.Provider value={state}>
      <div
        role="group"
        data-slot="field"
        data-orientation={orientation}
        data-invalid={invalid || undefined}
        data-disabled={disabled || undefined}
        className={cn(fieldVariants({ orientation }), className)}
        {...props}
      />
    </FieldContext.Provider>
  );
}

function FieldContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-content"
      className={cn("group/field-content flex flex-1 flex-col gap-1 leading-snug", className)}
      {...props}
    />
  );
}

function FieldLabel({
  className,
  children,
  htmlFor,
  ...props
}: React.ComponentProps<typeof Label>) {
  const field = useField();
  return (
    <Label
      data-slot="field-label"
      htmlFor={htmlFor ?? field?.id}
      className={cn(
        "group/field-label peer/field-label flex w-fit gap-1 leading-snug group-data-[disabled=true]/field:opacity-50 has-data-checked:border-primary/30 has-data-checked:bg-primary/5 has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border has-[>[data-slot=field]]:not-has-[:disabled,[data-disabled]]:hover:bg-muted/50 has-[>[data-slot=field]]:has-focus-visible:border-ring has-[>[data-slot=field]]:has-focus-visible:ring-3 has-[>[data-slot=field]]:has-focus-visible:ring-ring/50 *:data-[slot=field]:p-3 dark:has-data-checked:border-primary/20 dark:has-data-checked:bg-primary/10",
        "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col",
        className,
      )}
      {...props}
    >
      {children}
      {field?.required && (
        <>
          <span aria-hidden className="text-destructive">
            *
          </span>
          <span className="sr-only">(required)</span>
        </>
      )}
    </Label>
  );
}

function FieldTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-label"
      className={cn(
        "flex w-fit items-center gap-2 text-sm font-medium group-data-[disabled=true]/field:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

// A div, not shadcn's p, so a description can hold a list (RequirementList).
function FieldDescription({ className, id, ...props }: React.ComponentProps<"div">) {
  const fieldId = useRegister("description");
  return (
    <div
      id={id ?? fieldId}
      data-slot="field-description"
      className={cn(
        "text-left text-sm/normal  font-normal text-muted-foreground group-has-data-horizontal/field:text-balance [[data-variant=legend]+&]:-mt-1.5",
        "last:mt-0 nth-last-2:-mt-1",
        "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className,
      )}
      {...props}
    />
  );
}

function FieldSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  children?: React.ReactNode;
}) {
  return (
    <div
      data-slot="field-separator"
      data-content={!!children}
      className={cn("relative -my-2 flex h-5 items-center text-sm", className)}
      {...props}
    >
      <div aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-border" />
      {children && (
        <span
          className="relative mx-auto block w-fit bg-background px-2 text-muted-foreground"
          data-slot="field-separator-content"
        >
          {children}
        </span>
      )}
    </div>
  );
}

/** Renders only when there is something to say, so it never leaves an empty gap. */
function FieldError({
  className,
  children,
  errors,
  id,
  ...props
}: React.ComponentProps<"div"> & {
  errors?: Array<{ message?: string } | undefined>;
}) {
  const unique = [...new Map((errors ?? []).map((e) => [e?.message, e])).values()].filter(
    (e) => e?.message,
  );
  const content =
    children ??
    (unique.length === 1 ? (
      unique[0]?.message
    ) : unique.length > 1 ? (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {unique.map((e) => (
          <li key={e?.message}>{e?.message}</li>
        ))}
      </ul>
    ) : null);

  if (!content) return null;
  return <FieldErrorMessage id={id} className={className} message={content} {...props} />;
}

function FieldErrorMessage({
  className,
  message,
  id,
  ...props
}: React.ComponentProps<"div"> & { message: React.ReactNode }) {
  const fieldId = useRegister("error");
  return (
    <div
      id={id ?? fieldId}
      data-slot="field-error"
      className={cn("flex gap-1.5 text-sm/snug font-normal text-destructive", className)}
      {...props}
    >
      <CircleAlert aria-hidden className="mt-px size-4 shrink-0" />
      <div className="min-w-0">{message}</div>
    </div>
  );
}

/** A success message, for a value that has just passed a check worth confirming. */
function FieldValid({ className, children, id, ...props }: React.ComponentProps<"div">) {
  const fieldId = useRegister("valid");
  return (
    <div
      id={id ?? fieldId}
      data-slot="field-valid"
      className={cn("flex gap-1.5 text-sm/snug font-normal text-primary", className)}
      {...props}
    >
      <CircleCheck aria-hidden className="mt-px size-4 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldValid,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
};
