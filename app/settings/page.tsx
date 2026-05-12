import { redirect } from "next/navigation";

/**
 * /settings → /settings/profile
 *
 * Mirrors GitHub's behavior: the bare /settings URL doesn't render
 * anything of its own; it forwards to the first section.
 */
export default function SettingsIndex(): never {
  redirect("/settings/profile");
}
