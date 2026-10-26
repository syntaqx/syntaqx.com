import { ToolsJsonLd } from "@/components/tools-json-ld";
import { ToolsNav } from "@/components/tools-nav";

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ToolsJsonLd />
      {children}
      <ToolsNav />
    </>
  );
}
