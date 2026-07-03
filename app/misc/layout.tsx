import { MiscToolsNav } from "@/components/misc-tools-nav";

export default function MiscLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <MiscToolsNav />
    </>
  );
}
