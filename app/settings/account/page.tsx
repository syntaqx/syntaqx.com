import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SettingsHeader } from "../_components";
import { DeleteAccountForm } from "./delete-form";
import { UsernameForm } from "./username-form";
import { ModalSection } from "./modal-section";

export const metadata = { title: "Account" };

export default async function AccountSettings() {
  const session = await auth.api.getSession({ headers: await headers() });
  // Layout already gates, but TS doesn't know that.
  if (!session) redirect("/login?next=/settings/account");

  const user = session.user as typeof session.user & {
    username?: string | null;
    displayUsername?: string | null;
  };
  const handle = user.username ?? "";
  const displayHandle = user.displayUsername ?? handle;

  return (
    <>
      <SettingsHeader
        title="Account"
        description="Manage account-level controls."
      />

      <div className="flex flex-col gap-4">
        <ModalSection
          title="Change username"
          description="Your sign-in handle and the URL of your profile."
          buttonLabel="Change username"
          modalDescription={
            <>
              Your old handle{" "}
              <code className="text-foreground">@{displayHandle}</code> becomes
              available for someone else to claim, and inbound links to{" "}
              <code className="text-foreground">/{displayHandle}</code> will
              stop working.
            </>
          }
        >
          <UsernameForm initialUsername={displayHandle} />
        </ModalSection>

        <ModalSection
          title="Delete account"
          description="Permanently remove your account and all associated data. This cannot be undone."
          buttonLabel="Delete account"
          tone="danger"
          modalDescription="This permanently deletes your account, your personal organization, your avatar, and your sessions. It cannot be undone."
        >
          <DeleteAccountForm username={handle} />
        </ModalSection>
      </div>
    </>
  );
}
