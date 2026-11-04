import { Field, FieldDescription, FieldLabel } from "@/registry/syntaqx/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/registry/syntaqx/ui/select";

export default function SelectDemo() {
  return (
    <Field className="max-w-xs">
      <FieldLabel>Signing algorithm</FieldLabel>
      <Select defaultValue="HS256">
        <SelectTrigger className="w-full font-mono">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>HMAC</SelectLabel>
            <SelectItem value="HS256">HS256</SelectItem>
            <SelectItem value="HS512">HS512</SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Asymmetric</SelectLabel>
            <SelectItem value="RS256">RS256</SelectItem>
            <SelectItem value="ES256">ES256</SelectItem>
            <SelectItem value="EdDSA">EdDSA</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <FieldDescription>The label names the trigger; no extra wiring.</FieldDescription>
    </Field>
  );
}
