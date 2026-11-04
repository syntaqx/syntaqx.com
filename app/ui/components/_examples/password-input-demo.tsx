import { Field, FieldLabel } from "@/registry/syntaqx/ui/field";
import { PasswordInput } from "@/registry/syntaqx/ui/password-input";

export default function PasswordInputDemo() {
  return (
    <Field className="max-w-sm">
      <FieldLabel>Password</FieldLabel>
      <PasswordInput defaultValue="correct horse battery staple" />
    </Field>
  );
}
