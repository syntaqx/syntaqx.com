import { codeToHtml } from "shiki";
import { CopyButton } from "@/registry/syntaqx/ui/copy-button";
import { cn } from "@/lib/cn";
import { shikiOptions } from "@/lib/shiki";

/**
 * Highlighted on the server with the docs' themes, with a copy button and an
 * optional file name. Long files scroll inside the block.
 */
export async function CodeBlock({
  code,
  lang = "tsx",
  title,
  className,
}: {
  code: string;
  lang?: string;
  title?: string;
  className?: string;
}) {
  const html = await codeToHtml(code.trimEnd(), {
    lang,
    ...shikiOptions,
  });

  const body = (
    <div
      className="code-block min-w-0 flex-1 overflow-auto font-mono text-[0.8125rem]/relaxed"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );

  // Titled blocks carry the button in their header. Untitled ones sit it in
  // line with the code: centered on a one-line command, level with the first
  // line of anything longer.
  return (
    <div className={cn("overflow-hidden rounded-lg border bg-card", className)}>
      {title && (
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2">
          <span className="truncate font-mono text-xs text-muted-foreground">{title}</span>
          <CopyButton value={code} size="icon-sm" className="size-7" />
        </div>
      )}
      {title ? (
        <div className="flex max-h-112 p-4">{body}</div>
      ) : (
        <div
          className={cn(
            "flex max-h-112 gap-3 py-2.5 pr-2.5 pl-4",
            code.trim().includes("\n") ? "items-start" : "items-center",
          )}
        >
          {body}
          <CopyButton value={code} size="icon-sm" className="size-7 shrink-0" />
        </div>
      )}
    </div>
  );
}
