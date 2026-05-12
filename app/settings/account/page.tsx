import { ComingSoon, SettingsHeader } from "../_components";

export const metadata = { title: "Account" };

export default function AccountSettings() {
  return (
    <>
      <SettingsHeader
        title="Account"
        description="Username, account deletion, and other account-level controls."
      />
      <ComingSoon note="Change username, export data, delete account." />
    </>
  );
}
