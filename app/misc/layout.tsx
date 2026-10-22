import { MiscJsonLd } from "@/components/misc-json-ld";
import { MiscToolsNav } from "@/components/misc-tools-nav";

export default function MiscLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MiscJsonLd />
      {children}
      <MiscToolsNav />
    </>
  );
}
