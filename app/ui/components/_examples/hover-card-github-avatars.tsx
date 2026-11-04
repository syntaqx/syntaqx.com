"use client";

import { GitHubUser } from "./hover-card-github";

export default function HoverCardGitHubAvatars() {
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
