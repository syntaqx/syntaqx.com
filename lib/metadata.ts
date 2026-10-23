import type { Metadata } from "next";

/** Title, description and the Open Graph fields that would otherwise fall back to the homepage's. */
export function pageMetadata(path: string, title: string, description: string): Metadata {
  return { title, description, openGraph: { title, description, url: path, siteName: "syntaqx", type: "website" } };
}
