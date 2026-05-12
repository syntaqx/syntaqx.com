import { ComingSoon, SettingsHeader } from "../_components";

export const metadata = { title: "Emails" };

export default function EmailsSettings() {
  return (
    <>
      <SettingsHeader
        title="Emails"
        description="Email addresses associated with your account."
      />
      <ComingSoon note="Today an account has a single email. Multi-email support is on the roadmap (see docs/architecture/auth.md)." />
    </>
  );
}
