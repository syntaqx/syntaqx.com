"use client";

import * as React from "react";
import { ArrowBigUpDash, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/registry/syntaqx/ui/input-group";

// A password field with a show/hide toggle and a Caps Lock warning, the two
// things that cause most failed sign-ins. Showing the password keeps the
// caret where it was; the toggle is a real button with a pressed state, and
// the warning is announced politely, only while it applies.

function PasswordInput({
  className,
  size,
  onKeyDown,
  onKeyUp,
  onBlur,
  ...props
}: Omit<React.ComponentProps<typeof InputGroupInput>, "type" | "size"> & {
  size?: "sm" | "default" | "lg";
}) {
  const [visible, setVisible] = React.useState(false);
  const [capsLock, setCapsLock] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const toggle = () => {
    const input = inputRef.current;
    const start = input?.selectionStart ?? null;
    const end = input?.selectionEnd ?? null;
    setVisible((v) => !v);
    requestAnimationFrame(() => {
      if (!input) return;
      input.focus();
      if (start !== null && end !== null) input.setSelectionRange(start, end);
    });
  };

  const readCaps = (e: React.KeyboardEvent<HTMLInputElement>) =>
    setCapsLock(e.getModifierState?.("CapsLock") ?? false);

  return (
    <div data-slot="password-input" className={cn("flex w-full flex-col", className)}>
      <InputGroup size={size}>
        <InputGroupInput
          ref={inputRef}
          type={visible ? "text" : "password"}
          autoComplete="current-password"
          spellCheck={false}
          autoCapitalize="none"
          size={size}
          onKeyDown={(e) => {
            readCaps(e);
            onKeyDown?.(e);
          }}
          onKeyUp={(e) => {
            readCaps(e);
            onKeyUp?.(e);
          }}
          onBlur={(e) => {
            setCapsLock(false);
            onBlur?.(e);
          }}
          {...props}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-sm"
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            onClick={toggle}
            disabled={props.disabled}
          >
            {visible ? <EyeOff /> : <Eye />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <p
        aria-live="polite"
        className={cn(
          "flex items-center gap-1.5 text-sm text-muted-foreground",
          capsLock && "mt-1.5",
        )}
      >
        {capsLock && (
          <>
            <ArrowBigUpDash aria-hidden className="size-4 shrink-0" />
            Caps Lock is on
          </>
        )}
      </p>
    </div>
  );
}

export { PasswordInput };
