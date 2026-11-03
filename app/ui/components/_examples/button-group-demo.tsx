import { ChevronDown } from "lucide-react";
import { Button } from "@/registry/syntaqx/ui/button";
import { ButtonGroup, ButtonGroupSeparator } from "@/registry/syntaqx/ui/button-group";

export default function ButtonGroupDemo() {
  return (
    <ButtonGroup aria-label="Merge">
      <Button>Squash and merge</Button>
      <ButtonGroupSeparator />
      <Button size="icon" aria-label="More merge options">
        <ChevronDown />
      </Button>
    </ButtonGroup>
  );
}
