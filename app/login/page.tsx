import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { SocialButtons } from "@/components/auth/social-buttons";
import { REGISTRATIONS_DISABLED } from "@/lib/flags";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
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
          Sign in to syntaqx
        </h1>
      </div>

      <LoginForm />

      <div className="relative flex items-center">
        <div className="flex-1 border-t border-border" />
        <span className="px-3 text-xs uppercase tracking-wider text-dim">
          or
        </span>
        <div className="flex-1 border-t border-border" />
      </div>

      <SocialButtons />

      {!REGISTRATIONS_DISABLED && (
        <p className="text-center text-xs text-dim">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-muted hover:text-accent transition-colors"
          >
            Sign up
          </Link>
        </p>
      )}
    </div>
  );
}
