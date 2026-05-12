import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Avatar } from "@/components/avatar";
import { SettingsNav } from "./settings-nav";

/**
 * Settings shell.
 *
 * Auth gate lives here, not in proxy.ts: the auth doc explicitly
 * forbids putting full session lookups in middleware. Layouts run on
 * every request to a /settings/* route, which is exactly what we want.
 *
 * Anonymous users are redirected to /login with a `next` param so they
 * land back where they were trying to go. The login form already honors
 * `?next=`.
 */
export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login?next=/settings");
  }

  const u = session.user as typeof session.user & {
    username?: string | null;
  };
  const handle = u.username ?? u.name;

  return (
    <div className="grid gap-10 lg:grid-cols-[240px_1fr] items-start">
      <aside className="lg:sticky lg:top-24">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
          <Avatar src={u.image} label={handle} size={36} />
          <div className="flex flex-col min-w-0">
            <p className="text-xs text-dim">Signed in as</p>
            <p className="text-sm text-foreground truncate">@{handle}</p>
          </div>
        </div>
        <SettingsNav />
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
