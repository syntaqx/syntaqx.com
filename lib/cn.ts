import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Join class names, letting later Tailwind classes win over earlier ones that
 * set the same property. Components put their base classes first and the
 * caller's `className` last, so `cn("px-3 bg-surface", "bg-background")`
 * gives "px-3 bg-background".
 *
 * The site's own multi-property utilities (`inst`, `eyebrow`, `post-row`) are
 * unknown to the merge and always kept, which is what they need: Tailwind
 * emits them ahead of single-property utilities, so `cn("inst", "text-sm")`
 * resizes the text and keeps the rest of `inst`.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
