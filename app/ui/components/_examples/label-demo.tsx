import { Input } from "@/registry/syntaqx/ui/input";
import { Label } from "@/registry/syntaqx/ui/label";

export default function LabelDemo() {
  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="label-demo-email">Email</Label>
      <Input id="label-demo-email" type="email" placeholder="you@example.com" />
    </div>
  );
}
