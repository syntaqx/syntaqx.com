import { Input } from "@/registry/syntaqx/ui/input";

export default function InputStates() {
  return (
    <div className="grid w-full max-w-sm gap-3">
      <Input aria-label="Email" aria-invalid defaultValue="not-an-email" />
      <Input aria-label="Disabled" disabled placeholder="Disabled" />
      <Input aria-label="Attachment" type="file" />
    </div>
  );
}
