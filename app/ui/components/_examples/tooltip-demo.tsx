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
          className="inline-flex text-muted-foreground transition-colors hover:text-foreground"
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
