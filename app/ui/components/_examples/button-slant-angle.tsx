import { Button } from "@/registry/syntaqx/ui/button";

export default function ButtonSlantAngle() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button shape="slant" variant="outline" className="[--button-slant:4deg]">
        4 degrees
      </Button>
      <Button shape="slant" variant="outline">
        Default angle
      </Button>
      <Button shape="slant" variant="outline" className="[--button-slant:20deg]">
        20 degrees
      </Button>
    </div>
  );
}
