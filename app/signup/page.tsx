import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import { SocialButtons } from "@/components/auth/social-buttons";
import { REGISTRATIONS_DISABLED } from "@/lib/flags";

export const metadata: Metadata = {
  title: "Sign up",
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  if (REGISTRATIONS_DISABLED) {
    return (
      <div className="mx-auto flex w-full max-w-sm flex-col gap-6 py-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <Image
            src="/brand.svg"
            alt="syntaqx"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <h1 className="text-lg font-semibold text-foreground">
            Registrations are closed
          </h1>
          <p className="text-sm text-muted leading-relaxed">
            New accounts aren&apos;t open to the public right now. If you
            already have one, you can sign in below.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-surface/50 px-4 text-sm text-foreground hover:border-border-hover transition-colors"
        >
          Sign in
        </Link>
      </div>
    );
  }

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
          Create your syntaqx account
        </h1>
      </div>

      <SocialButtons />

      <div className="relative flex items-center">
        <div className="flex-1 border-t border-border" />
        <span className="px-3 text-xs uppercase tracking-wider text-dim">
          or
        </span>
        <div className="flex-1 border-t border-border" />
      </div>

      <SignupForm />

      <p className="text-center text-xs text-dim">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-muted hover:text-accent transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
