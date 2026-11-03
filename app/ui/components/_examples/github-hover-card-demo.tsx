import { GitHubHoverCard } from "@/registry/syntaqx/ui/github-hover-card";

export default function GitHubHoverCardDemo() {
  return (
    <p className="text-sm">
      Built with help from <GitHubHoverCard login="octocat" /> and{" "}
      <GitHubHoverCard login="torvalds" />.
    </p>
  );
}
