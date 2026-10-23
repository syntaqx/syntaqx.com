import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "/misc/convert/image-base64",
  "Image / Base64 Converter",
  "Convert images to Base64 data URIs and decode Base64 strings back into images, entirely in your browser: no uploads, no size limits, no server.",
);

export default function ImageBase64Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
