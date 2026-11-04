import { Kbd, KbdGroup } from "@/registry/syntaqx/ui/kbd";

export default function KbdDemo() {
  return (
    <p className="flex items-center gap-2 text-sm text-muted-foreground">
      Search with
      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
      or <Kbd>/</Kbd>
    </p>
  );
}
