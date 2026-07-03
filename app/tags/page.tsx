import type { Metadata } from "next";
import { getAllTags } from "@/lib/posts";
import { TagChips } from "@/components/tag-chips";

export const metadata: Metadata = {
  title: "Browse Posts by Topic",
  description:
    "Browse every topic I write about: from software engineering and architecture to LLMs, DevOps, and career growth. Find posts by tag.",
};

export default function TagsPage() {
  const tags = getAllTags();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xs font-medium uppercase tracking-widest text-dim mb-2">
          Tags
        </h1>
        <p className="text-sm text-muted">
          Browse posts by topic. {tags.length} tag
          {tags.length === 1 ? "" : "s"} in total.
        </p>
      </div>
      <TagChips tags={tags} showCounts />
    </div>
  );
}
