import { getDocsByCategory } from "@/lib/docs";
import { DocsSidebar, MobileDocsSidebar } from "@/components/docs-sidebar";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = getDocsByCategory();

  return (
    <div className="doc-shell lg:grid lg:grid-cols-[248px_1fr] lg:gap-10">
      <aside className="hidden lg:block">
        <div className="rail-scroll sticky top-16 max-h-[calc(100vh-5rem)] overflow-y-auto pr-3">
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
