import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API",
  description: "Interactive API reference for the syntaqx API.",
};

export default function ApiDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
