import { Field, FieldDescription, FieldLabel } from "@/registry/syntaqx/ui/field";
import { Textarea } from "@/registry/syntaqx/ui/textarea";

export default function TextareaDemo() {
  return (
    <Field className="max-w-md">
      <FieldLabel>Message</FieldLabel>
      <Textarea placeholder="What's on your mind?" />
      <FieldDescription>Keep typing: it grows, then scrolls.</FieldDescription>
    </Field>
  );
}
