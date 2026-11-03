import { GitHubHoverCard } from "@/registry/syntaqx/ui/github-hover-card";

export default function GitHubHoverCardAvatar() {
  return (
    <GitHubHoverCard login="octocat">
      <a
        href="https://github.com/octocat"
        aria-label="@octocat on GitHub"
        className="block size-10 overflow-hidden rounded-full border focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://github.com/octocat.png?size=80" alt="" className="size-full" />
      </a>
    </GitHubHoverCard>
  );
}
