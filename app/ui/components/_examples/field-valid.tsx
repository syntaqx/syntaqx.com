import { Field, FieldLabel, FieldValid } from "@/registry/syntaqx/ui/field";
import { Input } from "@/registry/syntaqx/ui/input";

export default function FieldValidDemo() {
  return (
    <Field className="max-w-sm">
      <FieldLabel>Promo code</FieldLabel>
      <Input defaultValue="LAUNCH20" />
      <FieldValid>20% off your first year</FieldValid>
    </Field>
  );
}
