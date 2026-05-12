/**
 * Placeholder card for settings sections that don't have an
 * implementation yet. Every section in `_sections.ts` with
 * `available: false` should render one of these.
 *
 * When you build the real section, replace the page body — keep the
 * `<SettingsHeader>` for consistency.
 */
export function SettingsHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-6 pb-4 border-b border-border">
      <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      {description && <p className="text-sm text-muted mt-1">{description}</p>}
    </header>
  );
}

export function ComingSoon({ note }: { note?: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface/50 p-6 text-center">
      <p className="text-sm text-muted">Coming soon.</p>
      {note && <p className="text-xs text-dim mt-2">{note}</p>}
    </div>
  );
}
