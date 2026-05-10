import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UUID / ULID Generator",
  description:
    "Generate, validate, and inspect UUIDs (v1, v4, v7) and ULIDs entirely in your browser.",
};

export default function UuidLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
