import { SettingsHeader } from "../_components";
import { PasswordForm } from "./password-form";

export const metadata = { title: "Password & authentication" };

export default function PasswordSettings() {
  return (
    <>
      <SettingsHeader
        title="Password and authentication"
        description="Change your password. Two-factor and recovery codes are coming."
      />
      <PasswordForm />
    </>
  );
}
