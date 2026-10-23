import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "/misc/whoami",
  "whoami",
  "See how you appear on the internet: your IP, approximate location, browser, device, and the headers your requests quietly reveal about you.",
);

export default function WhoamiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
