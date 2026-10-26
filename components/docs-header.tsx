import type { ReactNode } from "react";

/**
 * The docs' page header: a small eyebrow, a modest title and what the page
 * is about. Quiet on purpose, so the page opens straight into reading.
 */
export function DocsHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  /** The description, meta row and any action, under the title. */
  children?: ReactNode;
}) {
  return (
    <header className="mb-8 border-b border-border pb-6">
      {eyebrow && <p className="inst mb-3 text-dim">{eyebrow}</p>}
      <h1 className="mb-2 text-2xl leading-snug wrap-break-word sm:text-[1.75rem]">{title}</h1>
      {children}
    </header>
  );
}
