import { getDocsByCategory } from "@/lib/docs";
import { DocsSidebar, MobileDocsSidebar } from "@/components/docs-sidebar";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = getDocsByCategory();

  return (
    <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-10">
      <aside className="hidden lg:block">
        <div className="sticky top-[6.5rem] max-h-[calc(100vh-7.5rem)] overflow-y-auto">
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
