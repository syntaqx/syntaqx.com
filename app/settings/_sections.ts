/**
 * Settings sections registry.
 *
 * Single source of truth for the sidebar in app/settings/layout.tsx
 * and any future cross-linking. Sections marked `available: false`
 * still render a real page (a "Coming soon" stub) so their URL is
 * never a 404 — the section just hasn't been built yet.
 *
 * Add a section here when you scaffold its page.
 */
export type SettingsSection = {
  href: string;
  label: string;
  available: boolean;
  group: "personal" | "access";
};

export const SETTINGS_SECTIONS: readonly SettingsSection[] = [
  {
    href: "/settings/profile",
    label: "Profile",
    available: true,
    group: "personal",
  },
  {
    href: "/settings/account",
    label: "Account",
    available: true,
    group: "personal",
  },
  {
    href: "/settings/appearance",
    label: "Appearance",
    available: false,
    group: "personal",
  },
  {
    href: "/settings/emails",
    label: "Emails",
    available: false,
    group: "access",
  },
  {
    href: "/settings/password",
    label: "Password & authentication",
    available: true,
    group: "access",
  },
  {
    href: "/settings/sessions",
    label: "Sessions",
    available: false,
    group: "access",
  },
  {
    href: "/settings/organizations",
    label: "Organizations",
    available: false,
    group: "access",
  },
  {
    href: "/settings/tokens",
    label: "Personal access tokens",
    available: false,
    group: "access",
  },
];
