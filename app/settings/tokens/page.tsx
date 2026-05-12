import { ComingSoon, SettingsHeader } from "../_components";

export const metadata = { title: "Personal access tokens" };

export default function TokensSettings() {
  return (
    <>
      <SettingsHeader
        title="Personal access tokens"
        description="Tokens for non-browser API access. Each token acts as you, with your permissions."
      />
      <ComingSoon note="First pass: a token is named, optionally expiring, and inherits the full set of permissions you have. Fine-grained per-token scopes come later. See docs/architecture/auth.md." />
    </>
  );
}
