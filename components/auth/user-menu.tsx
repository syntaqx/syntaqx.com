"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  ChevronDown,
  LogOut,
  Settings as SettingsIcon,
  User as UserIcon,
} from "lucide-react";
import { Avatar } from "@/components/avatar";
import { signOut } from "@/lib/auth-client";

/**
 * GitHub-style user menu.
 *
 * Server passes the resolved identity (avoids a client-side fetch
 * round-trip for SSR'd HTML); this component owns the dropdown open
 * state, click-outside, Escape, and the sign-out action.
 *
 * Items intentionally only cover what's actually wired today:
 *
 *   - Header (avatar + name + @handle) → /<handle>
 *   - Profile               → /<handle>
 *   - Settings              → /settings
 *   - Sign out              → /api/auth/sign-out
 *
 * GitHub also surfaces Repositories, Stars, Gists, Sponsors, etc.
 * Adding those before the underlying features exist would lie about
 * what the product can do.
 */
export function UserMenu({
  username,
  displayName,
  image,
}: {
  username: string;
  displayName: string;
  image?: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        menuRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function onSignOut() {
    startTransition(async () => {
      await signOut();
      setOpen(false);
      router.push("/");
      router.refresh();
    });
  }

  const profileHref = `/${username}`;

  return (
    <div className="relative hidden sm:block">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open user menu"
        className="inline-flex items-center gap-1.5 rounded-full hover:opacity-80 transition-opacity cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <Avatar src={image} label={username} size={28} alt={displayName} />
        <ChevronDown size={12} className="text-dim" aria-hidden />
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-border bg-background shadow-lg overflow-hidden z-50"
        >
          <Link
            href={profileHref}
            onClick={() => setOpen(false)}
            role="menuitem"
            className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-surface transition-colors"
          >
            <Avatar src={image} label={username} size={28} alt={displayName} />
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-foreground truncate">
                {displayName}
              </span>
              <span className="text-[11px] text-dim truncate">@{username}</span>
            </div>
          </Link>

          <div className="border-t border-border py-0.5">
            <MenuLink
              href={profileHref}
              icon={<UserIcon size={13} />}
              onSelect={() => setOpen(false)}
            >
              Your profile
            </MenuLink>
            <MenuLink
              href="/settings"
              icon={<SettingsIcon size={13} />}
              onSelect={() => setOpen(false)}
            >
              Settings
            </MenuLink>
          </div>

          <div className="border-t border-border py-0.5">
            <button
              type="button"
              role="menuitem"
              onClick={onSignOut}
              disabled={pending}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-muted hover:bg-surface hover:text-foreground transition-colors disabled:opacity-60 enabled:cursor-pointer text-left"
            >
              <LogOut size={13} className="text-dim" aria-hidden />
              <span>{pending ? "Signing out…" : "Sign out"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  icon,
  onSelect,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onSelect}
      className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-muted hover:bg-surface hover:text-foreground transition-colors"
    >
      <span className="text-dim" aria-hidden>
        {icon}
      </span>
      <span>{children}</span>
    </Link>
  );
}
