import { codeToHtml } from "shiki";
import { CopyButton } from "@/registry/syntaqx/ui/copy-button";
import { cn } from "@/lib/cn";

/**
 * Highlighted on the server with the docs' themes, with a copy button and an
 * optional file name. `maxHeight` scrolls long files inside the block.
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
    themes: { dark: "vitesse-dark", light: "vitesse-light" },
    defaultColor: false,
  });

  return (
    <div className={cn("relative border border-border bg-card", className)}>
      {title && (
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2">
          <span className="truncate font-mono text-xs text-muted-foreground">{title}</span>
          <CopyButton text={code} size="sm" />
        </div>
      )}
      {!title && <CopyButton text={code} size="sm" className="absolute top-3 right-3 z-10" />}
      <div
        className="code-block max-h-112 overflow-auto p-4 font-mono text-[0.8125rem]/relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
