"use client";

import { Analytics as VercelAnalytics } from "@vercel/analytics/react";

/**
 * Vercel Analytics without URL fragments: a /tools/secrets link carries its
 * decryption key after the #. The page strips it on load, but that races the
 * analytics script, so drop it here too.
 */
export function Analytics() {
  return <VercelAnalytics beforeSend={(event) => ({ ...event, url: event.url.split("#")[0] })} />;
}
