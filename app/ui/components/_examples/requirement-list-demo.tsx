import { RequirementList } from "@/registry/syntaqx/ui/requirement-list";

export default function RequirementListDemo() {
  return (
    <RequirementList
      requirements={[
        { label: "At least 12 characters", met: true },
        { label: "A number", met: true },
        { label: "A lowercase letter", met: false },
        { label: "Not your username", met: false },
      ]}
    />
  );
}
