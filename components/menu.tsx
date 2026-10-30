"use client";

import { createContext, use, useRef, type ComponentProps, type RefObject } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

/*
 * A dropdown menu: Radix's DropdownMenu with the site's styling, in parts
 *
 *   <Menu>
 *     <MenuTrigger>…</MenuTrigger>
 *     <MenuContent className="w-60">
 *       <MenuItem onSelect={…}>…</MenuItem>
 *     </MenuContent>
 *   </Menu>
 *
 * Radix hands focus back to the trigger on close, and Chrome draws the
 * keyboard ring for it even after a click, so focus goes back only when the
 * menu was opened from the keyboard.
 */

const OpenedByPointer = createContext<RefObject<boolean> | null>(null);

export function Menu(props: ComponentProps<typeof DropdownMenu.Root>) {
  const byPointerRef = useRef(false);
  return (
    <OpenedByPointer value={byPointerRef}>
      <DropdownMenu.Root {...props} />
    </OpenedByPointer>
  );
}

export function MenuTrigger({
  onPointerDown,
  onKeyDown,
  ...props
}: ComponentProps<typeof DropdownMenu.Trigger>) {
  const byPointerRef = use(OpenedByPointer)!;
  return (
    <DropdownMenu.Trigger
      onPointerDown={(e) => {
        byPointerRef.current = true;
        onPointerDown?.(e);
      }}
      onKeyDown={(e) => {
        byPointerRef.current = false;
        onKeyDown?.(e);
      }}
      {...props}
    />
  );
}

export function MenuContent({
  className = "",
  onCloseAutoFocus,
  ...props
}: ComponentProps<typeof DropdownMenu.Content>) {
  const byPointerRef = use(OpenedByPointer)!;
  return (
    <DropdownMenu.Portal>
      <DropdownMenu.Content
        align="end"
        sideOffset={4}
        onCloseAutoFocus={(e) => {
          if (byPointerRef.current) e.preventDefault();
          onCloseAutoFocus?.(e);
        }}
        className={`z-100 border border-border bg-surface py-1 shadow-lg ${className}`}
        {...props}
      />
    </DropdownMenu.Portal>
  );
}

const item = "flex cursor-pointer px-3 outline-none transition-colors data-highlighted:bg-background";

export function MenuItem({ className = "", ...props }: ComponentProps<typeof DropdownMenu.Item>) {
  return <DropdownMenu.Item className={`${item} ${className}`} {...props} />;
}

export const MenuRadioGroup = DropdownMenu.RadioGroup;

export function MenuRadioItem({
  className = "",
  ...props
}: ComponentProps<typeof DropdownMenu.RadioItem>) {
  return <DropdownMenu.RadioItem className={`${item} ${className}`} {...props} />;
}
