import { UiJsonLd } from "@/components/ui-json-ld";
import { MobileUiSidebar, UiSidebar } from "@/components/ui-sidebar";

export default function UiPatternsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <UiJsonLd />
      <div className="lg:grid lg:grid-cols-[248px_1fr] lg:gap-10">
        <aside className="hidden lg:block">
          <div className="rail-scroll sticky top-[6.5rem] max-h-[calc(100vh-7.5rem)] overflow-y-auto pr-3">
            <UiSidebar />
          </div>
        </aside>
        <div className="min-w-0">
          <MobileUiSidebar />
          {children}
        </div>
      </div>
    </>
  );
}
