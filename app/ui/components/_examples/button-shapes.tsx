import { ArrowRight, Plus } from "lucide-react";
import { Button } from "@/registry/syntaqx/ui/button";

export default function ButtonShapes() {
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button>Default</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="secondary">Secondary</Button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button shape="slant">
          Slant <ArrowRight data-icon="inline-end" />
        </Button>
        <Button shape="slant" variant="outline">
          Outline
        </Button>
        <Button shape="slant" variant="secondary">
          Secondary
        </Button>
        <Button shape="slant" variant="destructive">
          Destructive
        </Button>
        <Button shape="slant" size="icon" variant="outline" aria-label="Add">
          <Plus />
        </Button>
      </div>
    </div>
  );
}
