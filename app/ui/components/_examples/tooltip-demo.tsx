import { Info } from "lucide-react";
import { Checkbox } from "@/registry/syntaqx/ui/checkbox";
import { Field, FieldLabel } from "@/registry/syntaqx/ui/field";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/registry/syntaqx/ui/tooltip";

export default function TooltipDemo() {
  return (
    <Field orientation="horizontal" className="w-auto">
      <Checkbox />
      <FieldLabel>Mangle names</FieldLabel>
      <Tooltip>
        <TooltipTrigger
          aria-label="More about Mangle names"
          className="relative inline-flex rounded-sm text-muted-foreground transition-colors outline-none after:absolute after:-inset-1 after:content-[''] hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Info className="size-4" />
        </TooltipTrigger>
        <TooltipContent className="max-w-56">
          Rename local variables and functions to shorter identifiers.
        </TooltipContent>
      </Tooltip>
    </Field>
  );
}
