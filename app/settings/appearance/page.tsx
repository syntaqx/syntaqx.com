import { ComingSoon, SettingsHeader } from "../_components";

export const metadata = { title: "Appearance" };

export default function AppearanceSettings() {
  return (
    <>
      <SettingsHeader
        title="Appearance"
        description="Theme, density, and display preferences."
      />
      <ComingSoon note="The header theme toggle works today; this page will surface it alongside other display options." />
    </>
  );
}
