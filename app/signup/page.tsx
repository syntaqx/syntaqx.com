import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import { SocialButtons } from "@/components/auth/social-buttons";

export const metadata: Metadata = {
  title: "Sign up",
  robots: { index: false, follow: false },
};

export default function SignupPage() {
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
