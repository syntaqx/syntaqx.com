import { Bold, Italic } from "lucide-react";
import { Toggle } from "@/registry/syntaqx/ui/toggle";

export default function ToggleDemo() {
  return (
    <div className="flex items-center gap-2">
      <Toggle aria-label="Bold">
        <Bold />
      </Toggle>
      <Toggle variant="outline" aria-label="Italic">
        <Italic />
      </Toggle>
      <Toggle variant="outline" size="sm" defaultPressed>
        Word wrap
      </Toggle>
    </div>
  );
}
