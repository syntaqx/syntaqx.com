import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "/tools/convert/base64",
  "Base64 Decode / Encode",
  "Decode or encode Base64 strings directly in your browser: paste text or Base64 and convert instantly, with nothing ever sent to a server.",
);

export default function Base64Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
