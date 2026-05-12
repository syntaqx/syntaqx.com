import { getSession } from "@/lib/session";
import { SettingsHeader } from "../_components";
import { ProfileForm } from "./profile-form";
import { AvatarUploader } from "./avatar-uploader";

export const metadata = { title: "Profile" };

export default async function ProfileSettings() {
  // Layout already gates on session; this re-fetch is for the initial
  // form values. Deduped with the layout call via React.cache so it's
  // one DB roundtrip per request, not two.
  const session = await getSession();
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
