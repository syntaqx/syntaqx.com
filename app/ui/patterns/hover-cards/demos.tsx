"use client";

import { DemoFrame } from "@/app/ui/_components/demo-frame";
import { GitHubUser } from "@/app/ui/components/_examples/hover-card-github";
import { Timestamp } from "@/registry/syntaqx/ui/timestamp";

function TimeDemo() {
  // One representative event. The reader's local tz is what changes the
  // demo — the data stays fixed.
  const sample = {
    iso: "2026-05-12T14:20:00Z",
    sourceTz: "America/Los_Angeles",
    sourceLabel: "Stripe HQ",
  } as const;

  return (
    <DemoFrame className="p-6">
      <dl className="space-y-4 text-sm">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-muted-foreground">Created</dt>
          <dd>
            <Timestamp {...sample} />
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-muted-foreground">Created (date only)</dt>
          <dd>
            <Timestamp {...sample} variant="date" />
          </dd>
        </div>
      </dl>
    </DemoFrame>
  );
}

function UserDemo() {
  const handles = ["syntaqx", "octocat", "torvalds", "gaearon"];
  return (
    <p className="text-sm/loose text-foreground">
      Thanks to{" "}
      {handles.map((h, i) => (
        <span key={h}>
          <GitHubUser login={h} />
          {i < handles.length - 2 ? ", " : i === handles.length - 2 ? ", and " : ""}
        </span>
      ))}{" "}
      for the inspiration.
    </p>
  );
}

// ---------------------------------------------------------------------------
// Avatar hover (same load-on-intent, different trigger surface)
// ---------------------------------------------------------------------------

function AvatarDemo() {
  const handles = ["syntaqx", "octocat", "torvalds", "gaearon", "tj", "sindresorhus"];
  return (
    <div className="flex flex-wrap items-center gap-3">
      {handles.map((h) => (
        <GitHubUser key={h} login={h}>
          <a
            href={`https://github.com/${h}`}
            target="_blank"
            rel="noreferrer"
            aria-label={`@${h} on GitHub`}
            className="block size-10 overflow-hidden rounded-full border bg-muted outline-none transition-shadow hover:ring-2 hover:ring-primary/50 focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://github.com/${h}.png?size=80`}
              alt=""
              width={40}
              height={40}
              loading="lazy"
              decoding="async"
              className="size-full object-cover"
            />
          </a>
        </GitHubUser>
      ))}
    </div>
  );
}

export { TimeDemo, UserDemo, AvatarDemo };
