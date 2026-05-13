import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image / Base64 Converter",
  description:
    "Convert images to Base64 data URIs and decode Base64 strings back into images, entirely in your browser.",
};

export default function ImageBase64Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
