import { getAllTags } from "@/lib/posts";
import { TagChips } from "@/components/tag-chips";
import { PageHeader } from "@/components/page-header";
import { JsonLd } from "@/components/json-ld";
import { itemList } from "@/lib/schema";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "/tags",
  "Browse Posts by Topic",
  "Browse every topic I write about: from software engineering and architecture to LLMs, DevOps, and career growth. Find posts by tag.",
);

export default function TagsPage() {
  const tags = getAllTags();

  return (
    <div>
      <JsonLd
        data={itemList(
          "Browse Posts by Topic",
          "/tags",
          tags.map((tag) => ({ name: tag.label, path: `/tags/${tag.slug}` })),
        )}
      />
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
