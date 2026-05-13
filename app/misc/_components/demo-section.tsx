import type { ReactNode } from "react";

export interface DemoSource {
  name: string;
  // Optional. When provided, the name renders as an external link; when
  // omitted, it renders as plain text in the same slot. Useful for citing a
  // company without endorsing the click-through.
  href?: string;
}

export function DemoSection({
  title,
  blurb,
  sources,
  children,
}: {
  title: string;
  blurb: ReactNode;
  sources: DemoSource[];
  children: ReactNode;
}) {
  return (
    <section className="mb-12">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-sm font-medium text-foreground mb-1">{title}</h2>
          <p className="text-xs text-dim leading-relaxed">{blurb}</p>
        </div>
        <div className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/50 px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest text-dim">
          <span className="text-dim/70">Inspired by</span>
          {sources.map((s, i) => (
            <span key={s.href ?? s.name} className="contents">
              {s.href ? (
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-accent"
                >
                  {s.name}
                </a>
              ) : (
                <span className="text-foreground">{s.name}</span>
              )}
              {i < sources.length - 1 && <span className="text-dim/40">+</span>}
            </span>
          ))}
        </div>
      </div>
      {children}
    </section>
  );
}
