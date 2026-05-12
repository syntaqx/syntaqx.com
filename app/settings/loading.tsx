/**
 * Settings-shaped skeleton. Shown the first time a user navigates to
 * any /settings/* route, while the layout fetches the session.
 *
 * Once inside the layout, navigation between sibling sections
 * (/settings/profile -> /settings/account) re-renders only the page
 * portion, so per-segment loading.tsx files would also help. We don't
 * have them yet because the layout's session lookup dominates and
 * sub-page renders are cheap; revisit if any individual section
 * starts doing real DB work in its server component.
 */
export default function SettingsLoading() {
  return (
    <div className="grid gap-10 lg:grid-cols-[240px_1fr] items-start animate-pulse">
      <aside className="hidden lg:block lg:sticky lg:top-24">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
          <div className="h-9 w-9 rounded-full bg-surface" />
          <div className="flex flex-col gap-1.5 flex-1">
            <div className="h-3 w-20 rounded bg-surface" />
            <div className="h-3.5 w-28 rounded bg-surface" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          {[40, 56, 48, 64, 52, 60, 44].map((w, i) => (
            <div
              key={i}
              className="h-7 rounded"
              style={{ width: `${w}%`, background: "var(--surface)" }}
            />
          ))}
        </div>
      </aside>
      <div className="min-w-0">
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
    </div>
  );
}
