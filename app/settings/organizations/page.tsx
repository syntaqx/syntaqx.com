import { ComingSoon, SettingsHeader } from "../_components";

export const metadata = { title: "Organizations" };

export default function OrganizationsSettings() {
  return (
    <>
      <SettingsHeader
        title="Organizations"
        description="Organizations you belong to."
      />
      <ComingSoon note="Every account has a personal organization; teams come later." />
    </>
  );
}
