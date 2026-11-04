import { ErrorSummary } from "@/registry/syntaqx/ui/error-summary";

export default function ErrorSummaryDemo() {
  return (
    <ErrorSummary
      className="max-w-md"
      errors={[
        { fieldId: "name", message: "Enter your name" },
        { fieldId: "email", message: "Enter an email address like you@example.com" },
      ]}
    />
  );
}
