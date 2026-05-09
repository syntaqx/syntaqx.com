import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "whoami",
  description:
    "See how you appear on the internet. IP, location, browser, device, and more.",
};

export default function WhoamiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
