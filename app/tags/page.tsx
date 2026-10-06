import type { Metadata } from "next";
import { getAllTags } from "@/lib/posts";
import { TagChips } from "@/components/tag-chips";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Browse Posts by Topic",
  description:
    "Browse every topic I write about: from software engineering and architecture to LLMs, DevOps, and career growth. Find posts by tag.",
};

export default function TagsPage() {
  const tags = getAllTags();

  return (
    <div>
      <PageHeader label="tags" title="Topics">
        <p>
          Browse posts by topic. {tags.length} tag
          {tags.length === 1 ? "" : "s"} in total.
        </p>
      </PageHeader>
      <TagChips tags={tags} showCounts />
    </div>
  );
}
