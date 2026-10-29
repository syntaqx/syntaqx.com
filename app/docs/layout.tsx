import { getDocsByCategory } from "@/lib/docs";
import { DocsSidebar, MobileDocsSidebar } from "@/components/docs-sidebar";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Only what the sidebar shows crosses to the client, not each doc's text.
  const categories = getDocsByCategory().map((category) => ({
    name: category.name,
    docs: category.docs.map(({ slug, navTitle }) => ({ slug, navTitle })),
  }));

  return (
    <div className="lg:grid lg:grid-cols-[248px_1fr] lg:gap-10">
      <aside className="hidden lg:block">
        <div className="rail-scroll sticky top-16 max-h-[calc(100vh-5rem)] overflow-y-auto border border-border">
          <DocsSidebar categories={categories} />
        </div>
      </aside>
      <div className="min-w-0">
        <MobileDocsSidebar categories={categories} />
        {children}
      </div>
    </div>
  );
}
