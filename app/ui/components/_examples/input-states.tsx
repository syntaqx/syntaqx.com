import { Input } from "@/registry/syntaqx/ui/input";

export default function InputStates() {
  return (
    <div className="grid w-full max-w-sm gap-3">
      <Input aria-invalid defaultValue="not-an-email" />
      <Input disabled placeholder="Disabled" />
      <Input type="file" />
    </div>
  );
}
