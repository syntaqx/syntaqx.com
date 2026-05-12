"use client";

import { createContext, useContext } from "react";

/**
 * Lets a form rendered inside a Modal call the modal's close function
 * without the parent server component having to pass a function child
 * across the server/client boundary (which RSC forbids).
 *
 * Usage:
 *   - <ModalSection> wraps its children in <ModalCloseContext value={close}>.
 *   - The form calls `useModalClose()` to get the same `close` fn.
 *   - Outside a modal, `useModalClose()` returns a no-op so the form
 *     also works on standalone pages.
 */
export const ModalCloseContext = createContext<() => void>(() => {});

export function useModalClose() {
  return useContext(ModalCloseContext);
}
