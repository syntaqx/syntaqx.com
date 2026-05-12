import { ComingSoon, SettingsHeader } from "../_components";

export const metadata = { title: "Sessions" };

export default function SessionsSettings() {
  return (
    <>
      <SettingsHeader
        title="Sessions"
        description="Browsers and devices currently signed in to your account."
      />
      <ComingSoon note="List active sessions; revoke individually or all-but-current." />
    </>
  );
}
