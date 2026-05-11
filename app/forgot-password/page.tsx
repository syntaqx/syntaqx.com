import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-8 py-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <Image
          src="/brand.svg"
          alt="syntaqx"
          width={32}
          height={32}
          className="h-8 w-8"
        />
        <h1 className="text-lg font-semibold text-foreground">
          Reset your password
        </h1>
        <p className="text-xs text-dim">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <ForgotPasswordForm />

      <p className="text-center text-xs text-dim">
        Remembered it?{" "}
        <Link
          href="/login"
          className="text-muted hover:text-accent transition-colors"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
