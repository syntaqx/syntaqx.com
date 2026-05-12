"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/avatar";
import { FormError } from "@/components/auth/form-error";

const MAX_BYTES = 1 * 1024 * 1024;
const ACCEPT = "image/png,image/jpeg,image/gif,image/webp";

/**
 * Avatar uploader. Posts the file to /api/v1/me/avatar, which writes
 * to Vercel Blob and updates Better Auth's user.image. We refresh the
 * router on success so the layout's session-derived avatar (header
 * dropdown, settings sidebar) re-renders with the new URL.
 */
export function AvatarUploader({
  username,
  displayName,
  initialImage,
}: {
  username: string;
  displayName: string;
  initialImage: string | null;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | null>(initialImage);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<"upload" | "remove" | null>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    setError(null);

    if (file.size > MAX_BYTES) {
      setError("Image must be 1 MB or smaller.");
      return;
    }
    if (!ACCEPT.split(",").includes(file.type)) {
      setError("Use a PNG, JPEG, GIF, or WebP image.");
      return;
    }

    setPending("upload");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/v1/me/avatar", { method: "POST", body });
      if (!res.ok) {
        const msg = await res
          .json()
          .then((b) => b?.message)
          .catch(() => null);
        setError(msg ?? "Upload failed. Try again.");
        return;
      }
      const { url } = (await res.json()) as { url: string };
      setImage(url);
      router.refresh();
    } catch {
      setError("Upload failed. Check your connection and try again.");
    } finally {
      setPending(null);
    }
  }

  async function onRemove() {
    setError(null);
    setPending("remove");
    try {
      const res = await fetch("/api/v1/me/avatar", { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        const msg = await res
          .json()
          .then((b) => b?.message)
          .catch(() => null);
        setError(msg ?? "Could not remove picture.");
        return;
      }
      setImage(null);
      router.refresh();
    } catch {
      setError("Could not remove picture. Try again.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <FormError message={error} onDismiss={() => setError(null)} />}

      <div className="flex items-center gap-4">
        <Avatar src={image} label={username} size={80} alt={displayName} />
        <div className="flex flex-col gap-2">
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPT}
            onChange={onPick}
            className="hidden"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={pending !== null}
              className="inline-flex items-center justify-center rounded-lg border border-border bg-surface/50 px-3 py-1.5 text-xs text-foreground transition-colors hover:border-border-hover disabled:cursor-not-allowed disabled:opacity-60 enabled:cursor-pointer"
            >
              {pending === "upload" ? "Uploading…" : "Upload new picture"}
            </button>
            {image && (
              <button
                type="button"
                onClick={onRemove}
                disabled={pending !== null}
                className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs text-dim transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60 enabled:cursor-pointer"
              >
                {pending === "remove" ? "Removing…" : "Remove picture"}
              </button>
            )}
          </div>
          <p className="text-xs text-dim leading-relaxed">
            PNG, JPEG, GIF, or WebP. Max 1 MB.
          </p>
        </div>
      </div>
    </div>
  );
}
