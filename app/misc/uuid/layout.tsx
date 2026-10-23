import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "/misc/uuid",
  "UUID / ULID Generator",
  "Generate, validate, and inspect UUIDs (v1, v4, v7) and ULIDs entirely in your browser: copy-ready identifiers with no network round-trip.",
);

export default function UuidLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
