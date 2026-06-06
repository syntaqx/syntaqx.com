import type { Metadata } from "next";
import { getAllTags } from "@/lib/posts";
import { TagChips } from "@/components/tag-chips";

export const metadata: Metadata = {
  title: "Tags",
  description: "Browse all post tags.",
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
