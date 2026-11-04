import { Checkbox } from "@/registry/syntaqx/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/registry/syntaqx/ui/field";

export default function CheckboxDemo() {
  return (
    <FieldGroup className="max-w-sm gap-4">
      <Field orientation="horizontal">
        <Checkbox defaultChecked />
        <FieldLabel>Uppercase</FieldLabel>
      </Field>
      <Field orientation="horizontal">
        <Checkbox />
        <FieldContent>
          <FieldLabel>Each line separately</FieldLabel>
          <FieldDescription>Treat every line as its own value.</FieldDescription>
        </FieldContent>
      </Field>
      <Field orientation="horizontal" disabled>
        <Checkbox />
        <FieldLabel>Not available here</FieldLabel>
      </Field>
    </FieldGroup>
  );
}
