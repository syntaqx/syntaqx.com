/**
 * Social sign-in provider registry.
 *
 * Adding a provider later: set `enabled: true` and (when wiring real
 * auth) add the OAuth credentials in the Better Auth server config.
 * Until then, providers render as inert buttons on /login.
 *
 * See: docs/architecture/auth.md
 */
export type SocialProvider = {
  id: "github" | "google";
  label: string;
  iconSlug: string;
  enabled: boolean;
};

export const SOCIAL_PROVIDERS: readonly SocialProvider[] = [
  {
    id: "github",
    label: "Continue with GitHub",
    iconSlug: "github",
    enabled: false,
  },
  {
    id: "google",
    label: "Continue with Google",
    iconSlug: "google",
    enabled: false,
  },
];
