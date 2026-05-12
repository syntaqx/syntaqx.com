import { ComingSoon, SettingsHeader } from "../_components";

export const metadata = { title: "Personal access tokens" };

export default function TokensSettings() {
  return (
    <>
      <SettingsHeader
        title="Personal access tokens"
        description="GitHub-style fine-grained tokens for non-browser API access."
      />
      <ComingSoon note="See docs/architecture/auth.md for the planned shape (named, scoped, optional expiry, target org)." />
    </>
  );
}
