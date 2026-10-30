import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Join class names, letting later Tailwind classes win over earlier ones that
 * set the same property. Components put their base classes first and the
 * caller's `className` last, so `cn("px-3 bg-surface", "bg-background")`
 * gives "px-3 bg-background". Custom utilities (`inst`, `eyebrow`) are not
 * known to the merge and are always kept.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
