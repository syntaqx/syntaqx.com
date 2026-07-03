import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "whoami",
  description:
    "See how you appear on the internet: your IP, approximate location, browser, device, and the headers your requests quietly reveal about you.",
};

export default function WhoamiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
