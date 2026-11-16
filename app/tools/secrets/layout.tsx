import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "/tools/secrets",
  "One-Time Secrets",
  "Share a password, token or file through a one-time link that expires. Encrypted in your browser with AES-256-GCM; the server holds only ciphertext until read.",
);

export default function SecretsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
