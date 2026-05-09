import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Converters",
  description:
    "Browser-based conversion tools for text formats, images, and more.",
};

export default function ConvertLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
