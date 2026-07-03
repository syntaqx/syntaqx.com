import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interactive API Reference",
  description:
    "Interactive API reference for the syntaqx API: browse endpoints, parameters, and responses, and try requests directly from your browser.",
};

export default function ApiDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
