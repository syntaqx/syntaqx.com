import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "/tools/secrets",
  "One-Time Secrets",
  "Share a password or token through a one-time link that expires. Encrypted in your browser with AES-256-GCM, so the server only holds ciphertext, deleted the moment it's read.",
);

export default function SecretsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
