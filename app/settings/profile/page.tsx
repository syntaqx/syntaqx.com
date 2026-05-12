import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { SettingsHeader } from "../_components";
import { ProfileForm } from "./profile-form";
import { AvatarUploader } from "./avatar-uploader";

export const metadata = { title: "Profile" };

export default async function ProfileSettings() {
  // Layout already gates on session; this re-fetch is for the initial
  // form values. Cheap (Postgres roundtrip) and avoids serializing the
  // whole session into a client component prop.
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user as
    | (NonNullable<typeof session>["user"] & {
        username?: string | null;
        image?: string | null;
      })
    | undefined;

  const name = user?.name ?? "";
  const handle = user?.username ?? "";
  const image = user?.image ?? null;

  return (
    <>
      <SettingsHeader
        title="Public profile"
        description="Information shown on your /@username page."
      />
      <div className="flex flex-col gap-8">
        <AvatarUploader
          username={handle || name || "user"}
          displayName={name || handle || "User"}
          initialImage={image}
        />
        <ProfileForm initialName={name} />
      </div>
    </>
  );
}
