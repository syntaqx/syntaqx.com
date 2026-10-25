import { getAllPosts, getAllTags, getNewestPostSlug, slugifyTag } from "@/lib/posts";
import { PostsBrowser } from "@/components/posts-browser";
import { SimpleIcon } from "@/components/simple-icon";
import { PageHeader } from "@/components/page-header";
import { JsonLd } from "@/components/json-ld";
import { itemList } from "@/lib/schema";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "/posts",
  "All Posts",
  "Essays and notes on software engineering, architecture, engineering leadership, and building with LLMs: everything I write, gathered in one place.",
);

export default function PostsPage() {
  const posts = getAllPosts();
  const newestSlug = getNewestPostSlug(posts);
  const tags = getAllTags(posts);

  return (
    <div>
      <JsonLd
        data={itemList(
          "All Posts",
          "/posts",
          posts.map((post) => ({ name: post.title, path: `/posts/${post.slug}` })),
        )}
      />
      <PageHeader
        label="posts"
        title="Writing"
        scene="writing"
        sceneLabel="A pen writing a page line by line, lifted off a stack of drafts"
        hideSceneOnMobile
      >
        <p>
          Thoughts on building products, leading teams, and everything in
          between.
        </p>
        <a
          href="/feed.xml"
          className="mt-6 inline-flex items-center gap-1.5 font-mono text-xs text-dim transition-colors hover:text-accent"
          aria-label="Subscribe via RSS"
        >
          <SimpleIcon name="rss" size={13} />
          rss
        </a>
      </PageHeader>
      <PostsBrowser
        posts={posts.map((post) => ({
          slug: post.slug,
          title: post.title,
          date: post.date,
          description: post.description,
          readingTimeMinutes: post.readingTimeMinutes,
          tagSlugs: (post.tags ?? []).map(slugifyTag),
        }))}
        tags={tags}
        newestSlug={newestSlug}
      />
    </div>
  );
}
