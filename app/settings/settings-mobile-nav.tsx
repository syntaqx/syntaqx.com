"use client";

import { useRouter, usePathname } from "next/navigation";
import { SETTINGS_SECTIONS } from "./_sections";

/**
 * Mobile section switcher. Renders as a native <select> for zero-cost
 * accessibility (screen readers, keyboard nav, mobile picker UI all
 * come for free) and to mirror GitHub's settings UX. The desktop
 * sidebar lives in `settings-nav.tsx`; this is shown only at < lg
 * breakpoints via the parent's responsive classes.
 */
export function SettingsMobileNav() {
  const router = useRouter();
  const pathname = usePathname();

  const current =
    SETTINGS_SECTIONS.find((s) => s.href === pathname)?.href ??
    "/settings/profile";

  return (
    <label className="flex flex-col gap-1.5 lg:hidden">
      <span className="text-[10px] font-medium uppercase tracking-widest text-dim">
        Section
      </span>
      <select
        value={current}
        onChange={(e) => router.push(e.target.value)}
        className="rounded-lg border border-border bg-surface/50 px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none cursor-pointer"
      >
        <optgroup label="Personal">
          {SETTINGS_SECTIONS.filter((s) => s.group === "personal").map((s) => (
            <option key={s.href} value={s.href}>
              {s.label}
              {!s.available ? " (soon)" : ""}
            </option>
          ))}
        </optgroup>
        <optgroup label="Access">
          {SETTINGS_SECTIONS.filter((s) => s.group === "access").map((s) => (
            <option key={s.href} value={s.href}>
              {s.label}
              {!s.available ? " (soon)" : ""}
            </option>
          ))}
        </optgroup>
      </select>
    </label>
  );
}
