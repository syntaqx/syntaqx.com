import type { ReactNode } from "react";

/**
 * A tool page's header, in the reference pages' style (/docs/api, /docs/mcp):
 * an instrument eyebrow naming the section, the title, what the tool does,
 * and a rule before the tool itself.
 */
export function ToolHeader({
  eyebrow = "tools",
  title,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  /** What it does, under the title. */
  children?: ReactNode;
}) {
  return (
    <header className="mb-8 border-b border-border pb-8">
      <p className="eyebrow mb-5">{eyebrow}</p>
      <h1 className="mb-3 text-3xl leading-[0.95] sm:text-4xl">{title}</h1>
      {children}
    </header>
  );
}
