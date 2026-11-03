import { UiJsonLd } from "@/components/ui-json-ld";
import { MobileUiSidebar, UiSidebar } from "@/components/ui-sidebar";

/** Every /ui page, the overview included, sits beside the same sidebar, like the docs. */
export default function UiLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="lg:grid lg:grid-cols-[248px_1fr] lg:gap-10">
      <UiJsonLd />
      <aside data-pagefind-ignore className="hidden lg:-my-12 lg:block">
        <div className="rail-scroll sticky top-12 h-[calc(100vh-3rem)] overflow-y-auto border-x border-border">
          <UiSidebar />
        </div>
      </aside>
      <div className="min-w-0">
        <MobileUiSidebar />
        {children}
      </div>
    </div>
  );
}
