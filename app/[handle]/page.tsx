import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { user, organization, member } from "@/lib/db/schema";
import { isReservedHandle } from "@/lib/reserved";
import { Avatar } from "@/components/avatar";

/**
 * Catch-all profile route: /<handle>
 *
 * Resolution order:
 *   1. If the handle is in the reserved list, 404. Static routes always
 *      win over this dynamic segment in Next's resolver, so reserved
 *      names should never reach here in practice — this is belt + braces
 *      against future routes that haven't been added to lib/reserved.ts.
 *   2. Lookup user by username AND org by slug in parallel.
 *   3. Personal orgs are auto-created with `slug == username`, so a
 *      hit on both is the normal case for a real user; prefer the user
 *      view in that case.
 *   4. Otherwise show whichever exists, or 404.
 *
 * Future tradeoff: nothing prevents a user-created org from claiming
 * a slug that matches another user's username. Today that path doesn't
 * exist (only auto-create-personal runs), so the collision can't
 * actually occur. When `orgClient.create` becomes user-facing, add a
 * cross-table uniqueness check at creation time.
 */

type ProfileSubject =
  | { kind: "user"; data: typeof user.$inferSelect }
  | {
      kind: "org";
      data: typeof organization.$inferSelect;
      memberCount: number;
    };

async function resolveHandle(handle: string): Promise<ProfileSubject | null> {
  if (isReservedHandle(handle)) return null;

  const lower = handle.toLowerCase();
  const [u, o] = await Promise.all([
    db.query.user.findFirst({ where: eq(user.username, lower) }),
    db.query.organization.findFirst({ where: eq(organization.slug, lower) }),
  ]);

  if (u) return { kind: "user", data: u };
  if (o) {
    const members = await db.query.member.findMany({
      where: eq(member.organizationId, o.id),
    });
    return { kind: "org", data: o, memberCount: members.length };
  }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const subject = await resolveHandle(handle);
  if (!subject) {
    return { title: "Not found", robots: { index: false } };
  }
  if (subject.kind === "user") {
    const display = subject.data.name || subject.data.username || handle;
    return {
      title: `@${subject.data.username ?? handle}`,
      description: `${display} on syntaqx`,
    };
  }
  return {
    title: subject.data.name,
    description: `${subject.data.name} is an organization on syntaqx`,
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const subject = await resolveHandle(handle);
  if (!subject) notFound();

  if (subject.kind === "user") {
    const u = subject.data;
    const display = u.name || u.username || handle;
    const joined = new Date(u.createdAt).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
    });
    return (
      <div className="mx-auto max-w-3xl py-8">
        <div className="flex items-start gap-6">
          <Avatar src={u.image} label={u.username ?? display} size={96} />
          <div className="flex flex-col gap-1.5 min-w-0">
            <h1 className="text-2xl font-bold text-foreground">{display}</h1>
            {u.username && <p className="text-sm text-muted">@{u.username}</p>}
            <p className="text-xs text-dim mt-3">Joined {joined}</p>
          </div>
        </div>
      </div>
    );
  }

  const o = subject.data;
  const joined = new Date(o.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
  });
  return (
    <div className="mx-auto max-w-3xl py-8">
      <div className="flex items-start gap-6">
        <Avatar src={o.logo} label={o.slug} size={96} />
        <div className="flex flex-col gap-1.5 min-w-0">
          <h1 className="text-2xl font-bold text-foreground">{o.name}</h1>
          <p className="text-sm text-muted">@{o.slug} · Organization</p>
          <p className="text-xs text-dim mt-3">
            {subject.memberCount} member{subject.memberCount === 1 ? "" : "s"} ·
            Created {joined}
          </p>
        </div>
      </div>
    </div>
  );
}
