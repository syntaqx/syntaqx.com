/**
 * Skeleton for the content slot of /settings/*. The settings layout
 * (sidebar + signed-in card) is already rendered around this — it
 * does its own session fetch — so this only mocks the page body.
 */
export default function SettingsLoading() {
  return (
    <div className="min-w-0 animate-pulse">
      <div className="mb-8 border-b border-border pb-4">
        <div className="h-7 w-40 rounded bg-surface" />
        <div className="mt-2 h-3.5 w-72 max-w-full rounded bg-surface" />
      </div>
      <div className="flex flex-col gap-4">
        <div className="rounded-lg border border-border bg-surface/30 p-5">
          <div className="h-4 w-44 rounded bg-surface" />
          <div className="mt-2 h-3 w-64 max-w-full rounded bg-surface" />
        </div>
        <div className="rounded-lg border border-border bg-surface/30 p-5">
          <div className="h-4 w-36 rounded bg-surface" />
          <div className="mt-2 h-3 w-80 max-w-full rounded bg-surface" />
        </div>
      </div>
    </div>
  );
}
